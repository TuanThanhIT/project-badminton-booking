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
import { VnpLocale, dateFormat, VNPay } from "vnpay";
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

const checkoutPreviewService = async (data) => {
  const { cartId, addressId, userId } = data;

  return sequelize.transaction(async (t) => {
    const redisKey = getCheckoutKey({ userId, cartId });

    const existing = await redisClient.get(redisKey);
    let oldSession = existing ? JSON.parse(existing) : null;

    // ================= 1. LOAD CART =================
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

    if (!cart) throw new NotFoundError("Giỏ hàng không tồn tại");
    if (!cart.items.length)
      throw new BadRequestError("Không có sản phẩm trong giỏ hàng");

    // ================= 2. ADDRESS =================
    const address = await UserAddress.findByPk(addressId, {
      transaction: t,
    });

    if (!address) throw new NotFoundError("Địa chỉ không tồn tại");
    if (!address.latitude || !address.longitude) {
      throw new BadRequestError("Địa chỉ chưa có tọa độ");
    }

    const isSameAddress =
      oldSession &&
      oldSession.address?.districtId === address.districtId &&
      oldSession.address?.wardCode === address.wardCode;

    // ================= 3. SUBTOTAL =================
    const subTotal = cart.items.reduce(
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

    // ================= 6. FIND BEST =================
    let bestBranch = null;

    for (const branch of branchesWithDistance) {
      const branchStock = stockMap[branch.id];
      if (!branchStock) continue;

      const canFulfill = cart.items.every(
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
      const weight = cart.items.reduce(
        (sum, item) => sum + item.quantity * (item.variant.weight || 0),
        0,
      );

      selectedOrders = [
        {
          branchId: bestBranch.id,
          branchName: bestBranch.branchName,
          weight,
          items: cart.items.map((i) => ({
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
      const remaining = cart.items.map((i) => ({
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

      discount: oldSession?.group?.discount || {
        id: null,
        code: null,
        amount: 0,
      },

      total:
        subTotal +
        (isSameAddress ? oldSession?.group?.shippingFeeTotal || 0 : 0) -
        (oldSession?.group?.discount?.amount || 0),
    };

    // ================= 9. SAVE =================
    const session = {
      cartId,
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

  if (!raw) throw new BadRequestError("Checkout session hết hạn");

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
  if (!raw) throw new BadRequestError("Checkout session hết hạn");
  const session = JSON.parse(raw);
  return session;
};

const createOrderService = async (data) => {
  const { cartId, addressId, paymentMethod, note, userId, ip } = data;

  return sequelize.transaction(async (t) => {
    const preview = await getCheckoutPreviewService(userId, cartId);

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

    let createdOrders = [];

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
          shippingServiceId: preview.group.serviceId,
          orderStatus: ORDER_STATUS.PENDING,
        },
        { transaction: t },
      );

      for (const item of o.items) {
        const stock = await VariantStock.findOne({
          where: {
            branchId: o.branchId,
            variantId: item.variantId,
          },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!stock || stock.stock < item.quantity) {
          throw new BadRequestError("Cửa hàng không đủ số lượng");
        }

        stock.stock -= item.quantity;
        await stock.save({ transaction: t });

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

      createdOrders.push(order);
    }

    // ================= PAYMENT =================

    let result = {
      orderGroupId: orderGroup.id,
      amount: orderGroup.finalAmount,
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
          status: "PENDING",
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

      // lock tiền bằng transaction
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

      const vnpay = new VNPay({
        tmnCode: process.env.VNP_TMN_CODE,
        secureSecret: process.env.VNP_HASH_SECRET,
        vnpayHost: process.env.VNP_URL,
        testMode: true,
        hashAlgorithm: "SHA512",
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      result.paymentUrl = await vnpay.buildPaymentUrl({
        vnp_Amount: orderGroup.finalAmount,
        vnp_IpAddr: ip,
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: `order_${orderGroup.id}`,
        vnp_OrderType: "order",
        vnp_ReturnUrl: process.env.VNP_RETURN_URL,
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(tomorrow),
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

  // idempotent sớm
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

    // update
    await payment.update(
      {
        paymentStatus: PAYMENT_STATUS.PAID,
        transId: vnp_TransactionNo,
        paidAt: new Date(),
      },
      { transaction: t },
    );

    if (!orderGroup.isDiscountApplied && orderGroup.discountId) {
      await applyDiscountUsage(orderGroup.discountId, t);

      await orderGroup.update({ isDiscountApplied: true }, { transaction: t });
    }

    await orderGroup.update(
      { status: ORDER_GROUP_STATUS.PAID },
      { transaction: t },
    );
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
    order: [["createdDate", "DESC"]],
  });

  if (!userOtp) throw new BadRequestError("OTP không tồn tại");

  if (userOtp.otpExpiry < new Date()) {
    throw new BadRequestError("OTP hết hạn");
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

    // 5. lock OTP cuối
    const otp = await UserOtp.findByPk(userOtp.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!otp || otp.isUsed) {
      throw new BadRequestError("OTP đã được sử dụng");
    }

    // TRỪ TIỀN (atomic)
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

    if (!orderGroup.isDiscountApplied && orderGroup.discountId) {
      await applyDiscountUsage(orderGroup.discountId, t);

      await orderGroup.update({ isDiscountApplied: true }, { transaction: t });
    }

    await orderGroup.update(
      { status: ORDER_GROUP_STATUS.PAID },
      { transaction: t },
    );

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

  // chống hack orderId
  if (orderGroup.userId !== user.id) {
    throw new ForbiddenError("Không có quyền truy cập đơn hàng");
  }

  // lấy payment theo orderGroup
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
    isSuccess,
    createdDate: orderGroup.createdAt,
  };
};

const getUserOrdersService = async (data) => {
  const { userId } = data;
  const orderGroups = await OrderGroup.findAll({
    where: { userId },
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
                include: [
                  {
                    model: Product,
                    as: "product",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return orderGroups.map((group) => ({
    orderGroupId: group.id,
    totalAmount: group.totalAmount,
    totalShippingFee: group.totalShippingFee,
    finalAmount: group.finalAmount,
    status: group.status,
    createdDate: group.createdAt,

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
  }));
};

const getOrderDetailService = async (data) => {
  const { orderId } = data;
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
      { model: OrderShippingLog, as: "shippingLogs" },
    ],
  });

  if (!order) throw new NotFoundError("Đơn hàng không tồn tại");

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

    items: order.details.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
      price: i.unitPrice,
      variantInfo: i.variantInfo,
      thumbnailUrl: i.variant.product.thumbnailUrl,
    })),

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

const orderService = {
  checkoutPreviewService,
  calculateShippingService,
  clearCheckoutSessionService,
  createOrderService,
  orderCallbackService,
  walletOrderConfirmService,
  getOrderGroupByIdService,
  getOrderDetailService,
  getUserOrdersService,
  getOrderTrackingService,
  getTrackingProgressService,
};

export default orderService;
