import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  AccountResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  OtpFlowData,
  OtpSendRequest,
  OtpSendResponse,
  OtpVerifyRequest,
  OtpVerifyResetResponse,
  OtpVerifyResponse,
  RefreshTokenResponse,
  RegisterData,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
} from "../../../types/auth";
import type { ApiErrorType } from "../../../types/error";
import authService from "../../../services/user/authService";

const accessToken = localStorage.getItem("accessToken");
interface AuthState {
  user?: User;
  accessToken?: string;
  userRegister?: RegisterData;
  otpFlow: OtpFlowData;
}

const initialState: AuthState = {
  user: undefined,
  accessToken: accessToken || undefined,
  userRegister: undefined,
  otpFlow: {
    email: undefined,
    withdrawRequestId: undefined,
    type: undefined,
  },
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

export const otpVerifyReset = createAsyncThunk<
  OtpVerifyResetResponse,
  { data: OtpVerifyRequest },
  { rejectValue: ApiErrorType }
>("auth/otpVerifyReset", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await authService.verifyOtpResetService(data);
    return res.data as OtpVerifyResetResponse;
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

export const refreshTokenThunk = createAsyncThunk<
  RefreshTokenResponse,
  void,
  { rejectValue: ApiErrorType }
>("auth/refreshTokenThunk", async (_, { rejectWithValue }) => {
  try {
    const res = await authService.refreshTokenService();
    return res.data as RefreshTokenResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const logout = createAsyncThunk<
  LogoutResponse,
  void,
  { rejectValue: ApiErrorType }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    const res = await authService.logoutService();
    return res.data as LogoutResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutLocal: (state) => {
      state.user = undefined;
      state.accessToken = undefined;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("branchIds");
      localStorage.removeItem("countdown");
    },
    setOtpFlow: (state, action: PayloadAction<{ data: OtpFlowData }>) => {
      state.otpFlow = action.payload.data;
      // lưu localStorage
      sessionStorage.setItem("otpFlow", JSON.stringify(action.payload));
    },

    clearOtpFlow: (state) => {
      state.otpFlow = {
        email: undefined,
        withdrawRequestId: undefined,
        type: undefined,
      };
      sessionStorage.removeItem("otpFlow");
    },
    syncAuthUserProfile: (state, action: PayloadAction<any>) => {
      if (!state.user) return;
      const profileData = action.payload?.data !== undefined ? action.payload.data : action.payload;
      if (!profileData) return;
      state.user = {
        ...state.user,
        username: profileData.username || state.user.username,
        profile: {
          fullName: profileData.profile?.fullName,
          avatar: profileData.profile?.avatar ?? null,
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.data.user;
        state.accessToken = action.payload.data.accessToken;
        localStorage.setItem("accessToken", action.payload.data.accessToken);
      })

      // getAccount
      .addCase(getAccount.fulfilled, (state, action) => {
        state.user = action.payload.data;
      })

      // register
      .addCase(registerAccount.fulfilled, (state, action) => {
        state.userRegister = action.payload.data;
      })

      // refreshToken
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.data.accessToken;
        localStorage.setItem("accessToken", action.payload.data.accessToken);
      });
  },
});

export const { logoutLocal, setOtpFlow, clearOtpFlow, syncAuthUserProfile } =
  authSlice.actions;
export default authSlice.reducer;
