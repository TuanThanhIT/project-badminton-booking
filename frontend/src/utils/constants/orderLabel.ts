export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  READY_TO_SHIP: "Chờ bàn giao vận chuyển",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Hoàn thành",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
};

export const SHIPPING_STATUS_LABEL: Record<string, string> = {
  CREATED: "Đã tạo vận đơn",
  PICKING: "Đang lấy hàng",
  PICKED: "Đã lấy hàng",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERING: "Đang giao",
  DELIVERED: "Giao thành công",
  FAILED: "Giao thất bại",
  RETURNING: "Đang hoàn hàng",
  RETURNED: "Đã hoàn hàng",
  CANCELLED: "Đã hủy",
  PENDING: "Chờ xử lý",
};
