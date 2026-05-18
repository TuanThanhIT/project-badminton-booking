import { Order, OrderGroup } from "../../models/index.js";
import { emitOrderShippingUpdated } from "../../socket/emitter.js";
import { getDisplayStatus } from "../../utils/shippingMapper.js";
import { sendUserNotification } from "../notificationService.js";

// Đây là file dùng chung cho các hành động đơn hàng như hủy đơn, trả hàng, nhân viên duyệt hủy, duyệt trả. Nó làm 2 việc:
// 1. Emit order:shipping-updated để UI đơn hàng đổi ngay
// 2. Tạo notification rồi emit notification:new cho chuông thông báo

export const emitOrderActionRealtime = async ({ order, log, message }) => {
  const freshOrder = await Order.findByPk(order.id, {
    include: [
      {
        model: OrderGroup,
        as: "orderGroup",
      },
    ],
  });

  const userId = freshOrder.orderGroup.userId;

  emitOrderShippingUpdated(userId, {
    orderId: freshOrder.id,
    orderGroupId: freshOrder.orderGroupId,
    orderStatus: freshOrder.orderStatus,
    shippingStatus: freshOrder.shippingStatus,
    displayStatus: getDisplayStatus(freshOrder),
    deliveredAt: freshOrder.deliveredAt,
    tracking: log
      ? {
          id: log.id,
          status: log.status,
          time: log.eventTime,
        }
      : null,
    message,
  });

  await sendUserNotification(
    userId,
    "order-status-updated",
    "Cập nhật đơn hàng",
    message,
  );
};
