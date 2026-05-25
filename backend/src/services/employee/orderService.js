import sequelize from "../../config/db.js";
import { Op } from "sequelize";
import {
  ORDER_GROUP_STATUS,
  ORDER_STATUS,
  SHIPPING_STATUS,
} from "../../constants/orderConstant.js";
import { CANCELLED_BY } from "../../constants/bookingConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import {
  Branch,
  Order,
  OrderDetail,
  OrderGroup,
  OrderShippingLog,
  Payment,
  Wallet,
  WalletTransaction,
} from "../../models/index.js";
import {
  assertEmployeeCanAccessBranch,
  getEmployeeBranchIds,
} from "./branchAccessService.js";
import { syncOrderStatus } from "../../utils/orderMapper.js";
import { mapGHNStatusToSystem } from "../../utils/shippingMapper.js";
import { emitOrderActionRealtime } from "../shared/emitRealtime.js";
import { formatOrderItemCode } from "../../utils/displayCode.js";
import {
  cancelGHNOrder,
  createGHNOrderService,
  returnGHNOrder,
} from "../shared/ghnService.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
  TARGET_PAYMENT_TYPE,
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from "../../constants/paymentConstant.js";

const orderInclude = [
  {
    model: OrderGroup,
    as: "orderGroup",
  },
  {
    model: Branch,
    as: "branch",
    attributes: ["id", "branchName", "address", "phoneNumber"],
  },
  {
    model: OrderDetail,
    as: "details",
  },
  {
    model: OrderShippingLog,
    as: "shippingLogs",
    required: false,
  },
];

const activeOrderInclude = orderInclude.map((item) =>
  item.as === "orderGroup"
    ? {
        ...item,
        where: { status: ORDER_GROUP_STATUS.PAID },
        required: true,
      }
    : item,
);

const mapOrder = (order, payment = null) => {
  const plain = order.get ? order.get({ plain: true }) : order;

  return {
    id: plain.id,
    orderGroupId: plain.orderGroupId,
    orderStatus: plain.orderStatus,
    previousOrderStatus: plain.previousOrderStatus,
    shippingStatus: plain.shippingStatus,
    shippingOrderCode: plain.shippingOrderCode,
    trackingCode: plain.trackingCode,
    estimatedDelivery: plain.estimatedDelivery,
    deliveredAt: plain.deliveredAt,
    subtotal: Number(plain.subtotal || 0),
    shippingFee: Number(plain.shippingFee || 0),
    shippingFeeReal: Number(plain.shippingFeeReal || 0),
    totalAmount: Number(plain.totalAmount || 0),
    shippingName: plain.shippingName,
    shippingPhone: plain.shippingPhone,
    shippingAddress: plain.shippingAddress,
    cancelledBy: plain.cancelledBy,
    cancelReason: plain.cancelReason,
    cancelRejectReason: plain.cancelRejectReason,
    cancelRequestedAt: plain.cancelRequestedAt,
    cancelHandledAt: plain.cancelHandledAt,
    returnReason: plain.returnReason,
    returnRequestedAt: plain.returnRequestedAt,
    returnHandledAt: plain.returnHandledAt,
    cancelledAt: plain.cancelledAt,
    returnedAt: plain.returnedAt,
    createdDate: plain.createdDate,
    updatedDate: plain.updatedDate,
    branch: plain.branch || null,
    orderGroup: plain.orderGroup
      ? {
          id: plain.orderGroup.id,
          userId: plain.orderGroup.userId,
          status: plain.orderGroup.status,
          totalAmount: Number(plain.orderGroup.totalAmount || 0),
          totalShippingFee: Number(plain.orderGroup.totalShippingFee || 0),
          discountAmount: Number(plain.orderGroup.discountAmount || 0),
          finalAmount: Number(plain.orderGroup.finalAmount || 0),
          note: plain.orderGroup.note,
        }
      : null,
    payment: payment
      ? {
          id: payment.id,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          paymentAmount: Number(payment.paymentAmount || 0),
          paidAt: payment.paidAt,
        }
      : null,
    details:
      plain.details?.map((item) => ({
        id: item.id,
        variantId: item.variantId,
        productName: item.productName,
        variantInfo: item.variantInfo,
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        subTotal: Number(item.subTotal || 0),
      })) || [],
    shippingLogs:
      plain.shippingLogs?.map((item) => ({
        id: item.id,
        status: item.status,
        eventTime: item.eventTime,
        rawData: item.rawData,
      })) || [],
  };
};

