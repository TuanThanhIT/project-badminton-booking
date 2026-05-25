// src/utils/constants/bookingPaymentMethod.ts

export const BOOKING_PAYMENT_METHOD = {
  CASH: {
    value: "COD",
    label: "Thanh toán tại sân",
    desc: "Giữ lịch trước, thanh toán khi đến sân",
    icon: "cash",
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
    desc: "Trừ trực tiếp từ số dư ví cá nhân",
    icon: "wallet",
  },
} as const;

export type BookingPaymentMethod =
  (typeof BOOKING_PAYMENT_METHOD)[keyof typeof BOOKING_PAYMENT_METHOD]["value"];

export type BookingPaymentIcon =
  (typeof BOOKING_PAYMENT_METHOD)[keyof typeof BOOKING_PAYMENT_METHOD]["icon"];

export const bookingPaymentMethodList = Object.values(BOOKING_PAYMENT_METHOD);

export const BOOKING_PAYMENT_CONFIRM_MESSAGE: Record<
  BookingPaymentMethod,
  string
> = {
  COD: "Lịch sân sẽ được thanh toán tại sân. Tiếp tục?",
  VNPAY: "Bạn sẽ được chuyển đến cổng thanh toán VNPay. Tiếp tục?",
  WALLET:
    "Bạn sẽ được chuyển đến bước xác nhận OTP để thanh toán bằng ví. Tiếp tục?",
};

export const BOOKING_PAYMENT_RESULT_LABEL: Record<
  BookingPaymentMethod,
  string
> = {
  COD: "Thanh toán tại sân",
  VNPAY: "Thanh toán VNPay",
  WALLET: "Ví B-Hub",
};
