import { Order, OrderGroup, OrderShippingLog } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import {
  getDisplayStatus,
  mapGHNStatusToSystem,
} from "../../utils/shippingMapper.js";
import { syncOrderStatus } from "../../utils/orderMapper.js";
import { SHIPPING_STATUS } from "../../constants/orderConstant.js";
import { emitOrderShippingUpdated } from "../../socket/emitter.js";
import { sendUserNotification } from "../../helpers/notification.js";

const getShippingMessage = (shippingStatus) => {
  switch (shippingStatus) {
    case SHIPPING_STATUS.PENDING:
      return "Đơn hàng đang chờ cập nhật từ đơn vị vận chuyển";

    case SHIPPING_STATUS.CREATED:
      return "Đơn vận chuyển đã được tạo";

    case SHIPPING_STATUS.PICKING:
      return "Shipper đang đến lấy hàng";

    case SHIPPING_STATUS.PICKED:
      return "Đơn hàng đã được đơn vị vận chuyển lấy hàng";

    case SHIPPING_STATUS.IN_TRANSIT:
      return "Đơn hàng đang được vận chuyển đến kho giao";

    case SHIPPING_STATUS.DELIVERING:
      return "Đơn hàng đang được giao đến bạn";

    case SHIPPING_STATUS.DELIVERED:
      return "Đơn hàng đã được giao thành công";

    case SHIPPING_STATUS.FAILED:
      return "Giao hàng thất bại, đơn hàng sẽ được xử lý lại";

    case SHIPPING_STATUS.RETURNING:
      return "Đơn hàng đang được hoàn về cửa hàng";

    case SHIPPING_STATUS.RETURNED:
      return "Đơn hàng đã được hoàn về cửa hàng";

    case SHIPPING_STATUS.CANCELLED:
      return "Đơn vận chuyển đã bị hủy";

    default:
      return "Trạng thái giao hàng vừa được cập nhật";
  }
};

export const ghnWebhookService = async (data) => {
  const shippingStatus = mapGHNStatusToSystem(data.Status);
  const orderStatus = syncOrderStatus(shippingStatus);
  const eventTime = data.Time ? new Date(data.Time) : new Date();

  const order = await Order.findOne({
    where: { shippingOrderCode: data.OrderCode },
    include: [
      {
        model: OrderGroup,
        as: "orderGroup",
      },
    ],
  });

  if (!order) {
    throw new NotFoundError("Đơn hàng không tồn tại");
  }

  const existed = await OrderShippingLog.findOne({
    where: {
      orderId: order.id,
      status: shippingStatus,
      eventTime,
    },
  });

  if (existed) {
    console.log("Duplicate GHN webhook ignored:", order.id, shippingStatus);
    return;
  }

  await order.update({
    shippingStatus,
    orderStatus: orderStatus || order.orderStatus,
    deliveredAt:
      shippingStatus === SHIPPING_STATUS.DELIVERED
        ? new Date()
        : order.deliveredAt,
  });

  const log = await OrderShippingLog.create({
    orderId: order.id,
    status: shippingStatus,
    eventTime,
    rawData: data,
  });

  const userId = order.orderGroup.userId;
  const message = getShippingMessage(shippingStatus);

  emitOrderShippingUpdated(userId, {
    orderId: order.id,
    orderGroupId: order.orderGroupId,
    orderStatus: order.orderStatus,
    shippingStatus: order.shippingStatus,
    displayStatus: getDisplayStatus(order),
    deliveredAt: order.deliveredAt,
    tracking: {
      id: log.id,
      status: log.status,
      time: log.eventTime,
    },
    message,
  });

  await sendUserNotification(
    userId,
    "order-shipping-updated",
    "Cập nhật giao hàng",
    message,
  );

  console.log("Updated GHN shipping:", order.id, shippingStatus);
};