const attachPayments = async (orders) => {
  const groupIds = orders.map((order) => order.orderGroupId);
  const payments = groupIds.length
    ? await Payment.findAll({
        where: {
          targetPaymentType: TARGET_PAYMENT_TYPE.ORDER,
          targetPaymentId: groupIds,
        },
      })
    : [];

  const paymentMap = new Map(
    payments.map((payment) => [payment.targetPaymentId, payment]),
  );

  return orders.map((order) =>
    mapOrder(order, paymentMap.get(order.orderGroupId)),
  );
};

const getOrdersService = async (data) => {
  const { employeeId, status, keyword, date, page = 1, limit = 12 } = data;
  const branchIds = await getEmployeeBranchIds(employeeId);
  if (!branchIds.length) {
    return {
      items: [],
      summary: {},
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 0,
        totalPages: 0,
      },
    };
  }

  const where = {
    branchId: branchIds,
  };

  if (status && status !== "ALL") where.orderStatus = status;

  if (date) {
    where.createdDate = {
      [Op.gte]: new Date(`${date}T00:00:00`),
      [Op.lt]: new Date(`${date}T23:59:59.999`),
    };
  }

  if (keyword) {
    where[Op.or] = [
      { id: Number(keyword) || 0 },
      { shippingName: { [Op.like]: `%${keyword}%` } },
      { shippingPhone: { [Op.like]: `%${keyword}%` } },
      { shippingOrderCode: { [Op.like]: `%${keyword}%` } },
    ];
  }

  const offset = (Number(page) - 1) * Number(limit);

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: activeOrderInclude,
    distinct: true,
    order: [["createdDate", "DESC"]],
    limit: Number(limit),
    offset,
  });

  const allInBranch = await Order.findAll({
    where: { branchId: branchIds },
    include: activeOrderInclude,
    attributes: ["orderStatus"],
  });

  const summary = allInBranch.reduce((acc, order) => {
    acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
    return acc;
  }, {});

  return {
    items: await attachPayments(rows),
    summary,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / Number(limit)),
    },
  };
};

const getOrderDetailService = async (data) => {
  const { orderId, employeeId } = data;
  const order = await Order.findByPk(orderId, {
    include: orderInclude,
    order: [
      [{ model: OrderShippingLog, as: "shippingLogs" }, "eventTime", "DESC"],
    ],
  });

  if (!order) throw new NotFoundError("Đơn hàng không tồn tại");

  await assertEmployeeCanAccessBranch({
    employeeId,
    branchId: order.branchId,
  });

  const payment = await Payment.findOne({
    where: {
      targetPaymentType: TARGET_PAYMENT_TYPE.ORDER,
      targetPaymentId: order.orderGroupId,
    },
  });

  return mapOrder(order, payment);
};

const assertOrderCanBeProcessed = async ({ order, transaction }) => {
  const orderGroup = await OrderGroup.findByPk(order.orderGroupId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!orderGroup) {
    throw new NotFoundError("Nhóm đơn hàng không tồn tại");
  }

  const payment = await Payment.findOne({
    where: {
      targetPaymentType: TARGET_PAYMENT_TYPE.ORDER,
      targetPaymentId: order.orderGroupId,
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!payment) {
    throw new BadRequestError("Đơn hàng chưa có thông tin thanh toán");
  }

  const isCOD = payment.paymentMethod === PAYMENT_METHOD_STATUS.COD;
  const isPaid = payment.paymentStatus === PAYMENT_STATUS.PAID;

  if (!isCOD && (!isPaid || orderGroup.status !== ORDER_GROUP_STATUS.PAID)) {
    throw new BadRequestError("Đơn hàng chưa thanh toán, chưa thể xử lý");
  }
};

const confirmOrderService = async (data) => {
  const { orderId, employeeId } = data;
  const updatedOrder = await sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) throw new NotFoundError("Đơn hàng không tồn tại");

    await assertEmployeeCanAccessBranch({
      employeeId,
      branchId: order.branchId,
      transaction: t,
    });

    await assertOrderCanBeProcessed({ order, transaction: t });

    if (order.orderStatus !== ORDER_STATUS.PENDING) {
      throw new BadRequestError("Sai trạng thái");
    }

    await order.update(
      { orderStatus: ORDER_STATUS.CONFIRMED },
      { transaction: t },
    );

    return order;
  });

  await emitOrderActionRealtime({
    order: updatedOrder,
    log: null,
    message: `Đơn hàng ${formatOrderItemCode(updatedOrder.id)} đã được nhân viên xác nhận`,
  });

  return getOrderDetailService({ orderId, employeeId });
};

