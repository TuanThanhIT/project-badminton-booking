export const OTP_TYPE = {
  REGISTER: "REGISTER",
  WITHDRAW_REQUEST: "WITHDRAW_REQUEST",
  RESET_PASSWORD: "RESET_PASSWORD",
} as const;

export type OtpType = (typeof OTP_TYPE)[keyof typeof OTP_TYPE];
