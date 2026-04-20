import axios from "axios";
import dotenv from "dotenv";
import sequelize from "../../config/db.js";
import { redisClient } from "../../config/redis.js";
import NotFoundError from "../../errors/NotFoundError.js";
import {
  Branch,
  Cart,
  CartItem,
  Product,
  ProductVariant,
  UserAddress,
  VariantStock,
} from "../../models/index.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { Op } from "sequelize";
import { getCheckoutKey } from "../../utils/checkoutKey.js";
import { calculateDistance } from "../../utils/calculateDistance.js";
import { pickDefaultService } from "../../utils/ghnService.js";

dotenv.config();

const getAvailableServices = async (fromDistrictId, toDistrictId) => {
  const res = await axios.post(
    "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services",
    {
      from_district: fromDistrictId,
      to_district: toDistrictId,
      shop_id: Number(process.env.GHN_SHOP_ID_DEV),
    },
    {
      headers: {
        Token: process.env.GHN_TOKEN_DEV,
      },
    },
  );

  return res.data?.data || [];
};

const getLeadtimeService = async ({
  fromDistrictId,
  fromWardCode,
  toDistrictId,
  toWardCode,
  serviceId,
}) => {
  const res = await axios.post(
    "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime",
    {
      from_district_id: fromDistrictId,
      from_ward_code: fromWardCode,
      to_district_id: toDistrictId,
      to_ward_code: toWardCode,
      service_id: serviceId,
    },
    {
      headers: {
        Token: process.env.GHN_TOKEN_DEV,
        ShopId: Number(process.env.GHN_SHOP_ID_DEV),
      },
    },
  );

  const data = res.data?.data;

  return {
    leadtime: data?.leadtime,
    fromDate: data?.leadtime_order?.from_estimate_date,
    toDate: data?.leadtime_order?.to_estimate_date,
  };
};

