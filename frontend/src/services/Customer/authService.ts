import {
  type AccountResponse,
  type LoginRequest,
  type LoginResponse,
  type OtpSendRequest,
  type OtpSendResponse,
  type OtpVerifyRequest,
  type OtpVerifyResponse,
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
  instance.post<OtpVerifyResponse>("/user/auth/verify-otp", data);

const sendOtpService = (data: OtpSendRequest) =>
  instance.post<OtpSendResponse>("/user/auth/sent-otp", data);

const resetPasswordService = (data: ResetPasswordRequest) =>
  instance.post<ResetPasswordResponse>("/user/auth/password/reset", data);

const getAccountService = () => instance.get<AccountResponse>("/user/auth/me");

const authService = {
  registerService,
  loginService,
  verifyOtpService,
  sendOtpService,
  getAccountService,
  resetPasswordService,
};

export default authService;
