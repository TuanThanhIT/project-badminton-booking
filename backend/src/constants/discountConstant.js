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

export const DISCOUNT_APPLICATION_MODE = Object.freeze({
  CODE: "CODE",
  AUTOMATIC: "AUTOMATIC",
});

export const DISCOUNT_USAGE_LIMIT_PERIOD = Object.freeze({
  MONTHLY: "MONTHLY",
});

export const DISCOUNT_USAGE_REFERENCE_TYPE = Object.freeze({
  ORDER: "ORDER",
  BOOKING: "BOOKING",
});

export const DISCOUNT_USAGE_STATUS = Object.freeze({
  PENDING: "PENDING",
  USED: "USED",
  RESTORED: "RESTORED",
  CANCELLED: "CANCELLED",
});

export const WALLET_PAYMENT_PROMOTION = Object.freeze({
  CAMPAIGN_KEY: "BHUB_WALLET_PAYMENT",
  CODE: "BHUB_WALLET_10",
});

export const NOTIFICATION_TYPE_PROMOTION = "PROMOTION";
