export const ORDER_STATUS = Object.freeze({
  PENDING: "PENDING", // vừa tạo (chưa thanh toán hoặc chờ xử lý)
  CONFIRMED: "CONFIRMED", // shop xác nhận đơn
  PREPARING: "PREPARING", // đang chuẩn bị hàng
  READY_TO_SHIP: "READY_TO_SHIP", // sẵn sàng giao GHN
  SHIPPING: "SHIPPING", // đã bàn giao GHN

  CANCEL_REQUESTED: "CANCEL_REQUESTED", // user yêu cầu hủy
  CANCELLED: "CANCELLED", // bị hủy (user/shop)

  RETURN_REQUESTED: "RETURN_REQUESTED", // user yêu cầu trả hàng
  RETURNING: "RETURNING", // đang hoàn hàng
  RETURNED: "RETURNED", // đã hoàn về shop

  COMPLETED: "COMPLETED", // giao thành công (done business flow)
  FAILED: "FAILED", // giao thất bại
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
  PENDING: "Chưa tạo vận đơn",
  CREATED: "Đã tạo vận đơn",
  PICKING: "Đang lấy hàng",
  PICKED: "Đã lấy hàng",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERING: "Đang giao",
  DELIVERED: "Giao thành công",
  FAILED: "Giao thất bại",
  RETURNING: "Đang hoàn hàng",
  RETURNED: "Đã hoàn về shop",
  CANCELLED: "Đã hủy vận đơn",
});
