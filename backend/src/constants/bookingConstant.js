// object.freeze có tác dụng đóng băng object ko thể sửa được
export const BOOKING_STATUS = Object.freeze({
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PAID: "PAID",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
});

export const CANCELLED_BY = Object.freeze({
  USER: "USER",
  EMPLOYEE: "EMPLOYEE",
  SYSTEM: "SYSTEM",
});
