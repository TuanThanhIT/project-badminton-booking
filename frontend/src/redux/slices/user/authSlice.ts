import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  AccountResponse,
  LoginRequest,
  LoginResponse,
  OtpSendRequest,
  OtpSendResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  RegisterData,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
} from "../../../types/auth";
import type { ApiErrorType } from "../../../types/error";
import authService from "../../../services/user/authService";

const token = localStorage.getItem("access_token");

interface AuthState {
  user?: User;
  token?: string;
  userRegister?: RegisterData;
}

const initialState: AuthState = {
  user: undefined,
  token: token || undefined,
  userRegister: undefined,
};

export const login = createAsyncThunk<
  LoginResponse,
  { data: LoginRequest },
  { rejectValue: ApiErrorType }
>("auth/login", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await authService.loginService(data);
    return res.data as LoginResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getAccount = createAsyncThunk<
  AccountResponse,
  void,
  { rejectValue: ApiErrorType }
>("auth/getAccount", async (_, { rejectWithValue }) => {
  try {
    const res = await authService.getAccountService();
    return res.data as AccountResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const registerAccount = createAsyncThunk<
  RegisterResponse,
  { data: RegisterRequest },
  { rejectValue: ApiErrorType }
>("auth/registerAccount", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await authService.registerService(data);
    return res.data as RegisterResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const otpVerify = createAsyncThunk<
  OtpVerifyResponse,
  { data: OtpVerifyRequest },
  { rejectValue: ApiErrorType }
>("auth/otpVerify", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await authService.verifyOtpService(data);
    return res.data as OtpVerifyResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const otpSend = createAsyncThunk<
  OtpSendResponse,
  { data: OtpSendRequest },
  { rejectValue: ApiErrorType }
>("auth/otpSend", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await authService.sendOtpService(data);
    return res.data as OtpSendResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const resetPassword = createAsyncThunk<
  ResetPasswordResponse,
  { data: ResetPasswordRequest },
  { rejectValue: ApiErrorType }
>("auth/resetPassword", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await authService.resetPasswordService(data);
    return res.data as ResetPasswordResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = undefined;
      state.token = undefined;
      localStorage.removeItem("access_token");
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.data.user;
        state.token = action.payload.data.access_token;
        localStorage.setItem("access_token", action.payload.data.access_token);
      })

      // getAccount
      .addCase(getAccount.fulfilled, (state, action) => {
        state.user = action.payload.data;
      })

      // register
      .addCase(registerAccount.fulfilled, (state, action) => {
        state.userRegister = action.payload.data;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
