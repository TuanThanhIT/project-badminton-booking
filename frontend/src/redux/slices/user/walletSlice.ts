import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  WalletCallbackRequest,
  WalletCallbackResponse,
  WalletDepositRequest,
  WalletDepositResponse,
} from "../../../types/wallet";
import walletService from "../../../services/user/walletService";
import { data } from "react-router-dom";
import { PawPrint } from "lucide-react";

interface WalletState {
  paymentUrl?: string;
}

const initialState: WalletState = {
  paymentUrl: undefined,
};

export const walletDeposit = createAsyncThunk<
  WalletDepositResponse,
  { data: WalletDepositRequest },
  { rejectValue: ApiErrorType }
>("wallet/walletDeposit", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await walletService.walletDepositService(data);
    return res.data as WalletDepositResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const walletCallback = createAsyncThunk<
  WalletCallbackResponse,
  { data: WalletCallbackRequest },
  { rejectValue: ApiErrorType }
>("wallet/walletCallback", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await walletService.walletCallbackService(data);
    return res.data as WalletCallbackResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(walletDeposit.fulfilled, (state, action) => {
      state.paymentUrl = action.payload.data;
    });
  },
});

export default walletSlice.reducer;
