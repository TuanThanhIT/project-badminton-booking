import sequelize from "../../config/db.js";
import {
  ORDER_STATUS,
  SHIPPING_STATUS,
} from "../../constants/orderConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import {
  Branch,
  Order,
  OrderGroup,
  OrderShippingLog,
} from "../../models/index.js";
import { syncOrderStatus } from "../../utils/orderMapper.js";
import { mapGHNStatusToSystem } from "../../utils/shippingMapper.js";
import { emitOrderActionRealtime } from "../shared/emitRealtime.js";
import { createGHNOrderService } from "../shared/ghnService.js";

const confirmOrderService = async (data) => {
  const { orderId } = data;
  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) throw new NotFoundError("Đơn hàng không tồn tại");

    if (order.orderStatus !== ORDER_STATUS.PENDING) {
      throw new BadRequestError("Sai trạng thái");
    }

    await order.update(
      { orderStatus: ORDER_STATUS.CONFIRMED },
      { transaction: t },
    );

    return order;
  });
};

const prepareOrderService = async (data) => {
  const { orderId } = data;
  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (order.orderStatus !== ORDER_STATUS.CONFIRMED) {
      throw new BadRequestError("Chưa xác nhận");
    }

    await order.update(
      { orderStatus: ORDER_STATUS.PREPARING },
      { transaction: t },
    );

    return order;
  });
};

const readyToShipService = async (data) => {
  const { orderId } = data;
  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (order.orderStatus !== ORDER_STATUS.PREPARING) {
      throw new BadRequestError("Chưa chuẩn bị xong");
    }

    await order.update(
      { orderStatus: ORDER_STATUS.READY_TO_SHIP },
      { transaction: t },
    );

    return order;
  });
};

const shipOrderService = async ({ orderId }) => {
  // 1. lock order
  const order = await sequelize.transaction(async (t) => {
    const o = await Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!o) throw new NotFoundError("Đơn hàng không tồn tại");

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

    await OrderShippingLog.create(
      {
        orderId: order.id,
        status: SHIPPING_STATUS.CREATED,
        eventTime: new Date(),
        rawData: ghn,
      },
      { transaction: t },
    );
  });

  return order;
};

// XỬ LÝ HỦY ĐƠN, HOÀN ĐƠN
const canCallGHNCancel = (shippingStatus) => {
  return [
    SHIPPING_STATUS.CREATED,
    SHIPPING_STATUS.PICKING,
    SHIPPING_STATUS.PICKED,
    SHIPPING_STATUS.IN_TRANSIT,
    SHIPPING_STATUS.DELIVERING,
  ].includes(shippingStatus);
};

const canCallGHNReturn = (shippingStatus) => {
  return [
    SHIPPING_STATUS.PICKED,
    SHIPPING_STATUS.IN_TRANSIT,
    SHIPPING_STATUS.DELIVERING,
    SHIPPING_STATUS.FAILED,
  ].includes(shippingStatus);
};

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

  const refundDescription = `Hoàn tiền đơn #${order.id} thuộc nhóm đơn #${orderGroup.id}`;

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

const getEmployeeOrderForAction = async ({ orderId, transaction }) => {
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

  return order;
};

const approveCancelOrderService = async (data) => {
  const { orderId } = data;

  let updatedOrder;
  let shippingLog;
  let refundResult;

  await sequelize.transaction(async (t) => {
    const order = await getEmployeeOrderForAction({
      orderId,
      transaction: t,
    });

    if (order.orderStatus !== ORDER_STATUS.CANCEL_REQUESTED) {
      throw new BadRequestError("Đơn hàng chưa có yêu cầu hủy");
    }

    if (order.shippingOrderCode && canCallGHNCancel(order.shippingStatus)) {
      await cancelGHNOrder({
        orderCode: order.shippingOrderCode,
        shopId: order.branch.ghnShopId,
      });
    }

    await order.update(
      {
        orderStatus: ORDER_STATUS.CANCELLED,
        shippingStatus: order.shippingOrderCode
          ? SHIPPING_STATUS.CANCELLED
          : order.shippingStatus,
        cancelledAt: new Date(),
      },
      { transaction: t },
    );

    shippingLog = await OrderShippingLog.create(
      {
        orderId: order.id,
        status: order.shippingOrderCode
          ? SHIPPING_STATUS.CANCELLED
          : order.shippingStatus,
        eventTime: new Date(),
        rawData: {
          source: "SYSTEM",
          action: "APPROVE_CANCEL_ORDER",
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
  });

  await emitOrderActionRealtime({
    order: updatedOrder,
    log: shippingLog,
    message: refundResult?.refunded
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
  const { orderId, reason } = data;
  let updatedOrder;

  await sequelize.transaction(async (t) => {
    const order = await getEmployeeOrderForAction({
      orderId,
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
};

const approveReturnOrderService = async (data) => {
  const { orderId } = data;

  let updatedOrder;
  let shippingLog;

  await sequelize.transaction(async (t) => {
    const order = await getEmployeeOrderForAction({
      orderId,
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
};

const completeReturnOrderService = async (data) => {
  const { orderId } = data;

  let updatedOrder;
  let shippingLog;
  let refundResult;

  await sequelize.transaction(async (t) => {
    const order = await getEmployeeOrderForAction({
      orderId,
      transaction: t,
    });

    if (order.orderStatus !== ORDER_STATUS.RETURNING) {
      throw new BadRequestError("Đơn hàng chưa ở trạng thái đang hoàn");
    }

    await order.update(
      {
        orderStatus: ORDER_STATUS.RETURNED,
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
  const { orderId } = data;

  let updatedOrder;
  let shippingLog;

  await sequelize.transaction(async (t) => {
    const order = await getEmployeeOrderForAction({
      orderId,
      transaction: t,
    });

    if (!order.shippingOrderCode) {
      throw new BadRequestError("Đơn hàng chưa có mã vận đơn GHN");
    }

    if (!canCallGHNReturn(order.shippingStatus)) {
      throw new BadRequestError(
        "Trạng thái hiện tại không phù hợp để yêu cầu GHN hoàn hàng",
      );
    }

    await returnGHNOrder({
      orderCode: order.shippingOrderCode,
      shopId: order.branch.ghnShopId,
    });

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
          source: "GHN",
          action: "SWITCH_STATUS_RETURN",
        },
      },
      { transaction: t },
    );

    updatedOrder = order;
  });

  await emitOrderActionRealtime({
    order: updatedOrder,
    log: shippingLog,
    message: "Đã yêu cầu GHN hoàn hàng về shop",
  });
};

const orderService = {
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
