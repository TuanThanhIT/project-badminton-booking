import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import sequelize from "../../config/db.js";
import { redisClient } from "../../config/redis.js";
import NotFoundError from "../../errors/NotFoundError.js";
import {
  Branch,
  Cart,
  CartItem,
  Order,
  OrderDetail,
  OrderShippingLog,
  Payment,
  Product,
  ProductVariant,
  User,
  UserAddress,
  UserOtp,
  VariantStock,
  Wallet,
  WalletTransaction,
  OrderGroup,
} from "../../models/index.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { Op, where } from "sequelize";
import { getCheckoutKey } from "../../utils/checkoutKey.js";
import { calculateDistance } from "../../utils/calculateDistance.js";
import { pickDefaultService } from "../../utils/ghnService.js";
import {
  ORDER_GROUP_STATUS,
  ORDER_STATUS,
  SHIPPING_STATUS,
  SHIPPING_TRACKING_LABEL,
} from "../../constants/orderConstant.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
  TARGET_PAYMENT_TYPE,
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from "../../constants/paymentConstant.js";
import { verifyVNPayURL } from "../../utils/handleVNPayURL.js";
import { formatOrderItemCode } from "../../utils/displayCode.js";
import { VnpLocale, VNPay } from "vnpay";
import {
  createVNPayDateRange,
  logVNPayDiagnostics,
} from "../../utils/vnpayDate.js";
import { OTP_TYPE } from "../../constants/userConstant.js";
import {
  getAvailableServices,
  getLeadtimeService,
} from "../shared/ghnService.js";
import { applyDiscountUsage } from "../shared/applyDiscountUsage.js";
import ForbiddenError from "../../errors/ForbiddenError.js";
import { syncOrderStatus } from "../../utils/orderMapper.js";
import {
  getDisplayStatus,
  mapGHNStatusToSystem,
} from "../../utils/shippingMapper.js";
import { REVIEW_STATUS } from "../../constants/reviewConstant.js";
import { emitOrderActionRealtime } from "../shared/emitRealtime.js";
import { CANCELLED_BY } from "../../constants/bookingConstant.js";
import { sendBranchStaffNotification } from "../../helpers/notification.js";

const normalizeCartItemIds = (cartItemIds = []) => [
  ...new Set(cartItemIds.map((id) => Number(id)).filter(Boolean)),
];

const normalizeBuyNowItem = (item) => {
  if (!item) return null;
  const variantId = Number(item.variantId);
  const quantity = Number(item.quantity);
  if (!variantId || !quantity) return null;
  return { variantId, quantity };
};

const deleteSelectedCartItems = async ({
  cartId,
  cartItemIds,
  transaction,
}) => {
  const selectedIds = normalizeCartItemIds(cartItemIds);
  if (!selectedIds.length) return;

  await CartItem.destroy({
    where: {
      id: { [Op.in]: selectedIds },
      cartId,
    },
    transaction,
  });

  const remainingItems = await CartItem.findAll({
    where: { cartId },
    attributes: ["subTotal"],
    transaction,
  });

  const totalAmount = remainingItems.reduce(
    (sum, item) => sum + Number(item.subTotal || 0),
    0,
  );

  await Cart.update({ totalAmount }, { where: { id: cartId }, transaction });
};

