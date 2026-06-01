// object.freeze có tác dụng đóng băng object ko thể sửa được
export const BOOKING_STATUS = Object.freeze({
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  CANCEL_REQUESTED: "CANCEL_REQUESTED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
});

export const CANCELLED_BY = Object.freeze({
  USER: "USER",
  EMPLOYEE: "EMPLOYEE",
  SYSTEM: "SYSTEM",
});
