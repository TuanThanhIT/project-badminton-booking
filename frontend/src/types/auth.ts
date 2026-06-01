import type { ApiResponse } from "./api";

export type User = {
  id: number;
  email: string;
  username: string;
  role: string;
  branchIds?: number[];
  profile?: {
    fullName?: string;
    avatar?: string | null;
  } | null;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginData = {
  accessToken: string;
  user: User;
};

export type LoginResponse = ApiResponse<LoginData>;

export type AccountResponse = ApiResponse<User>;

export type RegisterRequest = {
  username: string;
  password: string;
  email: string;
};

export type RegisterData = {
  id: number;
  username: string;
  email: string;
  roleId: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
};

export type RegisterResponse = ApiResponse<RegisterData>;

export type OtpVerifyRequest = {
  email: string;
  otpCode: string;
};

export type OtpVerifyResponse = ApiResponse<null>;

export type OtpSendRequest = {
  email: string;
  type: string;
};

export type OtpSendResponse = ApiResponse<null>;

export type OtpVerifyResetData = {
  resetToken: string;
};

export type OtpVerifyResetResponse = ApiResponse<OtpVerifyResetData>;

export type ResetPasswordRequest = {
  resetToken: string;
  newPassword: string;
};

export type ResetPasswordResponse = ApiResponse<null>;

export type RefreshTokenData = {
  accessToken: string;
};

export type RefreshTokenResponse = ApiResponse<RefreshTokenData>;

export type OtpFlowData = {
  email?: string;
  withdrawRequestId?: number;
  orderGroupId?: number;
  bookingId?: number;
  type?: string;
};

export type ConfirmEmailResponse = ApiResponse<null>;

export type LogoutResponse = ApiResponse<null>;

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
}

export interface AuthContextType {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
}
