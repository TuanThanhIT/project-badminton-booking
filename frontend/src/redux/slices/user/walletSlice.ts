import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  VNPayCallbackRequest,
  WalletCallbackResponse,
  WalletDepositRequest,
  WalletDepositResponse,
  WalletOverviewData,
  WalletOverviewResponse,
  WalletWithdrawCancelRequest,
  WalletWithdrawConfirmRequest,
  WalletWithdrawRequest,
  WalletWithdrawResponse,
} from "../../../types/wallet";
import walletService from "../../../services/user/walletService";

interface WalletState {
  paymentUrl?: string;
  withdrawRequestId?: number;
  overview?: WalletOverviewData;
}

const initialState: WalletState = {
  paymentUrl: undefined,
  withdrawRequestId: undefined,
  overview: undefined,
};

export const getWalletOverview = createAsyncThunk<
  WalletOverviewResponse,
  void,
  { rejectValue: ApiErrorType }
>("wallet/getWalletOverview", async (_, { rejectWithValue }) => {
  try {
    const res = await walletService.getWalletOverviewService();
    return res.data as WalletOverviewResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

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
  { data: VNPayCallbackRequest },
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

export const walletWithdrawCancel = createAsyncThunk<
  WalletWithdrawResponse,
  { data: WalletWithdrawCancelRequest },
  { rejectValue: ApiErrorType }
>("wallet/walletWithdrawCancel", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await walletService.walletWithdrawCancelService(data);
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
    builder
      .addCase(getWalletOverview.fulfilled, (state, action) => {
        state.overview = action.payload.data;
      })
      .addCase(walletDeposit.fulfilled, (state, action) => {
        state.paymentUrl = action.payload.data;
      });

    builder
      .addCase(walletWithdrawRequest.fulfilled, (state, action) => {
        state.withdrawRequestId = action.payload.data.id;
      })
      .addCase(walletWithdrawCancel.fulfilled, (state) => {
        state.withdrawRequestId = undefined;
      });
  },
});

export const { clearWithdrawRequestId } = walletSlice.actions;
export default walletSlice.reducer;
