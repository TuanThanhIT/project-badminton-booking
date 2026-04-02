import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  WalletCallbackRequest,
  WalletCallbackResponse,
  WalletDepositRequest,
  WalletDepositResponse,
  WalletWithdrawConfirmRequest,
  WalletWithdrawRequest,
  WalletWithdrawResponse,
} from "../../../types/wallet";
import walletService from "../../../services/user/walletService";

interface WalletState {
  paymentUrl?: string;
  withdrawRequestId?: number;
}

const initialState: WalletState = {
  paymentUrl: undefined,
  withdrawRequestId: undefined,
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

export const walletWithdrawRequest = createAsyncThunk<
  WalletWithdrawResponse,
  { data: WalletWithdrawRequest },
  { rejectValue: ApiErrorType }
>("wallet/walletWithdrawRequest", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await walletService.walletWithdrawRequestService(data);
    return res.data as WalletWithdrawResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const walletWithdrawConfirm = createAsyncThunk<
  WalletWithdrawResponse,
  { data: WalletWithdrawConfirmRequest },
  { rejectValue: ApiErrorType }
>("wallet/walletWithdrawConfirm", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await walletService.walletWithdrawConfirmService(data);
    return res.data as WalletWithdrawResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearWithdrawRequestId(state) {
      state.withdrawRequestId = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(walletDeposit.fulfilled, (state, action) => {
      state.paymentUrl = action.payload.data;
    });

    builder.addCase(walletWithdrawRequest.fulfilled, (state, action) => {
      state.withdrawRequestId = action.payload.data.id;
    });
  },
});

export const { clearWithdrawRequestId } = walletSlice.actions;
export default walletSlice.reducer;
