export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
};

export type AccountResponse = {
  id: number;
  email: string;
  username: string;
};

export type RegisterRequest = {
  username: string;
  password: string;
  email: string;
};

export type RegisterResponse = {
  message: string;
  safeUser: {
    id: number;
    username: string;
    email: string;
    roleId: number;
    isVerified: boolean;
    isActive: boolean;
    createdDate: string;
  };
};

export type OptVerifyRequest = {
  email: string;
  otpCode: string;
};

export type OtpVerifyResponse = {
  message: string;
};

export type OtpSendRequest = {
  email: string;
};

export type OtpSendResponse = {
  message: string;
};

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

// Kiểu dữ liệu cho toàn bộ context
export interface AuthContextType {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
  appLoading: boolean;
  setAppLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
