import { UniqueConstraintError } from "sequelize";
import { Order, OrderGroup, OrderShippingLog } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import {
  getDisplayStatus,
  isKnownGHNStatus,
  mapGHNStatusToSystem,
} from "../../utils/shippingMapper.js";
import { syncOrderStatus } from "../../utils/orderMapper.js";
import { SHIPPING_STATUS } from "../../constants/orderConstant.js";
import { emitOrderShippingUpdated } from "../../socket/emitter.js";
import {
  sendBranchStaffNotification,
  sendUserNotification,
} from "../../helpers/notification.js";

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

const SHIPPING_STATUS_RANK = Object.freeze({
  [SHIPPING_STATUS.PENDING]: 0,
  [SHIPPING_STATUS.CREATED]: 1,
  [SHIPPING_STATUS.PICKING]: 2,
  [SHIPPING_STATUS.PICKED]: 3,
  [SHIPPING_STATUS.IN_TRANSIT]: 4,
  [SHIPPING_STATUS.DELIVERING]: 5,
  [SHIPPING_STATUS.FAILED]: 6,
  [SHIPPING_STATUS.RETURNING]: 7,
  [SHIPPING_STATUS.RETURNED]: 8,
  [SHIPPING_STATUS.CANCELLED]: 8,
  [SHIPPING_STATUS.DELIVERED]: 9,
});

const shouldSkipStaleStatusUpdate = ({ currentStatus, nextStatus, latestLog, eventTime }) => {
  if (!latestLog || !latestLog.eventTime) {
    return false;
  }

  const latestTime = new Date(latestLog.eventTime).getTime();
  if (Number.isNaN(latestTime) || latestTime <= eventTime.getTime()) {
    return false;
  }

  return (
    (SHIPPING_STATUS_RANK[nextStatus] ?? 0) <=
    (SHIPPING_STATUS_RANK[currentStatus] ?? 0)
  );
};

export const ghnWebhookService = async (data) => {
  const rawStatus = data.Status;
  const shippingStatus = mapGHNStatusToSystem(rawStatus);
  const orderStatus = syncOrderStatus(shippingStatus);
  const parsedEventTime = data.Time ? new Date(data.Time) : null;
  const eventTime =
    parsedEventTime && !Number.isNaN(parsedEventTime.getTime())
      ? parsedEventTime
      : new Date();

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

  if (!isKnownGHNStatus(rawStatus)) {
    try {
      await OrderShippingLog.create({
        orderId: order.id,
        status: SHIPPING_STATUS.PENDING,
        description: `Unknown GHN status: ${rawStatus}`,
        eventTime,
        rawData: data,
      }, { skipOrderStatusSync: true });
    } catch (error) {
      if (!(error instanceof UniqueConstraintError)) {
        throw error;
      }
    }

    console.warn("Unknown GHN webhook status ignored:", order.id, rawStatus);
    return;
  }

  const latestLog = await OrderShippingLog.findOne({
    where: { orderId: order.id },
    order: [
      ["eventTime", "DESC"],
      ["createdAt", "DESC"],
    ],
  });

  let log = await OrderShippingLog.findOne({
    where: {
      orderId: order.id,
      status: shippingStatus,
      eventTime,
    },
  });

  if (log && order.shippingStatus === shippingStatus) {
    console.log("Duplicate GHN webhook ignored:", order.id, shippingStatus);
    return;
  }

  try {
    if (!log) {
      log = await OrderShippingLog.create({
        orderId: order.id,
        status: shippingStatus,
        eventTime,
        rawData: data,
      });
    }
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      log = await OrderShippingLog.findOne({
        where: {
          orderId: order.id,
          status: shippingStatus,
          eventTime,
        },
      });
    } else {
      throw error;
    }
  }

  if (
    shouldSkipStaleStatusUpdate({
      currentStatus: order.shippingStatus,
      nextStatus: shippingStatus,
      latestLog,
      eventTime,
    })
  ) {
    console.log(
      "Stale GHN webhook logged without status update:",
      order.id,
      shippingStatus,
    );
    return;
  }

  await order.update({
    shippingStatus,
    orderStatus: orderStatus || order.orderStatus,
    deliveredAt:
      shippingStatus === SHIPPING_STATUS.DELIVERED
        ? eventTime
        : order.deliveredAt,
  });

  const userId = order.orderGroup.userId;
  const message = getShippingMessage(shippingStatus);

  try {
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
  } catch (error) {
    console.warn("Skip realtime GHN update:", error.message);
  }

  try {
    await sendUserNotification(
      userId,
    "order-shipping-updated",
    "Cập nhật giao hàng",
    message,
    );
  } catch (error) {
    console.warn("Skip GHN notification:", error.message);
  }

  if (shippingStatus === SHIPPING_STATUS.DELIVERED) {
    try {
      await sendBranchStaffNotification(
        order.branchId,
        "order-delivered",
        "Đơn hàng đã giao thành công",
        `Đơn hàng #${order.id} đã được GHN giao thành công. Vui lòng theo dõi và hoàn tất xử lý nếu cần.`,
      );
    } catch (error) {
      console.warn("Skip GHN staff notification:", error.message);
    }
  }

  console.log("Updated GHN shipping:", order.id, shippingStatus);
};