const checkoutPreviewService = async (data) => {
  const { cartId, addressId, userId } = data;
  const selectedCartItemIds = normalizeCartItemIds(data.cartItemIds);
  const buyNowItem = normalizeBuyNowItem(data.buyNowItem);
  const checkoutMode = buyNowItem ? "BUY_NOW" : "CART";

  return sequelize.transaction(async (t) => {
    const redisKey = getCheckoutKey({ userId, cartId });

    const existing = await redisClient.get(redisKey);
    let oldSession = existing ? JSON.parse(existing) : null;

    // ================= 1. LOAD CART =================
    const cart = await Cart.findOne({
      where: { id: cartId, userId },
      include: buyNowItem
        ? []
        : [
            {
              model: CartItem,
              as: "items",
              where: { id: { [Op.in]: selectedCartItemIds } },
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

    if (!cart) throw new NotFoundError("Giỏ hàng không tồn tại");

    let checkoutItems = [];

    if (buyNowItem) {
      const variant = await ProductVariant.findByPk(buyNowItem.variantId, {
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["productName", "thumbnailUrl"],
          },
        ],
        transaction: t,
      });

      if (!variant) throw new NotFoundError("Sản phẩm không tồn tại");

      checkoutItems = [
        {
          variantId: variant.id,
          quantity: buyNowItem.quantity,
          variant,
        },
      ];
    } else {
      if (!cart.items.length)
        throw new BadRequestError("Vui lòng chọn sản phẩm để thanh toán");

      if (cart.items.length !== selectedCartItemIds.length) {
        throw new BadRequestError(
          "Một số sản phẩm đã chọn không còn trong giỏ hàng",
        );
      }

      checkoutItems = cart.items;
    }

    // ================= 2. ADDRESS =================
    const address = await UserAddress.findByPk(addressId, {
      transaction: t,
    });

    if (!address) throw new NotFoundError("Địa chỉ không tồn tại");
    if (!address.latitude || !address.longitude) {
      throw new BadRequestError("Địa chỉ chưa có tọa độ");
    }

    const oldCartItemIds = normalizeCartItemIds(oldSession?.cartItemIds || []);
    const oldBuyNowItem = normalizeBuyNowItem(oldSession?.buyNowItem);
    const isSameSelection =
      oldSession?.checkoutMode === checkoutMode &&
      (buyNowItem
        ? oldBuyNowItem?.variantId === buyNowItem.variantId &&
          oldBuyNowItem?.quantity === buyNowItem.quantity
        : oldCartItemIds.length === selectedCartItemIds.length &&
          oldCartItemIds.every((id) => selectedCartItemIds.includes(id)));

    const isSameAddress =
      oldSession &&
      isSameSelection &&
      oldSession.address?.districtId === address.districtId &&
      oldSession.address?.wardCode === address.wardCode;

    // ================= 3. SUBTOTAL =================
    const subTotal = checkoutItems.reduce(
      (sum, item) =>
        sum +
        item.quantity *
          (item.variant.price * (1 - (item.variant.discount || 0) / 100)),
      0,
    );

    // ================= 4. BRANCH =================
    const branches = await Branch.findAll({
      where: { isActive: true },
      transaction: t,
    });

    if (!branches.length) {
      throw new NotFoundError("Không có chi nhánh nào hoạt động");
    }

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

    // ================= 5. STOCK =================
    const variantIds = checkoutItems.map((i) => i.variantId);

    const stocks = await VariantStock.findAll({
      where: { variantId: { [Op.in]: variantIds } },
      transaction: t,
    });

    const stockMap = {};
    for (const s of stocks) {
      if (!stockMap[s.branchId]) stockMap[s.branchId] = {};
      stockMap[s.branchId][s.variantId] = s.stock;
    }

    // ================= 6. FIND BEST =================
    let bestBranch = null;

    for (const branch of branchesWithDistance) {
      const branchStock = stockMap[branch.id];
      if (!branchStock) continue;

      const canFulfill = checkoutItems.every(
        (item) => (branchStock[item.variantId] || 0) >= item.quantity,
      );

      if (canFulfill) {
        bestBranch = branch;
        break;
      }
    }

    let selectedOrders = [];

    // ================= FULL =================
    if (bestBranch) {
      const weight = checkoutItems.reduce(
        (sum, item) => sum + item.quantity * (item.variant.weight || 0),
        0,
      );

      selectedOrders = [
        {
          branchId: bestBranch.id,
          branchName: bestBranch.branchName,
          weight,
          items: checkoutItems.map((i) => ({
            variantId: i.variantId,
            productName: i.variant.product.productName,
            thumbnail: i.variant.product.thumbnailUrl,
            color: i.variant.color,
            size: i.variant.size,
            material: i.variant.material,
            quantity: i.quantity,
            price: i.variant.price * (1 - (i.variant.discount || 0) / 100),
            lineTotal:
              i.quantity *
              (i.variant.price * (1 - (i.variant.discount || 0) / 100)),
          })),
        },
      ];
    }

    // ================= SPLIT =================
    if (!bestBranch) {
      const remaining = checkoutItems.map((i) => ({
        variantId: i.variantId,
        productName: i.variant.product.productName,
        thumbnail: i.variant.product.thumbnailUrl,
        color: i.variant.color,
        size: i.variant.size,
        material: i.variant.material,
        remaining: i.quantity,
        price: i.variant.price * (1 - (i.variant.discount || 0) / 100),
        weight: i.variant.weight || 0,
      }));

      const ordersMap = {};

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

          if (!ordersMap[branch.id]) {
            ordersMap[branch.id] = {
              branchId: branch.id,
              branchName: branch.branchName,
              items: [],
              weight: 0,
            };
          }

          ordersMap[branch.id].items.push({
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

          ordersMap[branch.id].weight += take * item.weight;

          need -= take;
        }

        if (need > 0) {
          throw new BadRequestError("Không đủ hàng trong hệ thống");
        }
      }

      selectedOrders = Object.values(ordersMap);
    }

    // ================= 7. FORMAT =================
    const ordersPreview = selectedOrders.map((o, index) => {
      const oldOrder = oldSession?.group?.orders?.find(
        (oo) => oo.branchId === o.branchId,
      );

      return {
        orderTempId: index + 1,
        branchId: o.branchId,
        branchName: o.branchName,
        items: o.items,
        weight: o.weight,

        shippingFee: isSameAddress ? oldOrder?.shippingFee || null : null,
        serviceId: isSameAddress ? oldOrder?.serviceId || null : null,
        leadtime: isSameAddress ? oldOrder?.leadtime || null : null,
        estimatedDelivery: isSameAddress
          ? oldOrder?.estimatedDelivery || { from: null, to: null }
          : { from: null, to: null },
      };
    });

    // ================= 8. GROUP =================
    const group = {
      groupId: 1,
      orders: ordersPreview,

      subTotal,
      shippingFeeTotal: isSameAddress
        ? oldSession?.group?.shippingFeeTotal || 0
        : 0,

      serviceId: isSameAddress ? oldSession?.group?.serviceId || null : null,

      discount: isSameSelection
        ? oldSession?.group?.discount || {
            id: null,
            code: null,
            amount: 0,
          }
        : {
            id: null,
            code: null,
            amount: 0,
          },

      total:
        subTotal +
        (isSameAddress ? oldSession?.group?.shippingFeeTotal || 0 : 0) -
        (isSameSelection ? oldSession?.group?.discount?.amount || 0 : 0),
    };

    // ================= 9. SAVE =================
    const session = {
      cartId,
      cartItemIds: selectedCartItemIds,
      buyNowItem,
      checkoutMode,
      address: {
        addressId: address.id,
        districtId: address.districtId,
        wardCode: address.wardCode,
      },
      group,
      isShippingCalculated: isSameAddress
        ? oldSession?.isShippingCalculated || false
        : false,
      status: "PREVIEW",
    };

    await redisClient.set(redisKey, JSON.stringify(session), "EX", 1800);

    return session;
  });
};

const calculateShippingService = async (data) => {
  const { userId, cartId } = data;

  const redisKey = getCheckoutKey({ userId, cartId });
  const raw = await redisClient.get(redisKey);

  if (!raw) throw new BadRequestError("Checkout session h?t h?n");

  const session = JSON.parse(raw);

  if (session.isShippingCalculated) {
    return session;
  }

  const branchIds = session.group.orders.map((o) => o.branchId);

  const branches = await Branch.findAll({
    where: { id: branchIds },
  });

  const branchMap = {};
  branches.forEach((b) => (branchMap[b.id] = b));

  let totalShipping = 0;
  let serviceId = null;

  const updatedOrders = [];

  for (const order of session.group.orders) {
    const branch = branchMap[order.branchId];

    const weight = Math.max(100, Math.ceil(Number(order.weight || 0) * 1000));

    let shippingFee = 0;
    let leadtime = null;
    let estimatedDelivery = { from: null, to: null };

    try {
      // ===== SERVICE =====
      const services = await getAvailableServices({
        fromDistrictId: branch.districtId,
        toDistrictId: session.address.districtId,
        ghnShopId: branch.ghnShopId,
      });

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
        ghnShopId: branch.ghnShopId,
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
            ShopId: branch.ghnShopId,
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

    updatedOrders.push({
      ...order,
      shippingFee,
      serviceId,
      leadtime,
      estimatedDelivery,
    });
  }

  // ===== UPDATE SESSION =====
  session.group.orders = updatedOrders;
  session.group.shippingFeeTotal = totalShipping;
  session.group.serviceId = serviceId;
  session.isShippingCalculated = true;

  session.group.total =
    session.group.subTotal +
    totalShipping -
    (session.group.discount?.amount || 0);

  await redisClient.set(redisKey, JSON.stringify(session), "EX", 1800);

  return session;
};

const clearCheckoutSessionService = async (data) => {
  const { userId, cartId } = data;
  const redisKey = getCheckoutKey({ userId, cartId });
  await redisClient.del(redisKey);
};

const getCheckoutPreviewService = async (userId, cartId) => {
  const redisKey = getCheckoutKey({ userId, cartId });
  const raw = await redisClient.get(redisKey);
  if (!raw) throw new BadRequestError("Checkout session h?t h?n");
  const session = JSON.parse(raw);
  return session;
};

const activateOrderGroupForFulfillment = async ({
  orderGroupId,
  transaction,
}) => {
  const orderGroup = await OrderGroup.findByPk(orderGroupId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!orderGroup) {
    throw new NotFoundError("Đơn hàng không tồn tại");
  }

  if (orderGroup.status === ORDER_GROUP_STATUS.PAID) {
    return orderGroup;
  }

  const orders = await Order.findAll({
    where: { orderGroupId },
    include: [
      {
        model: OrderDetail,
        as: "details",
      },
      {
        model: Branch,
        as: "branch",
      },
    ],
    transaction,
  });

  for (const order of orders) {
    for (const item of order.details || []) {
      const stock = await VariantStock.findOne({
        where: {
          branchId: order.branchId,
          variantId: item.variantId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!stock || stock.stock < item.quantity) {
        throw new BadRequestError("Cửa hàng không đủ số lượng");
      }

      stock.stock -= item.quantity;
      await stock.save({ transaction });
    }
  }

  if (!orderGroup.isDiscountApplied && orderGroup.discountId) {
    await applyDiscountUsage(orderGroup.discountId, transaction);
    await orderGroup.update({ isDiscountApplied: true }, { transaction });
  }

  await orderGroup.update({ status: ORDER_GROUP_STATUS.PAID }, { transaction });

  for (const order of orders) {
    await sendBranchStaffNotification(
      order.branchId,
      "order-created",
      "Có đơn hàng mới",
      `${order.branch?.branchName || "Chi nhánh"}: đơn hàng ${formatOrderItemCode(order.id)} vừa được khách đặt và đang chờ xử lý.`,
      { transaction },
    );
  }

  return orderGroup;
};

const PAYMENT_RETRY_WINDOW_MS = 15 * 60 * 1000;

const assertRetryWindowOpen = (createdAt) => {
  const createdTime = new Date(createdAt).getTime();
  if (!createdTime || Date.now() - createdTime > PAYMENT_RETRY_WINDOW_MS) {
    throw new BadRequestError("Đã hết thời gian thanh toán lại");
  }
};

const buildOrderVNPayUrl = ({ orderGroup, payment, ip }) => {
  const vnpay = new VNPay({
    tmnCode: process.env.VNP_TMN_CODE,
    secureSecret: process.env.VNP_HASH_SECRET,
    vnpayHost: process.env.VNP_URL,
    testMode: true,
    hashAlgorithm: "SHA512",
  });

  const { createDate, expireDate } = createVNPayDateRange({
    expiresInMs: PAYMENT_RETRY_WINDOW_MS,
  });

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: payment.paymentAmount,
    vnp_IpAddr: ip,
    vnp_TxnRef: payment.externalId,
    vnp_OrderInfo: `order_${orderGroup.id}`,
    vnp_OrderType: "order",
    vnp_ReturnUrl: process.env.VNP_RETURN_URL,
    vnp_Locale: VnpLocale.VN,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  });

  logVNPayDiagnostics({
    context: "order",
    createDate,
    expireDate,
    paymentUrl,
  });

  return paymentUrl;
};

const createOrderService = async (data) => {
  const { cartId, addressId, paymentMethod, note, userId, ip } = data;
  const selectedCartItemIds = normalizeCartItemIds(data.cartItemIds);
  const buyNowItem = normalizeBuyNowItem(data.buyNowItem);
  const checkoutMode = buyNowItem ? "BUY_NOW" : "CART";

  return sequelize.transaction(async (t) => {
    const preview = await getCheckoutPreviewService(userId, cartId);

    const previewCartItemIds = normalizeCartItemIds(preview.cartItemIds);
    const previewBuyNowItem = normalizeBuyNowItem(preview.buyNowItem);
    const isSameSelection =
      preview.checkoutMode === checkoutMode &&
      (buyNowItem
        ? previewBuyNowItem?.variantId === buyNowItem.variantId &&
          previewBuyNowItem?.quantity === buyNowItem.quantity
        : selectedCartItemIds.length === previewCartItemIds.length &&
          selectedCartItemIds.every((id) => previewCartItemIds.includes(id)));

    if (!isSameSelection) {
      throw new BadRequestError("Danh sách sản phẩm checkout đã thay đổi");
    }

    const address = await UserAddress.findByPk(addressId, { transaction: t });
    if (!address) throw new NotFoundError("Địa chỉ không tồn tại");

    // ================= ORDER GROUP =================
    const orderGroup = await OrderGroup.create(
      {
        userId,
        totalAmount: preview.group.subTotal,
        totalShippingFee: preview.group.shippingFeeTotal,
        discountId: preview.group.discount.id,
        discountAmount: preview.group.discount.amount,
        finalAmount: preview.group.total,
        status: ORDER_GROUP_STATUS.PENDING_PAYMENT,
        note,
      },
      { transaction: t },
    );

    // ================= CREATE ORDERS =================
    for (const o of preview.group.orders) {
      const subtotal = o.items.reduce((s, i) => s + i.lineTotal, 0);
      const order = await Order.create(
        {
          orderGroupId: orderGroup.id,
          branchId: o.branchId,

          subtotal,
          shippingFee: o.shippingFee || 0,
          totalAmount: subtotal + (o.shippingFee || 0),

          shippingName: address.fullName,
          shippingPhone: address.phoneNumber,
          shippingAddress: `${address.address}, ${address.wardName}, ${address.districtName}, ${address.provinceName}`,
          shippingDistrictId: address.districtId,
          shippingWardCode: address.wardCode,

          shippingWeight: o.weight,
          shippingServiceId: o.serviceId || preview.group.serviceId,
          orderStatus: ORDER_STATUS.PENDING,
        },
        { transaction: t },
      );

      for (const item of o.items) {
        await OrderDetail.create(
          {
            orderId: order.id,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.price,
            productName: item.productName,
            variantInfo: `size: ${item.size}, color: ${item.color}, material: ${item.material}`,
          },
          { transaction: t },
        );
      }
    }

    // ================= PAYMENT =================

    let result = {
      orderGroupId: orderGroup.id,
      amount: orderGroup.finalAmount,
      cartId,
      cartItemIds: selectedCartItemIds,
      buyNowItem,
    };

    // COD
    if (paymentMethod === PAYMENT_METHOD_STATUS.COD) {
      await Payment.create(
        {
          targetPaymentType: TARGET_PAYMENT_TYPE.ORDER,
          targetPaymentId: orderGroup.id,
          paymentAmount: orderGroup.finalAmount,
          paymentMethod: PAYMENT_METHOD_STATUS.COD,
          paymentStatus: PAYMENT_STATUS.PENDING,
        },
        { transaction: t },
      );

      await activateOrderGroupForFulfillment({
        orderGroupId: orderGroup.id,
        transaction: t,
      });

      if (checkoutMode === "CART") {
        await deleteSelectedCartItems({
          cartId,
          cartItemIds: selectedCartItemIds,
          transaction: t,
        });
      }
    }

    // WALLET
    if (paymentMethod === PAYMENT_METHOD_STATUS.WALLET) {
      const wallet = await Wallet.findOne({
        where: { userId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!wallet) throw new NotFoundError("Ví không tồn tại");

      // tính available
      const pendingAmount = await WalletTransaction.sum("amount", {
        where: {
          walletId: wallet.id,
          status: WALLET_TRANSACTION_STATUS.PENDING,
        },
        transaction: t,
      });

      const available = Number(wallet.balance) - Number(pendingAmount || 0);

      if (available < orderGroup.finalAmount) {
        throw new BadRequestError("Số dư không đủ");
      }

      const payment = await Payment.create(
        {
          targetPaymentType: TARGET_PAYMENT_TYPE.ORDER,
          targetPaymentId: orderGroup.id,
          paymentAmount: orderGroup.finalAmount,
          paymentMethod: PAYMENT_METHOD_STATUS.WALLET,
          paymentStatus: PAYMENT_STATUS.PENDING,
        },
        { transaction: t },
      );

      // lock ti?n b?ng transaction
      await WalletTransaction.create(
        {
          walletId: wallet.id,
          paymentId: payment.id,
          amount: orderGroup.finalAmount,
          type: WALLET_TRANSACTION_TYPE.PAYMENT,
          status: WALLET_TRANSACTION_STATUS.PENDING,
          expiredAt: new Date(Date.now() + 10 * 60 * 1000),
          description: `Thanh toán đơn #${orderGroup.id}`,
        },
        { transaction: t },
      );

      if (checkoutMode === "CART") {
        await redisClient.set(
          `order_cart_cleanup:${orderGroup.id}`,
          JSON.stringify({ cartId, cartItemIds: selectedCartItemIds }),
          "EX",
          24 * 60 * 60,
        );
      }
    }

    // VNPay (return URL)
    if (paymentMethod === PAYMENT_METHOD_STATUS.VNPAY) {
      const txnRef = uuidv4();

      const payment = await Payment.create(
        {
          paymentAmount: orderGroup.finalAmount,
          paymentMethod: PAYMENT_METHOD_STATUS.VNPAY,
          paymentStatus: PAYMENT_STATUS.PENDING,
          targetPaymentType: TARGET_PAYMENT_TYPE.ORDER,
          targetPaymentId: orderGroup.id,
          externalId: txnRef,
        },
        { transaction: t },
      );

      if (checkoutMode === "CART") {
        await redisClient.set(
          `order_cart_cleanup:${txnRef}`,
          JSON.stringify({ cartId, cartItemIds: selectedCartItemIds }),
          "EX",
          24 * 60 * 60,
        );
      }

      result.paymentUrl = await buildOrderVNPayUrl({
        orderGroup,
        payment,
        ip,
      });
    }

    // clear session
    await clearCheckoutSessionService({ userId, cartId });

    return result;
  });
};

const orderCallbackService = async (data) => {
  // 1. verify ngoài
  const isValid = verifyVNPayURL(data);
  if (!isValid) {
    throw new BadRequestError("Chữ ký không hợp lệ");
  }

  const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_Amount } = data;

  if (vnp_ResponseCode !== "00") {
    throw new BadRequestError("Thanh toán thất bại");
  }

  // 2. query trước (KHÔNG lock)
  const paymentRaw = await Payment.findOne({
    where: { externalId: vnp_TxnRef },
  });

  if (!paymentRaw) {
    throw new NotFoundError("Thanh toán không tồn tại");
  }

  // idempotent s?m
  if (paymentRaw.paymentStatus === PAYMENT_STATUS.PAID) {
    return;
  }

  const paidAmount = Math.round(Number(vnp_Amount) / 100);
  const expectedAmount = Math.round(Number(paymentRaw.paymentAmount));

  if (paidAmount !== expectedAmount) {
    throw new BadRequestError("Số tiền không hợp lệ");
  }

  // 3. transaction
  return sequelize.transaction(async (t) => {
    // 1. lock payment
    const payment = await Payment.findByPk(paymentRaw.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (payment.paymentStatus === PAYMENT_STATUS.PAID) {
      return;
    }

    // 2. lock orderGroup
    const orderGroup = await OrderGroup.findByPk(payment.targetPaymentId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!orderGroup) {
      throw new NotFoundError("Đơn hàng không tồn tại");
    }

    await activateOrderGroupForFulfillment({
      orderGroupId: orderGroup.id,
      transaction: t,
    });

    await payment.update(
      {
        paymentStatus: PAYMENT_STATUS.PAID,
        transId: vnp_TransactionNo,
        paidAt: new Date(),
      },
      { transaction: t },
    );

    const cleanupRaw = await redisClient.get(
      `order_cart_cleanup:${vnp_TxnRef}`,
    );
    if (cleanupRaw) {
      const cleanup = JSON.parse(cleanupRaw);
      await deleteSelectedCartItems({
        cartId: cleanup.cartId,
        cartItemIds: cleanup.cartItemIds,
        transaction: t,
      });
      await redisClient.del(`order_cart_cleanup:${vnp_TxnRef}`);
    }
  });
};

const walletOrderConfirmService = async (data) => {
  const { otpCode, email, orderGroupId } = data;

  const user = await User.findOne({ where: { email } });
  if (!user) throw new NotFoundError("Người dùng không tồn tại");

  const otpCodeHash = crypto.createHash("sha256").update(otpCode).digest("hex");

  // lấy OTP ngoài
  const userOtp = await UserOtp.findOne({
    where: {
      userId: user.id,
      type: OTP_TYPE.WALLET_PAYMENT,
      isUsed: false,
    },
    order: [["createdAt", "DESC"]],
  });

  if (!userOtp) throw new BadRequestError("OTP không tồn tại");

  if (userOtp.otpExpiry < new Date()) {
    throw new BadRequestError("OTP h?t h?n");
  }

  if (userOtp.otpCode !== otpCodeHash) {
    await UserOtp.update(
      {
        attempts: sequelize.literal("attempts + 1"),
        isUsed: sequelize.literal(
          "CASE WHEN attempts + 1 >= 5 THEN true ELSE isUsed END",
        ),
      },
      { where: { id: userOtp.id } },
    );

    throw new BadRequestError("OTP không đúng");
  }

  // transaction
  return sequelize.transaction(async (t) => {
    // 1. lock wallet
    const wallet = await Wallet.findOne({
      where: { userId: user.id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!wallet) throw new NotFoundError("Ví không tồn tại");

    // 2. lock payment
    const payment = await Payment.findOne({
      where: {
        targetPaymentType: TARGET_PAYMENT_TYPE.ORDER,
        targetPaymentId: orderGroupId,
        paymentStatus: PAYMENT_STATUS.PENDING,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!payment) throw new NotFoundError("Thanh toán không tồn tại");

    // 3. lock orderGroup
    const orderGroup = await OrderGroup.findByPk(orderGroupId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!orderGroup) {
      throw new NotFoundError("Đơn hàng không tồn tại");
    }

    // 4. lock transaction
    const tx = await WalletTransaction.findOne({
      where: {
        paymentId: payment.id,
        status: WALLET_TRANSACTION_STATUS.PENDING,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!tx) throw new BadRequestError("Transaction không tồn tại");

    // expire
    if (tx.expiredAt && tx.expiredAt < new Date()) {
      await tx.update(
        { status: WALLET_TRANSACTION_STATUS.FAILED },
        { transaction: t },
      );
      throw new BadRequestError("Phiên thanh toán đã hết hạn");
    }

    // check balance
    if (Number(wallet.balance) < Number(tx.amount)) {
      throw new BadRequestError("Số dư không đủ");
    }

    // 5. lock OTP cu?i
    const otp = await UserOtp.findByPk(userOtp.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!otp || otp.isUsed) {
      throw new BadRequestError("OTP đã được sử dụng");
    }

    await activateOrderGroupForFulfillment({
      orderGroupId: orderGroup.id,
      transaction: t,
    });

    // TR? TI?N (atomic)
    await wallet.update(
      {
        balance: sequelize.literal(`balance - ${Number(tx.amount)}`),
      },
      { transaction: t },
    );

    await tx.update(
      { status: WALLET_TRANSACTION_STATUS.SUCCESS },
      { transaction: t },
    );

    await payment.update(
      { paymentStatus: PAYMENT_STATUS.PAID },
      { transaction: t },
    );

    const cleanupRaw = await redisClient.get(
      `order_cart_cleanup:${orderGroupId}`,
    );
    if (cleanupRaw) {
      const cleanup = JSON.parse(cleanupRaw);
      await deleteSelectedCartItems({
        cartId: cleanup.cartId,
        cartItemIds: cleanup.cartItemIds,
        transaction: t,
      });
      await redisClient.del(`order_cart_cleanup:${orderGroupId}`);
    }

    await otp.update({ isUsed: true, isVerified: true }, { transaction: t });

    return {
      orderGroupId,
      amount: orderGroup.finalAmount,
    };
  });
};

const getOrderGroupByIdService = async (data) => {
  const { orderGroupId, userId } = data;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("Người dùng không tồn tại");
  }

  const orderGroup = await OrderGroup.findByPk(orderGroupId);

  if (!orderGroup) {
    throw new NotFoundError("Đơn hàng không tồn tại");
  }

  // ch?ng hack orderId
  if (orderGroup.userId !== user.id) {
    throw new ForbiddenError("Không có quyền truy cập đơn hàng");
  }

  // l?y payment theo orderGroup
  const payment = await Payment.findOne({
    where: {
      targetPaymentId: orderGroup.id,
      targetPaymentType: TARGET_PAYMENT_TYPE.ORDER,
    },
  });

  let paymentMethod = null;
  let isSuccess = false;

  if (payment) {
    paymentMethod = payment.paymentMethod;

    if (paymentMethod === PAYMENT_METHOD_STATUS.COD) {
      // COD: luôn success
      isSuccess = true;
    } else {
      // WALLET / VNPAY
      isSuccess = payment.paymentStatus === PAYMENT_STATUS.PAID;
    }
  }

  return {
    orderGroupId: orderGroup.id,
    amount: Number(orderGroup.finalAmount),
    status: orderGroup.status,
    paymentMethod,
    paymentStatus: payment?.paymentStatus || null,
    canRetryPayment:
      paymentMethod === PAYMENT_METHOD_STATUS.VNPAY &&
      payment?.paymentStatus !== PAYMENT_STATUS.PAID &&
      orderGroup.status === ORDER_GROUP_STATUS.PENDING_PAYMENT &&
      Date.now() - new Date(orderGroup.createdAt).getTime() <=
        PAYMENT_RETRY_WINDOW_MS,
    retryExpiresAt: new Date(
      new Date(orderGroup.createdAt).getTime() + PAYMENT_RETRY_WINDOW_MS,
    ).toISOString(),
    isSuccess,
    createdAt: orderGroup.createdAt,
  };
};

const retryOrderVNPayService = async ({ orderGroupId, userId, ip }) => {
  const orderGroup = await OrderGroup.findByPk(orderGroupId);
  if (!orderGroup) throw new NotFoundError("Đơn hàng không tồn tại");

  if (orderGroup.userId !== userId) {
    throw new ForbiddenError("Không có quyền truy cập đơn hàng");
  }

  assertRetryWindowOpen(orderGroup.createdAt);

  if (orderGroup.status !== ORDER_GROUP_STATUS.PENDING_PAYMENT) {
    throw new BadRequestError("Đơn hàng không còn ở trạng thái chờ thanh toán");
  }

  const payment = await Payment.findOne({
    where: {
      targetPaymentType: TARGET_PAYMENT_TYPE.ORDER,
      targetPaymentId: orderGroup.id,
      paymentMethod: PAYMENT_METHOD_STATUS.VNPAY,
    },
  });

  if (!payment) {
    throw new NotFoundError("Thanh toán VNPay không tồn tại");
  }

  if (payment.paymentStatus === PAYMENT_STATUS.PAID) {
    throw new BadRequestError("Đơn hàng đã thanh toán");
  }

  const txnRef = uuidv4();
  await payment.update({
    externalId: txnRef,
    paymentStatus: PAYMENT_STATUS.PENDING,
    transId: null,
    paidAt: null,
  });

  const paymentUrl = await buildOrderVNPayUrl({
    orderGroup,
    payment,
    ip,
  });

  return {
    orderGroupId: orderGroup.id,
    amount: Number(orderGroup.finalAmount),
    paymentUrl,
  };
};

const getUserOrdersService = async (data) => {
  const {
    userId,
    status,
    page = 1,
    limit = 10,
    dateFrom,
    dateTo,
    sort = "newest",
  } = data;

  const offset = (page - 1) * limit;

  // WHERE cho OrderGroup
  const where = { userId };

  // filter status
  if (status && status !== "ALL") {
    where.status = status;
  }

  // filter date range
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
    if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
  }

  // sort
  const order = [["createdAt", sort === "oldest" ? "ASC" : "DESC"]];

  const { rows, count } = await OrderGroup.findAndCountAll({
    where,
    include: [
      {
        model: Order,
        as: "orders",
        include: [
          {
            model: OrderDetail,
            as: "details",
            include: [
              {
                model: ProductVariant,
                as: "variant",
                include: [{ model: Product, as: "product" }],
              },
            ],
          },
        ],
      },
    ],
    order,
    limit: Number(limit),
    offset: Number(offset),
    distinct: true,
  });

  return {
    items: rows.map((group) => ({
      orderGroupId: group.id,
      totalAmount: group.totalAmount,
      totalShippingFee: group.totalShippingFee,
      finalAmount: group.finalAmount,
      status: group.status,
      createdAt: group.createdAt,

      orders: group.orders.map((o) => ({
        orderId: o.id,
        shippingStatus: o.shippingStatus,
        orderStatus: o.orderStatus,

        displayStatus: getDisplayStatus(o),

        items: o.details.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          price: i.unitPrice,
          thumbnailUrl: i.variant.product.thumbnailUrl,
        })),
      })),
    })),

    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getOrderDetailService = async (data) => {
  const { orderId, userId } = data;

  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: OrderDetail,
        as: "details",
        include: [
          {
            model: ProductVariant,
            as: "variant",
            include: [
              {
                model: Product,
                as: "product",
              },
            ],
          },
        ],
      },
      {
        model: OrderShippingLog,
        as: "shippingLogs",
      },
    ],
  });

  if (!order) {
    throw new NotFoundError("Đơn hàng không tồn tại");
  }

  // redis key review
  const reviewKey = `review:order:${orderId}:user:${userId}`;

  const items = await Promise.all(
    order.details.map(async (i) => {
      const variantId = i.variantId;

      // check đã review chưa
      const isReviewed = await redisClient.sismember(reviewKey, variantId);

      const canReview = order.orderStatus === ORDER_STATUS.COMPLETED;

      return {
        name: i.productName,

        quantity: i.quantity,

        price: i.unitPrice,

        variantInfo: i.variantInfo,

        thumbnailUrl: i.variant.product.thumbnailUrl,

        variantId,

        reviewStatus: !canReview
          ? REVIEW_STATUS.NOT_ELIGIBLE
          : isReviewed
            ? REVIEW_STATUS.REVIEWED
            : REVIEW_STATUS.CAN_REVIEW,
      };
    }),
  );

  return {
    orderId: order.id,

    status: order.orderStatus,

    shippingStatus: order.shippingStatus,

    trackingCode: order.shippingOrderCode,

    address: {
      name: order.shippingName,
      phone: order.shippingPhone,
      address: order.shippingAddress,
    },

    items,

    fee: {
      subtotal: order.subtotal,
      shipping: order.shippingFee,
      total: order.totalAmount,
    },
  };
};

const getOrderTrackingService = async (data) => {
  const { orderId } = data;
  const logs = await OrderShippingLog.findAll({
    where: { orderId },
    order: [["eventTime", "ASC"]],
  });

  return logs.map((log) => ({
    status: log.status,
    label: SHIPPING_TRACKING_LABEL[log.status] || log.status,
    time: log.eventTime,
  }));
};

const TRACKING_STEPS = [
  "CREATED",
  "PICKING",
  "PICKED",
  "IN_TRANSIT",
  "DELIVERING",
  "DELIVERED",
];

const getTrackingProgressService = async (data) => {
  const { orderId } = data;
  const order = await Order.findByPk(orderId);

  if (!order) throw new NotFoundError("Đơn hàng không tồn tại");

  const currentIndex = TRACKING_STEPS.indexOf(order.shippingStatus);

  return TRACKING_STEPS.map((step, index) => ({
    step,
    done: index <= currentIndex,
    current: index === currentIndex,
  }));
};

// YÊU CẦU HỦY ĐƠN VÀ HOÀN ĐƠN
const cancellableStatuses = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_TO_SHIP,
  ORDER_STATUS.SHIPPING,
  ORDER_STATUS.FAILED,
];

const returnableStatuses = [ORDER_STATUS.COMPLETED];

const calculateRefundAmount = async (order, orderGroup) => {
  const groupBeforeDiscount =
    Number(orderGroup.totalAmount || 0) +
    Number(orderGroup.totalShippingFee || 0);

  const orderAmount = Number(order.totalAmount || 0);
  const discountAmount = Number(orderGroup.discountAmount || 0);

  if (!discountAmount || !groupBeforeDiscount) {
    return orderAmount;
  }

  const discountShare = Math.round(
    discountAmount * (orderAmount / groupBeforeDiscount),
  );

  return Math.max(0, orderAmount - discountShare);
};

const refundOrderToWallet = async ({ order, orderGroup, transaction }) => {
  const payment = await Payment.findOne({
    where: {
      targetPaymentType: TARGET_PAYMENT_TYPE.ORDER,
      targetPaymentId: orderGroup.id,
      paymentStatus: PAYMENT_STATUS.PAID,
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!payment) {
    return {
      refunded: false,
      refundAmount: 0,
    };
  }

  const refundAmount = await calculateRefundAmount(order, orderGroup);

  const wallet = await Wallet.findOne({
    where: { userId: orderGroup.userId },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!wallet) {
    throw new NotFoundError("Ví người dùng không tồn tại");
  }

  const refundDescription = `Hoàn tiền đơn ${formatOrderItemCode(order.id)} thuộc nhóm đơn #${orderGroup.id}`;

  const existedRefund = await WalletTransaction.findOne({
    where: {
      walletId: wallet.id,
      paymentId: payment.id,
      type: WALLET_TRANSACTION_TYPE.REFUND,
      description: refundDescription,
    },
    transaction,
  });

  if (existedRefund) {
    return {
      refunded: false,
      refundAmount: 0,
    };
  }

  await wallet.update(
    {
      balance: sequelize.literal(`balance + ${Number(refundAmount)}`),
    },
    { transaction },
  );

  await WalletTransaction.create(
    {
      walletId: wallet.id,
      paymentId: payment.id,
      amount: refundAmount,
      type: WALLET_TRANSACTION_TYPE.REFUND,
      status: WALLET_TRANSACTION_STATUS.SUCCESS,
      description: refundDescription,
    },
    { transaction },
  );

  return {
    refunded: true,
    refundAmount,
  };
};

const updateOrderGroupAfterChildChanged = async ({
  orderGroupId,
  transaction,
}) => {
  const orderGroup = await OrderGroup.findByPk(orderGroupId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  const orders = await Order.findAll({
    where: { orderGroupId },
    transaction,
  });

  const allCancelled = orders.every(
    (o) => o.orderStatus === ORDER_STATUS.CANCELLED,
  );

  if (
    allCancelled &&
    orderGroup.status === ORDER_GROUP_STATUS.PENDING_PAYMENT
  ) {
    await orderGroup.update(
      { status: ORDER_GROUP_STATUS.CANCELLED },
      { transaction },
    );
  }

  return orderGroup;
};

const restoreOrderStock = async ({ order, transaction }) => {
  const details = await OrderDetail.findAll({
    where: { orderId: order.id },
    transaction,
  });

  await Promise.all(
    details.map((detail) =>
      VariantStock.increment("stock", {
        by: detail.quantity,
        where: {
          branchId: order.branchId,
          variantId: detail.variantId,
        },
        transaction,
      }),
    ),
  );
};

const getUserOrderForAction = async ({ orderId, userId, transaction }) => {
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: OrderGroup,
        as: "orderGroup",
      },
      {
        model: Branch,
        as: "branch",
      },
    ],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!order) {
    throw new NotFoundError("Đơn hàng không tồn tại");
  }

  if (order.orderGroup.userId !== userId) {
    throw new ForbiddenError("Không có quyền thao tác đơn hàng này");
  }

  return order;
};

const requestCancelOrderService = async (data) => {
  const { orderId, userId, reason } = data;
  const result = await sequelize.transaction(async (t) => {
    const order = await getUserOrderForAction({
      orderId,
      userId,
      transaction: t,
    });

    if (order.orderStatus === ORDER_STATUS.CANCEL_REQUESTED) {
      throw new BadRequestError("Đơn hàng đã được yêu cầu hủy trước đó");
    }

    if (!cancellableStatuses.includes(order.orderStatus)) {
      throw new BadRequestError("Đơn hàng hiện không thể yêu cầu hủy");
    }

    if (order.orderStatus === ORDER_STATUS.COMPLETED) {
      throw new BadRequestError("Đơn hàng đã hoàn thành, không thể hủy");
    }

    if (order.orderStatus === ORDER_STATUS.PENDING) {
      const refund = await refundOrderToWallet({
        order,
        orderGroup: order.orderGroup,
        transaction: t,
      });

      await order.update(
        {
          previousOrderStatus: order.orderStatus,
          orderStatus: ORDER_STATUS.CANCELLED,
          shippingStatus: SHIPPING_STATUS.CANCELLED,
          cancelledBy: CANCELLED_BY.USER,
          cancelReason: reason || null,
          cancelRequestedAt: new Date(),
          cancelHandledAt: new Date(),
          cancelledAt: new Date(),
          cancelRejectReason: null,
        },
        { transaction: t },
      );

      await OrderShippingLog.create(
        {
          orderId: order.id,
          status: SHIPPING_STATUS.CANCELLED,
          eventTime: new Date(),
          rawData: {
            source: "SYSTEM",
            action: "USER_CANCEL_ORDER_PENDING",
          },
        },
        { transaction: t },
      );

      await restoreOrderStock({ order, transaction: t });

      await updateOrderGroupAfterChildChanged({
        orderGroupId: order.orderGroupId,
        transaction: t,
      });

      return {
        mode: "CANCELLED",
        order,
        refund,
      };
    }

    await order.update(
      {
        previousOrderStatus: order.orderStatus,
        orderStatus: ORDER_STATUS.CANCEL_REQUESTED,
        cancelledBy: CANCELLED_BY.USER,
        cancelReason: reason || null,
        cancelRequestedAt: new Date(),
        cancelHandledAt: null,
        cancelRejectReason: null,
      },
      { transaction: t },
    );

    return {
      mode: "REQUESTED",
      order,
    };
  });

  await emitOrderActionRealtime({
    order: result.order,
    log: null,
    message:
      result.mode === "CANCELLED"
        ? "Đơn hàng đã được hủy thành công"
        : "Yêu cầu hủy đơn của bạn đã được gửi đến nhân viên",
  });

  if (result.mode === "CANCELLED") {
    await sendBranchStaffNotification(
      result.order.branchId,
      "order-cancelled",
      "Khách đã hủy đơn hàng",
      `${result.order.branch?.branchName || "Chi nhánh"}: khách đã hủy đơn hàng ${formatOrderItemCode(result.order.id)}.`,
    );
  } else {
    await sendBranchStaffNotification(
      result.order.branchId,
      "order-cancel-requested",
      "Khách yêu cầu hủy đơn hàng",
      `${result.order.branch?.branchName || "Chi nhánh"}: đơn hàng ${formatOrderItemCode(result.order.id)} cần nhân viên xử lý yêu cầu hủy.`,
    );
  }

  return {
    mode: result.mode,
    orderId: result.order.id,
    refund: result.refund,
  };
};

const requestReturnOrderService = async (data) => {
  const { orderId, userId, reason } = data;
  let updatedOrder;

  await sequelize.transaction(async (t) => {
    const order = await getUserOrderForAction({
      orderId,
      userId,
      transaction: t,
    });

    if (!returnableStatuses.includes(order.orderStatus)) {
      throw new BadRequestError(
        "Chỉ có thể yêu cầu trả hàng khi đơn đã giao thành công",
      );
    }

    if (order.shippingStatus !== SHIPPING_STATUS.DELIVERED) {
      throw new BadRequestError(
        "Chỉ có thể yêu cầu trả hàng khi đơn đã giao thành công",
      );
    }

    await order.update(
      {
        orderStatus: ORDER_STATUS.RETURN_REQUESTED,
        returnReason: reason || null,
        returnRequestedAt: new Date(),
      },
      { transaction: t },
    );

    updatedOrder = order;
  });

  await emitOrderActionRealtime({
    order: updatedOrder,
    log: null,
    message: "Yêu cầu trả hàng của bạn đã được gửi đến nhân viên",
  });
};

const orderService = {
  checkoutPreviewService,
  calculateShippingService,
  clearCheckoutSessionService,
  createOrderService,
  orderCallbackService,
  walletOrderConfirmService,
  retryOrderVNPayService,
  getOrderGroupByIdService,
  getOrderDetailService,
  getUserOrdersService,
  getOrderTrackingService,
  getTrackingProgressService,
  requestCancelOrderService,
  requestReturnOrderService,
};

export default orderService;
