export const ORDER_STATUS = Object.freeze({
  PENDING: "PENDING", // vừa tạo (chưa thanh toán hoặc chờ xử lý)
  CONFIRMED: "CONFIRMED", // shop xác nhận đơn
  PREPARING: "PREPARING", // đang chuẩn bị hàng
  READY_TO_SHIP: "READY_TO_SHIP", // sẵn sàng giao GHN
  SHIPPING: "SHIPPING", // đã bàn giao GHN

  COMPLETED: "COMPLETED", // giao thành công (done business flow)
  FAILED: "FAILED", // giao thất bại
  CANCELLED: "CANCELLED", // bị hủy (user/shop)
});

export const ORDER_GROUP_STATUS = Object.freeze({
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
});

export const SHIPPING_STATUS = Object.freeze({
  PENDING: "PENDING", // chưa tạo GHN

  CREATED: "CREATED", // đã tạo đơn GHN (ready_to_pick)
  PICKING: "PICKING", // đang lấy hàng
  PICKED: "PICKED", // đã lấy hàng xong

  IN_TRANSIT: "IN_TRANSIT", // đang vận chuyển
  DELIVERING: "DELIVERING", // đang giao cho khách

  DELIVERED: "DELIVERED", // giao thành công

  FAILED: "FAILED", // giao thất bại
  RETURNING: "RETURNING", // đang hoàn hàng
  RETURNED: "RETURNED", // đã hoàn về shop

  CANCELLED: "CANCELLED", // GHN hủy
});

export const SHIPPING_TRACKING_LABEL = Object.freeze({
  CREATED: "Đã tạo vận đơn",
  PICKING: "Đang lấy hàng",
  PICKED: "Đã lấy hàng",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERING: "Đang giao",
  DELIVERED: "Giao thành công",
  FAILED: "Giao thất bại",
});
