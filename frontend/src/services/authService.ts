import {
  type AccountResponse,
  type LoginRequest,
  type LoginResponse,
  type OptVerifyRequest,
  type OtpSendRequest,
  type OtpSendResponse,
  type OtpVerifyResponse,
  type RegisterRequest,
  type RegisterResponse,
} from "../types/auth";
import instance from "../utils/axiosCustomize";

const registerService = (data: RegisterRequest) =>
  instance.post<RegisterResponse>("/auth/register", data);

const loginService = (data: LoginRequest) =>
  instance.post<LoginResponse>("/auth/login", data);

const verifyOtpService = (data: OptVerifyRequest) =>
  instance.post<OtpVerifyResponse>("/auth/verify-otp", data);

const sendOtpService = (data: OtpSendRequest) =>
  instance.post<OtpSendResponse>("/auth/sent-otp", data);

const getAccountService = () => instance.get<AccountResponse>("/auth/account");

const authService = {
  registerService,
  loginService,
  verifyOtpService,
  sendOtpService,
  getAccountService,
};

export default authService;
