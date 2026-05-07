// services/ghnWebhookService.js
import { Order, OrderShippingLog } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { mapGHNStatusToSystem } from "../../utils/shippingMapper.js";
import { syncOrderStatus } from "../../utils/orderMapper.js";
import { SHIPPING_STATUS } from "../../constants/orderConstant.js";

export const ghnWebhookService = async (data) => {
  const shippingStatus = mapGHNStatusToSystem(data.Status);
  const orderStatus = syncOrderStatus(shippingStatus);

  const order = await Order.findOne({
    where: { shippingOrderCode: data.OrderCode },
  });

  if (!order) {
    throw new NotFoundError("Đơn hàng không tồn tại");
  }

  // IDEMPOTENT (chống duplicate)
  const existed = await OrderShippingLog.findOne({
    where: {
      orderId: order.id,
      status: shippingStatus,
      eventTime: data.Time ? new Date(data.Time) : null,
    },
  });

  if (existed) {
    throw new BadRequestError("Duplicate ignored");
  }

  // update order
  await order.update({
    shippingStatus,
    orderStatus: orderStatus || order.orderStatus,
    deliveredAt:
      shippingStatus === SHIPPING_STATUS.DELIVERED
        ? new Date()
        : order.deliveredAt,
  });

  // insert log
  await OrderShippingLog.create({
    orderId: order.id,
    status: shippingStatus,
    eventTime: data.Time ? new Date(data.Time) : new Date(),
    rawData: data,
  });

  console.log("Updated:", order.id, shippingStatus);
};
