// object.freeze có tác dụng đóng băng object ko thể sửa được
export const BOOKING_STATUS = Object.freeze({
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PAID: "Paid",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
});

export const CANCELLED_BY = Object.freeze({
  USER: "User",
  EMPLOYEE: "Employee",
  SYSTEM: "System",
});