const prepareOrderService = async (data) => {
  const { orderId, employeeId } = data;
  const updatedOrder = await sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) throw new NotFoundError("Đơn hàng không tồn tại");

    await assertEmployeeCanAccessBranch({
      employeeId,
      branchId: order.branchId,
      transaction: t,
    });

    await assertOrderCanBeProcessed({ order, transaction: t });

    if (order.orderStatus !== ORDER_STATUS.CONFIRMED) {
      throw new BadRequestError("Chưa xác nhận");
    }

    await order.update(
      { orderStatus: ORDER_STATUS.PREPARING },
      { transaction: t },
    );

    return order;
  });

  await emitOrderActionRealtime({
    order: updatedOrder,
    log: null,
    message: `Đơn hàng ${formatOrderItemCode(updatedOrder.id)} đang được chuẩn bị`,
  });

  return getOrderDetailService({ orderId, employeeId });
};

const readyToShipService = async (data) => {
  const { orderId, employeeId } = data;
  const updatedOrder = await sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) throw new NotFoundError("Đơn hàng không tồn tại");

    await assertEmployeeCanAccessBranch({
      employeeId,
      branchId: order.branchId,
      transaction: t,
    });

    await assertOrderCanBeProcessed({ order, transaction: t });

    if (order.orderStatus !== ORDER_STATUS.PREPARING) {
      throw new BadRequestError("Chưa chuẩn bị xong");
    }

    await order.update(
      { orderStatus: ORDER_STATUS.READY_TO_SHIP },
      { transaction: t },
    );

    return order;
  });

  await emitOrderActionRealtime({
    order: updatedOrder,
    log: null,
    message: `Đơn hàng ${formatOrderItemCode(updatedOrder.id)} đã sẵn sàng bàn giao vận chuyển`,
  });

  return getOrderDetailService({ orderId, employeeId });
};

const shipOrderService = async ({ orderId, employeeId }) => {
  // 1. lock order
  const order = await sequelize.transaction(async (t) => {
    const o = await Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!o) throw new NotFoundError("Đơn hàng không tồn tại");

    await assertEmployeeCanAccessBranch({
      employeeId,
      branchId: o.branchId,
      transaction: t,
    });

    await assertOrderCanBeProcessed({ order: o, transaction: t });

    if (o.orderStatus !== ORDER_STATUS.READY_TO_SHIP) {
      throw new BadRequestError("Chưa sẵn sàng giao");
    }

    if (o.shippingOrderCode) {
      throw new BadRequestError("Đơn đã tạo GHN rồi");
    }

    return o;
  });

  // 2. call GHN
  let ghn;
  try {
    ghn = await createGHNOrderService(order);
  } catch (err) {
    console.error("GHN ERROR:", err.message);

    await order.update({
      shippingStatus: SHIPPING_STATUS.FAILED,
    });

    throw err;
  }

  // 3. update DB atomic
  let shippingLog;

  await sequelize.transaction(async (t) => {
    await order.update(
      {
        shippingOrderCode: ghn.order_code,
        shippingStatus: SHIPPING_STATUS.CREATED,
        orderStatus: ORDER_STATUS.SHIPPING,
        estimatedDelivery: ghn.expected_delivery_time,
        shippingFeeReal: ghn.total_fee,
      },
      { transaction: t },
    );

    shippingLog = await OrderShippingLog.create(
      {
        orderId: order.id,
        status: SHIPPING_STATUS.CREATED,
        eventTime: new Date(),
        rawData: ghn,
      },
      { transaction: t },
    );
  });

  await emitOrderActionRealtime({
    order,
    log: shippingLog,
    message: `Đơn hàng ${formatOrderItemCode(order.id)} đã được tạo vận đơn và đang chờ đơn vị vận chuyển lấy hàng`,
  });

  return getOrderDetailService({ orderId, employeeId });
};

