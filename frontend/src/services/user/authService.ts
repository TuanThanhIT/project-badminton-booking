import {
  type AccountResponse,
  type LoginRequest,
  type LoginResponse,
  type LogoutResponse,
  type OtpSendRequest,
  type OtpSendResponse,
  type OtpVerifyRequest,
  type OtpVerifyResetResponse,
  type OtpVerifyResponse,
  type RefreshTokenResponse,
  type RegisterRequest,
  type RegisterResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
} from "../../types/auth";
import instance from "../../utils/axiosCustomize";

const registerService = (data: RegisterRequest) =>
  instance.post<RegisterResponse>("/user/auth/register", data);

const loginService = (data: LoginRequest) =>
  instance.post<LoginResponse>("/user/auth/login", data);

const verifyOtpService = (data: OtpVerifyRequest) =>
  instance.post<OtpVerifyResponse>("/user/auth/verify-account", data);

const sendOtpService = (data: OtpSendRequest) =>
  instance.post<OtpSendResponse>("/user/auth/send-otp", data);

const verifyOtpResetService = (data: OtpVerifyRequest) =>
  instance.post<OtpVerifyResetResponse>(
    "/user/auth/reset-password/verify-otp",
    data,
  );

const resetPasswordService = (data: ResetPasswordRequest) =>
  instance.post<ResetPasswordResponse>("/user/auth/reset-password", data);

const refreshTokenService = () =>
  instance.post<RefreshTokenResponse>("/user/auth/refresh-token");

const getAccountService = () => instance.get<AccountResponse>("/user/auth/me");

const logoutService = () => instance.post<LogoutResponse>("/user/auth/logout");

const authService = {
  registerService,
  loginService,
  verifyOtpService,
  sendOtpService,
  getAccountService,
  verifyOtpResetService,
  resetPasswordService,
  refreshTokenService,
  logoutService,
};

export default authService;
