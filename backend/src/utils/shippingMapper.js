import { ORDER_STATUS, SHIPPING_STATUS } from "../constants/orderConstant.js";

export const mapGHNStatusToSystem = (ghnStatus) => {
  switch (ghnStatus) {
    case "ready_to_pick":
      return SHIPPING_STATUS.CREATED;

    case "picking":
      return SHIPPING_STATUS.PICKING;

    case "picked":
      return SHIPPING_STATUS.PICKED;

    case "transporting":
      return SHIPPING_STATUS.IN_TRANSIT;

    case "delivering":
      return SHIPPING_STATUS.DELIVERING;

    case "delivered":
      return SHIPPING_STATUS.DELIVERED;

    case "delivery_fail":
      return SHIPPING_STATUS.FAILED;

    case "return":
      return SHIPPING_STATUS.RETURNING;

    case "returned":
      return SHIPPING_STATUS.RETURNED;

    case "cancel":
      return SHIPPING_STATUS.CANCELLED;

    default:
      return SHIPPING_STATUS.PENDING;
  }
};

export const getDisplayStatus = (order) => {
  const { orderStatus, shippingStatus } = order;

  // ===== ƯU TIÊN SHIPPING =====
  switch (shippingStatus) {
    case SHIPPING_STATUS.CREATED:
      return "Đã tạo đơn vận chuyển";

    case SHIPPING_STATUS.PICKING:
      return "Shipper đang lấy hàng";

    case SHIPPING_STATUS.PICKED:
      return "Đã lấy hàng";

    case SHIPPING_STATUS.IN_TRANSIT:
      return "Đang vận chuyển";

    case SHIPPING_STATUS.DELIVERING:
      return "Đang giao hàng";

    case SHIPPING_STATUS.DELIVERED:
      return "Đã giao hàng";

    case SHIPPING_STATUS.FAILED:
      return "Giao hàng thất bại";

    case SHIPPING_STATUS.RETURNING:
      return "Đang hoàn hàng";

    case SHIPPING_STATUS.RETURNED:
      return "Đã hoàn hàng";

    case SHIPPING_STATUS.CANCELLED:
      return "Đơn vận chuyển bị hủy";
  }

  // ===== FALLBACK ORDER =====
  switch (orderStatus) {
    case ORDER_STATUS.PENDING:
      return "Chờ xác nhận";

    case ORDER_STATUS.CONFIRMED:
      return "Đã xác nhận";

    case ORDER_STATUS.PREPARING:
      return "Đang chuẩn bị hàng";

    case ORDER_STATUS.READY_TO_SHIP:
      return "Chờ giao đơn vị vận chuyển";

    case ORDER_STATUS.SHIPPING:
      return "Đang giao hàng";

    case ORDER_STATUS.COMPLETED:
      return "Hoàn thành";

    case ORDER_STATUS.FAILED:
      return "Thất bại";

    case ORDER_STATUS.CANCELLED:
      return "Đã hủy";

    default:
      return "Không xác định";
  }
};
