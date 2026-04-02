import { CANCELLED } from "dns";

export const PAYMENT_STATUS = Object.freeze({
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
  PAID: "PAID",
});

export const PAYMENT_METHOD_STATUS = Object.freeze({
  COD: "COD",
  VNPAY: "VNPAY",
  WALLET: "WALLET",
});

export const WALLET_TRANSACTION_TYPE = Object.freeze({
  DEPOSIT: "DEPOSIT",
  PAYMENT: "PAYMENT",
  REFUNDED: "REFUNDED",
  WITHDRAW: "WITHDRAW",
});

export const TARGET_PAYMENT_TYPE = Object.freeze({
  ORDER: "ORDER",
  BOOKING: "BOOKING",
  WALLET_TOPUP: "WALLET_TOPUP",
});

export const WALLET_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
});

export const WITHDRAW_REQUEST_STATUS = Object.freeze({
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
});