const checkoutPreviewService = async (data) => {
  const { cartId, addressId, userId } = data;

  return sequelize.transaction(async (t) => {
    // ================= 1. LOAD CART =================
    const redisKey = getCheckoutKey({ userId, cartId });

    const existing = await redisClient.get(redisKey);
    let oldSession = existing ? JSON.parse(existing) : null;

    const cart = await Cart.findByPk(cartId, {
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: ProductVariant,
              as: "variant",
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["productName", "thumbnailUrl"],
                },
              ],
            },
          ],
        },
      ],
      transaction: t,
    });

    if (!cart) throw new NotFoundError("Cart not found");
    if (!cart.items.length) throw new BadRequestError("Cart is empty");

    // ================= 2. LOAD ADDRESS =================
    const address = await UserAddress.findByPk(addressId, {
      transaction: t,
    });

    const isSameAddress =
      oldSession &&
      oldSession.address?.districtId === address.districtId &&
      oldSession.address?.wardCode === address.wardCode;

    if (!address) throw new NotFoundError("Address not found");
    if (!address.latitude || !address.longitude) {
      throw new BadRequestError("Địa chỉ chưa có tọa độ");
    }

    // ================= 3. SUBTOTAL =================
    const subTotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.variant.price,
      0,
    );

    // ================= 4. LOAD BRANCH =================
    const branches = await Branch.findAll({
      where: { isActive: true },
      transaction: t,
    });

    if (!branches.length) {
      throw new NotFoundError("Không có chi nhánh nào hoạt động");
    }

    // ================= 5. DISTANCE =================
    const branchesWithDistance = branches
      .map((b) => ({
        ...b.toJSON(),
        distance: calculateDistance(
          address.latitude,
          address.longitude,
          b.latitude,
          b.longitude,
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    // ================= 6. LOAD STOCK =================
    const variantIds = cart.items.map((i) => i.variantId);

    const stocks = await VariantStock.findAll({
      where: { variantId: { [Op.in]: variantIds } },
      transaction: t,
    });

    const stockMap = {};
    for (const s of stocks) {
      if (!stockMap[s.branchId]) stockMap[s.branchId] = {};
      stockMap[s.branchId][s.variantId] = s.stock;
    }

    // ================= 7. TRY FULL BRANCH =================
    let bestBranch = null;

    for (const branch of branchesWithDistance) {
      const branchStock = stockMap[branch.id];
      if (!branchStock) continue;

      const canFulfill = cart.items.every((item) => {
        return (branchStock[item.variantId] || 0) >= item.quantity;
      });

      if (canFulfill) {
        bestBranch = branch;
        break;
      }
    }

    let selectedGroups = [];

    // ================= FULL FULFILL =================
    if (bestBranch) {
      const weight = cart.items.reduce(
        (sum, item) => sum + item.quantity * (item.variant.weight || 0),
        0,
      );

      selectedGroups = [
        {
          branchId: bestBranch.id,
          branchName: bestBranch.branchName,
          items: cart.items.map((i) => ({
            variantId: i.variantId,
            productName: i.variant.product.productName,
            thumbnail: i.variant.product.thumbnailUrl,
            color: i.variant.color,
            size: i.variant.size,
            material: i.variant.material,
            quantity: i.quantity,
            price: i.variant.price,
            lineTotal: i.quantity * i.variant.price,
          })),
          weight,
        },
      ];
    }

    // ================= SMART SPLIT =================
    if (!bestBranch) {
      const remaining = cart.items.map((i) => ({
        variantId: i.variantId,
        productName: i.variant.product.productName,
        thumbnail: i.variant.product.thumbnailUrl,
        color: i.variant.color,
        size: i.variant.size,
        material: i.variant.material,
        quantity: i.quantity,
        remaining: i.quantity,
        price: i.variant.price,
        weight: i.variant.weight || 0,
      }));

      const groupsMap = {};

      for (const item of remaining) {
        let need = item.remaining;

        const sortedBranches = [...branchesWithDistance].sort((a, b) => {
          const stockA = stockMap[a.id]?.[item.variantId] || 0;
          const stockB = stockMap[b.id]?.[item.variantId] || 0;

          if (stockB !== stockA) return stockB - stockA;
          return a.distance - b.distance;
        });

        for (const branch of sortedBranches) {
          if (need <= 0) break;

          const stock = stockMap[branch.id]?.[item.variantId] || 0;
          if (stock <= 0) continue;

          const take = Math.min(stock, need);

          if (!groupsMap[branch.id]) {
            groupsMap[branch.id] = {
              branchId: branch.id,
              branchName: branch.branchName,
              items: [],
              weight: 0,
            };
          }

          groupsMap[branch.id].items.push({
            variantId: item.variantId,
            productName: item.productName,
            thumbnail: item.thumbnail,
            color: item.color,
            size: item.size,
            material: item.material,
            quantity: take,
            price: item.price,
            lineTotal: take * item.price,
          });

          groupsMap[branch.id].weight += take * item.weight;

          need -= take;
        }

        if (need > 0) {
          throw new BadRequestError("Không đủ hàng trong hệ thống");
        }
      }

      selectedGroups = Object.values(groupsMap);
    }

    // ================= 8. FORMAT =================
    const groupsPreview = selectedGroups.map((g, index) => {
      const oldGroup = oldSession?.groups?.find(
        (og) => og.branchId === g.branchId,
      );

      return {
        groupId: index + 1,
        branchId: g.branchId,
        branchName: g.branchName,
        items: g.items,
        weight: g.weight,

        shippingFee: isSameAddress ? oldGroup?.shippingFee || null : null,
        leadtime: isSameAddress ? oldGroup?.leadtime || null : null,
        estimatedDelivery: isSameAddress
          ? oldGroup?.estimatedDelivery || { from: null, to: null }
          : { from: null, to: null },
      };
    });

    // ================= 9. REDIS SESSION =================

    const session = {
      cartId,
      address: {
        districtId: address.districtId,
        wardCode: address.wardCode,
      },
      groups: groupsPreview,
      subTotal,
      shippingFeeTotal: isSameAddress ? oldSession?.shippingFeeTotal || 0 : 0,
      serviceId: isSameAddress ? oldSession?.serviceId || null : null,
      discount: oldSession?.discount || { code: null, amount: 0 },
      isShippingCalculated: isSameAddress
        ? oldSession?.isShippingCalculated || false
        : false,
      total:
        subTotal +
        (isSameAddress ? oldSession?.shippingFeeTotal || 0 : 0) -
        (oldSession?.discount?.amount || 0),
      status: "PREVIEW",
    };

    await redisClient.set(redisKey, JSON.stringify(session), {
      EX: 1800,
    });

    return session;
  });
};

const calculateShippingService = async (data) => {
  const { userId, cartId } = data;

  const redisKey = getCheckoutKey({ userId, cartId });
  const raw = await redisClient.get(redisKey);

  if (!raw) throw new BadRequestError("Checkout session hết hạn");

  const session = JSON.parse(raw);

  if (session.isShippingCalculated) {
    return session;
  }

  const branchIds = session.groups.map((g) => g.branchId);

  const branches = await Branch.findAll({
    where: { id: branchIds },
  });

  const branchMap = {};
  branches.forEach((b) => (branchMap[b.id] = b));

  let totalShipping = 0;
  let serviceId = null;

  const updatedGroups = [];

  for (const group of session.groups) {
    const branch = branchMap[group.branchId];

    const weight = Math.max(100, Math.ceil(Number(group.weight || 0) * 1000));

    let shippingFee = 0;
    let leadtime = null;
    let estimatedDelivery = { from: null, to: null };

    try {
      // ===== SERVICE =====
      const services = await getAvailableServices(
        branch.districtId,
        session.address.districtId,
      );

      const selectedService = pickDefaultService(services);

      if (!selectedService) {
        throw new BadRequestError("Không có dịch vụ GHN");
      }

      serviceId = selectedService.service_id;

      // ===== LEADTIME =====
      const leadtimeData = await getLeadtimeService({
        fromDistrictId: branch.districtId,
        fromWardCode: branch.wardCode,
        toDistrictId: session.address.districtId,
        toWardCode: session.address.wardCode,
        serviceId: selectedService.service_id,
      });

      if (leadtimeData?.leadtime) {
        leadtime = leadtimeData.leadtime;
        estimatedDelivery = {
          from: leadtimeData.fromDate,
          to: leadtimeData.toDate,
        };
      }

      // ===== FEE =====
      const ghnRes = await axios.post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
        {
          service_id: selectedService.service_id,
          service_type_id: selectedService.service_type_id,
          from_district_id: branch.districtId,
          to_district_id: session.address.districtId,
          to_ward_code: session.address.wardCode,
          weight,
          length: 20,
          width: 20,
          height: 10,
        },
        {
          headers: {
            Token: process.env.GHN_TOKEN_DEV,
            ShopId: Number(process.env.GHN_SHOP_ID_DEV),
          },
        },
      );

      shippingFee = ghnRes.data.data.total;
    } catch (err) {
      console.log("GHN ERROR:", err.response?.data || err.message);

      // ===== FALLBACK =====
      shippingFee = 30000;

      const now = new Date();
      const future = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      leadtime = Math.floor(future.getTime() / 1000);
      estimatedDelivery = {
        from: now.toISOString(),
        to: future.toISOString(),
      };
    }

    totalShipping += shippingFee;

    updatedGroups.push({
      ...group,
      shippingFee,
      leadtime,
      estimatedDelivery,
    });
  }

  // ===== UPDATE SESSION =====
  session.groups = updatedGroups;
  session.shippingFeeTotal = totalShipping;
  session.serviceId = serviceId;
  session.isShippingCalculated = true;

  session.total =
    session.subTotal + totalShipping - (session.discount?.amount || 0);

  await redisClient.set(redisKey, JSON.stringify(session), { EX: 1800 });

  return session;
};

const clearCheckoutSessionService = async (data) => {
  const { userId, cartId } = data;
  const redisKey = getCheckoutKey({ userId, cartId });
  await redisClient.del(redisKey);
};

const orderService = {
  checkoutPreviewService,
  calculateShippingService,
  clearCheckoutSessionService,
};

export default orderService;
