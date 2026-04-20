export const paymentMethods = ["COD", "VNPAY", "WALLET"] as const;

export type PaymentMethod = (typeof paymentMethods)[number];
