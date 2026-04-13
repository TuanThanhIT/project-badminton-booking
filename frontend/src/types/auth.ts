import type { ApiResponse } from "./api";

export type User = {
  id: number;
  email: string;
  username: string;
  role: string;
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
  access_token: string;
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
  createdDate: string;
};

export type RegisterResponse = ApiResponse<RegisterData>;

export type OtpVerifyRequest = {
  email: string;
  otpCode: string;
};

export type OtpVerifyResponse = ApiResponse<null>;

export type OtpSendRequest = {
  email: string;
};

export type OtpSendResponse = ApiResponse<null>;

export type ResetPasswordRequest = {
  email: string;
  otpCode: string;
  newPassword: string;
};

export type ResetPasswordResponse = ApiResponse<null>;

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
