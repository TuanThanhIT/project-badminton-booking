export const PAYMENT_METHOD = {
  COD: {
    value: "COD",
    label: "Thanh toán khi nhận hàng",
    desc: "COD",
    icon: "cod",
  },
  VNPAY: {
    value: "VNPAY",
    label: "Thanh toán VNPay",
    desc: "ATM / QR / Visa",
    icon: "vnpay",
  },
  WALLET: {
    value: "WALLET",
    label: "Ví thanh toán BHub",
    desc: "Số dư trong ví",
    icon: "wallet",
  },
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]["value"];

export const paymentMethodList = Object.values(PAYMENT_METHOD);
