import { ORDER_STATUS, SHIPPING_STATUS } from "../constants/orderConstant.js";

const normalizeGHNStatus = (ghnStatus) =>
  String(ghnStatus || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const GHN_STATUS_MAP = Object.freeze({
  created: SHIPPING_STATUS.CREATED,
  ready_to_pick: SHIPPING_STATUS.CREATED,

  picking: SHIPPING_STATUS.PICKING,
  money_collect_picking: SHIPPING_STATUS.PICKING,

  picked: SHIPPING_STATUS.PICKED,

  storing: SHIPPING_STATUS.IN_TRANSIT,
  sorting: SHIPPING_STATUS.IN_TRANSIT,
  transporting: SHIPPING_STATUS.IN_TRANSIT,
  in_transit: SHIPPING_STATUS.IN_TRANSIT,

  delivering: SHIPPING_STATUS.DELIVERING,
  money_collect_delivering: SHIPPING_STATUS.DELIVERING,

  delivered: SHIPPING_STATUS.DELIVERED,

  delivery_fail: SHIPPING_STATUS.FAILED,
  failed: SHIPPING_STATUS.FAILED,
  return_fail: SHIPPING_STATUS.FAILED,
  exception: SHIPPING_STATUS.FAILED,
  damage: SHIPPING_STATUS.FAILED,
  lost: SHIPPING_STATUS.FAILED,

  waiting_to_return: SHIPPING_STATUS.RETURNING,
  return: SHIPPING_STATUS.RETURNING,
  returning: SHIPPING_STATUS.RETURNING,
  return_transporting: SHIPPING_STATUS.RETURNING,
  return_sorting: SHIPPING_STATUS.RETURNING,

  returned: SHIPPING_STATUS.RETURNED,

  cancel: SHIPPING_STATUS.CANCELLED,
  cancelled: SHIPPING_STATUS.CANCELLED,
});

export const isKnownGHNStatus = (ghnStatus) =>
  Boolean(GHN_STATUS_MAP[normalizeGHNStatus(ghnStatus)]);

export const mapGHNStatusToSystem = (ghnStatus) => {
  return GHN_STATUS_MAP[normalizeGHNStatus(ghnStatus)] || SHIPPING_STATUS.PENDING;
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
