export const DISCOUNT_TYPE = Object.freeze({
  AMOUNT: "AMOUNT",
  PERCENT: "PERCENT",
});

export const DISCOUNT_APPLY_TYPE = Object.freeze({
  ORDER: "ORDER",
  BOOKING: "BOOKING",
  ALL: "ALL",
});

export const DISCOUNT_TARGET_TYPE = Object.freeze({
  ORDER: "ORDER",
  BOOKING: "BOOKING",
});

export const DISCOUNT_VISIBILITY = Object.freeze({
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
});

// Nhóm khách hàng để gửi mã riêng (khớp dữ liệu admin insights).
export const DISCOUNT_SEGMENT = Object.freeze({
  LOYAL: "LOYAL", // Khách hay đặt sân — mã tri ân
  WINBACK: "WINBACK", // Khách lâu chưa quay lại — mã kéo về
});

export const NOTIFICATION_TYPE_PROMOTION = "PROMOTION";
