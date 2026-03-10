export const PAYMENT_STATUS = Object.freeze({
  PENDING: "Pending",
  SUCCESS: "Success",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  PAID: "Paid",
});

export const PAYMENT_METHOD_STATUS = Object.freeze({
  COD: "COD",
  MOMO: "MOMO",
});

export const WALLET_TRANSACTION_TYPE = Object.freeze({
  DEPOSIT: "Deposit",
  PAYMENT: "Payment",
  REFUNDED: "Refunded",
});

export const TARGET_PAYMENT_TYPE = Object.freeze({
  ORDER: "Order",
  BOOKING: "Booking",
});
