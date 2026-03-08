import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { LoginRequest, LoginResponse, User } from "../../../types/auth";
import type { ApiErrorType } from "../../../types/error";
import authService from "../../../services/customer/authService";

interface AuthState {
  user?: User;
  token?: string;
  message?: string;
  loading: boolean;
  error?: string;
}

const initialState: AuthState = {
  user: undefined,
  token: undefined,
  message: undefined,
  loading: false,
  error: undefined,
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

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // addBookingFeedback
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.access_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export default authSlice.reducer;
