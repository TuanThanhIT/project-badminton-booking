export const ORDER_STATUS = Object.freeze({
  PENDING: "PENDING", // vừa tạo
  CONFIRMED: "CONFIRMED", // shop xác nhận
  PREPARING: "PREPARING", // đang chuẩn bị hàng
  READY_TO_SHIP: "READY_TO_SHIP", // sẵn sàng giao
  SHIPPING: "SHIPPING", // đã giao GHN
  DELIVERED: "DELIVERED", // giao thành công
  FAILED: "FAILED", // giao thất bại
  CANCELLED: "CANCELLED",
});

export const ORDER_GROUP_STATUS = Object.freeze({
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
});

export const SHIPPING_STATUS = Object.freeze({
  PENDING: "PENDING", // chưa tạo GHN
  CREATED: "CREATED", // đã tạo đơn GHN
  PICKING: "PICKING", // GHN đang lấy hàng
  IN_TRANSIT: "IN_TRANSIT", // đang vận chuyển
  DELIVERED: "DELIVERED", // giao thành công
  FAILED: "FAILED", // giao thất bại / hoàn
});