// XỬ LÝ HỦY ĐƠN, HOÀN ĐƠN
const canCallGHNCancel = (shippingStatus) => {
  return [SHIPPING_STATUS.CREATED, SHIPPING_STATUS.PICKING].includes(
    shippingStatus,
  );
};

const canMoveToReturnFlow = (shippingStatus) => {
  return shippingStatus === SHIPPING_STATUS.FAILED;
};

const isOrderInActiveDelivery = (shippingStatus) => {
  return [
    SHIPPING_STATUS.PICKED,
    SHIPPING_STATUS.IN_TRANSIT,
    SHIPPING_STATUS.DELIVERING,
  ].includes(shippingStatus);
};

const canCallGHNReturn = () => false;

const calculateRefundAmount = async (order, orderGroup, transaction) => {
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

  // COD hoặc chưa thanh toán thì không hoàn ví
  if (!payment) {
    return {
      refunded: false,
      refundAmount: 0,
    };
  }

  const refundAmount = await calculateRefundAmount(
    order,
    orderGroup,
    transaction,
  );

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

const getEmployeeOrderForAction = async ({
  orderId,
  employeeId,
  transaction,
}) => {
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

  await assertEmployeeCanAccessBranch({
    employeeId,
    branchId: order.branchId,
    transaction,
  });

  return order;
};

const approveCancelOrderService = async (data) => {
  const { orderId, employeeId } = data;

  let updatedOrder;
  let shippingLog;
  let refundResult;
  let movedToReturnFlow = false;

  await sequelize.transaction(async (t) => {
    const order = await getEmployeeOrderForAction({
      orderId,
      employeeId,
      transaction: t,
    });

    if (order.orderStatus !== ORDER_STATUS.CANCEL_REQUESTED) {
      throw new BadRequestError("Đơn hàng chưa có yêu cầu hủy");
    }

    const canCancelLocal =
      !order.shippingOrderCode ||
      order.shippingStatus === SHIPPING_STATUS.PENDING;

    if (canCancelLocal) {
      await order.update(
        {
          orderStatus: ORDER_STATUS.CANCELLED,
          shippingStatus: SHIPPING_STATUS.CANCELLED,
          cancelledBy: order.cancelledBy || CANCELLED_BY.EMPLOYEE,
          cancelledAt: new Date(),
          cancelHandledAt: new Date(),
        },
        { transaction: t },
      );

      shippingLog = await OrderShippingLog.create(
        {
          orderId: order.id,
          status: SHIPPING_STATUS.CANCELLED,
          eventTime: new Date(),
          rawData: {
            source: "SYSTEM",
            action: "APPROVE_CANCEL_ORDER_LOCAL",
          },
        },
        { transaction: t },
      );

      refundResult = await refundOrderToWallet({
        order,
        orderGroup: order.orderGroup,
        transaction: t,
      });

      await updateOrderGroupAfterChildChanged({
        orderGroupId: order.orderGroupId,
        transaction: t,
      });

      updatedOrder = order;
      return;
    }

    if (canCallGHNCancel(order.shippingStatus)) {
      await cancelGHNOrder({
        orderCode: order.shippingOrderCode,
        shopId: order.branch.ghnShopId,
      });

      await order.update(
        {
          orderStatus: ORDER_STATUS.CANCELLED,
          shippingStatus: SHIPPING_STATUS.CANCELLED,
          cancelledBy: order.cancelledBy || CANCELLED_BY.EMPLOYEE,
          cancelledAt: new Date(),
          cancelHandledAt: new Date(),
        },
        { transaction: t },
      );

      shippingLog = await OrderShippingLog.create(
        {
          orderId: order.id,
          status: SHIPPING_STATUS.CANCELLED,
          eventTime: new Date(),
          rawData: {
            source: "GHN",
            action: "APPROVE_CANCEL_ORDER_GHN_CANCEL",
          },
        },
        { transaction: t },
      );

      refundResult = await refundOrderToWallet({
        order,
        orderGroup: order.orderGroup,
        transaction: t,
      });

      await updateOrderGroupAfterChildChanged({
        orderGroupId: order.orderGroupId,
        transaction: t,
      });

      updatedOrder = order;
      return;
    }

    if (isOrderInActiveDelivery(order.shippingStatus)) {
      throw new BadRequestError(
        "Đơn đã rời shop và đang được giao. Vui lòng từ chối yêu cầu hủy, khách có thể nhận hàng rồi yêu cầu trả hàng sau.",
      );
    }

    if (canMoveToReturnFlow(order.shippingStatus)) {
      await order.update(
        {
          orderStatus: ORDER_STATUS.RETURNING,
          shippingStatus: SHIPPING_STATUS.RETURNING,
          cancelHandledAt: new Date(),
        },
        { transaction: t },
      );

      shippingLog = await OrderShippingLog.create(
        {
          orderId: order.id,
          status: SHIPPING_STATUS.RETURNING,
          eventTime: new Date(),
          rawData: {
            source: "SYSTEM",
            action: "APPROVE_CANCEL_MOVE_TO_RETURNING",
          },
        },
        { transaction: t },
      );

      refundResult = { refunded: false, refundAmount: 0 };
      movedToReturnFlow = true;
      updatedOrder = order;
      return;
    }

    throw new BadRequestError("Trạng thái hiện tại không thể hủy đơn");
  });

  await emitOrderActionRealtime({
    order: updatedOrder,
    log: shippingLog,
    message: movedToReturnFlow
      ? "Đơn đã chuyển sang luồng hoàn hàng về shop. Tiền sẽ được hoàn sau khi shop nhận lại hàng."
      : refundResult?.refunded
        ? `Đơn hàng đã được hủy và hoàn ${Number(
            refundResult.refundAmount,
          ).toLocaleString()}đ vào ví`
        : "Đơn hàng đã được hủy thành công",
  });

  return {
    refund: refundResult,
  };
};

const rejectCancelOrderService = async (data) => {
  const { orderId, employeeId, reason } = data;
  let updatedOrder;

  await sequelize.transaction(async (t) => {
    const order = await getEmployeeOrderForAction({
      orderId,
      employeeId,
      transaction: t,
    });

    if (order.orderStatus !== ORDER_STATUS.CANCEL_REQUESTED) {
      throw new BadRequestError("Đơn hàng chưa có yêu cầu hủy");
    }

    const backStatus =
      order.previousOrderStatus ||
      (order.shippingStatus && order.shippingStatus !== SHIPPING_STATUS.PENDING
        ? ORDER_STATUS.SHIPPING
        : ORDER_STATUS.CONFIRMED);

    await order.update(
      {
        orderStatus: backStatus,
        previousOrderStatus: null,
        cancelRejectReason: reason || null,
        cancelHandledAt: new Date(),
      },
      { transaction: t },
    );

    updatedOrder = order;
  });

  await emitOrderActionRealtime({
    order: updatedOrder,
    log: null,
    message: "Yêu cầu hủy đơn của bạn đã bị từ chối",
  });

  return getOrderDetailService({ orderId, employeeId });
};

const approveReturnOrderService = async (data) => {
  const { orderId, employeeId } = data;

  let updatedOrder;
  let shippingLog;

  await sequelize.transaction(async (t) => {
    const order = await getEmployeeOrderForAction({
      orderId,
      employeeId,
      transaction: t,
    });

    if (order.orderStatus !== ORDER_STATUS.RETURN_REQUESTED) {
      throw new BadRequestError("Đơn hàng chưa có yêu cầu trả hàng");
    }

    /**
     * Lưu ý:
     * GHN switch-status/return KHÔNG phải lúc nào cũng dùng được sau khi DELIVERED.
     * Nếu đơn đã giao thành công, thường cần quy trình nhận hàng hoàn thủ công
     * hoặc tạo đơn vận chuyển chiều ngược lại.
     *
     * Vì vậy ở đây chỉ update local RETURNING.
     */
    await order.update(
      {
        orderStatus: ORDER_STATUS.RETURNING,
        shippingStatus: SHIPPING_STATUS.RETURNING,
        returnHandledAt: new Date(),
      },
      { transaction: t },
    );

    shippingLog = await OrderShippingLog.create(
      {
        orderId: order.id,
        status: SHIPPING_STATUS.RETURNING,
        eventTime: new Date(),
        rawData: {
          source: "SYSTEM",
          action: "APPROVE_RETURN_ORDER",
        },
      },
      { transaction: t },
    );

    updatedOrder = order;
  });

  await emitOrderActionRealtime({
    order: updatedOrder,
    log: shippingLog,
    message:
      "Yêu cầu trả hàng đã được duyệt, đơn hàng đang trong quá trình hoàn về",
  });

  return getOrderDetailService({ orderId, employeeId });
};

const completeReturnOrderService = async (data) => {
  const { orderId, employeeId } = data;

  let updatedOrder;
  let shippingLog;
  let refundResult;

  await sequelize.transaction(async (t) => {
    const order = await getEmployeeOrderForAction({
      orderId,
      employeeId,
      transaction: t,
    });

    if (order.orderStatus !== ORDER_STATUS.RETURNING) {
      throw new BadRequestError("Đơn hàng chưa ở trạng thái đang hoàn");
    }

    if (order.shippingStatus !== SHIPPING_STATUS.RETURNING) {
      throw new BadRequestError("Trạng thái giao hàng chưa ở luồng hoàn hàng");
    }

    await order.update(
      {
        orderStatus: ORDER_STATUS.RETURNED,
        shippingStatus: SHIPPING_STATUS.RETURNED,
        returnedAt: new Date(),
      },
      { transaction: t },
    );

    shippingLog = await OrderShippingLog.create(
      {
        orderId: order.id,
        status: SHIPPING_STATUS.RETURNED,
        eventTime: new Date(),
        rawData: {
          source: "SYSTEM",
          action: "COMPLETE_RETURN_ORDER",
        },
      },
      { transaction: t },
    );

    refundResult = await refundOrderToWallet({
      order,
      orderGroup: order.orderGroup,
      transaction: t,
    });

    updatedOrder = order;
  });

  await emitOrderActionRealtime({
    order: updatedOrder,
    log: shippingLog,
    message: refundResult?.refunded
      ? `Đơn hàng đã hoàn về shop và hoàn ${Number(
          refundResult.refundAmount,
        ).toLocaleString()}đ vào ví`
      : "Đơn hàng đã hoàn về shop",
  });

  return {
    refund: refundResult,
  };
};

const forceReturnGHNOrderService = async (data) => {
  const { orderId, employeeId } = data;

  let updatedOrder;
  let shippingLog;

  await sequelize.transaction(async (t) => {
    const order = await getEmployeeOrderForAction({
      orderId,
      employeeId,
      transaction: t,
    });

    if (!canMoveToReturnFlow(order.shippingStatus)) {
      throw new BadRequestError(
        "Trạng thái hiện tại không phù hợp để chuyển sang luồng hoàn hàng",
      );
    }

    const calledGHNReturn =
      order.shippingOrderCode && canCallGHNReturn(order.shippingStatus);

    if (calledGHNReturn) {
      await returnGHNOrder({
        orderCode: order.shippingOrderCode,
        shopId: order.branch.ghnShopId,
      });
    }

    await order.update(
      {
        orderStatus: ORDER_STATUS.RETURNING,
        shippingStatus: SHIPPING_STATUS.RETURNING,
      },
      { transaction: t },
    );

    shippingLog = await OrderShippingLog.create(
      {
        orderId: order.id,
        status: SHIPPING_STATUS.RETURNING,
        eventTime: new Date(),
        rawData: {
          source: calledGHNReturn ? "GHN" : "SYSTEM",
          action: calledGHNReturn
            ? "SWITCH_STATUS_RETURN"
            : "MOVE_TO_RETURNING_LOCAL",
        },
      },
      { transaction: t },
    );

    updatedOrder = order;
  });

  await emitOrderActionRealtime({
    order: updatedOrder,
    log: shippingLog,
    message: "Đơn đã chuyển sang luồng hoàn hàng về shop",
  });

  return getOrderDetailService({ orderId, employeeId });
};

const orderService = {
  getOrdersService,
  getOrderDetailService,
  confirmOrderService,
  prepareOrderService,
  readyToShipService,
  shipOrderService,
  approveCancelOrderService,
  rejectCancelOrderService,
  approveReturnOrderService,
  completeReturnOrderService,
  forceReturnGHNOrderService,
};

export default orderService;
