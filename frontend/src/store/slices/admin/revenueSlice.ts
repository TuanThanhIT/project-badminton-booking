import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  RevenueBeverageResponse,
  RevenueDateResponse,
  RevenueOverviewResponse,
  RevenueProductResponse,
  RevenueRequest,
  RevenueTransactionResponse,
} from "../../../types/revenue";
import revenueService from "../../../services/admin/revenueService";

interface RevenueState {
  revenueOverview: RevenueOverviewResponse | undefined;
  revenueDate: RevenueDateResponse | undefined;
  revenueTransaction: RevenueTransactionResponse | undefined;
  revenueProduct: RevenueProductResponse | undefined;
  revenueBeverage: RevenueBeverageResponse | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: RevenueState = {
  revenueOverview: undefined,
  revenueDate: undefined,
  revenueTransaction: undefined,
  revenueProduct: undefined,
  revenueBeverage: undefined,
  loading: false,
  error: undefined,
};

export const getRevenueOverview = createAsyncThunk<
  RevenueOverviewResponse,
  { data: RevenueRequest },
  { rejectValue: ApiErrorType }
>("revenue/getRevenueOverview", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await revenueService.getRevenueOverviewService(data);
    return res.data as RevenueOverviewResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getRevenueDate = createAsyncThunk<
  RevenueDateResponse,
  { data: RevenueRequest },
  { rejectValue: ApiErrorType }
>("revenue/getRevenueDate", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await revenueService.getRevenueDateService(data);
    return res.data as RevenueDateResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getRevenueTransaction = createAsyncThunk<
  RevenueTransactionResponse,
  { data: RevenueRequest },
  { rejectValue: ApiErrorType }
>("revenue/getRevenueTransaction", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await revenueService.getRevenueTransactionService(data);
    return res.data as RevenueTransactionResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getRevenueProduct = createAsyncThunk<
  RevenueProductResponse,
  { data: RevenueRequest },
  { rejectValue: ApiErrorType }
>("revenue/getRevenueProduct", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await revenueService.getRevenueProductService(data);
    return res.data as RevenueProductResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getRevenueBeverage = createAsyncThunk<
  RevenueBeverageResponse,
  { data: RevenueRequest },
  { rejectValue: ApiErrorType }
>("revenue/getRevenueBeverage", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await revenueService.getRevenueBeverageService(data);
    return res.data as RevenueBeverageResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const revenueSlice = createSlice({
  name: "revenue",
  initialState,
  reducers: {
    clearRevenueError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRevenueOverview.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getRevenueOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueOverview = action.payload;
      })
      .addCase(getRevenueOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      .addCase(getRevenueDate.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getRevenueDate.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueDate = action.payload;
      })
      .addCase(getRevenueDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      .addCase(getRevenueTransaction.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getRevenueTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueTransaction = action.payload;
      })
      .addCase(getRevenueTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      .addCase(getRevenueProduct.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getRevenueProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueProduct = action.payload;
      })
      .addCase(getRevenueProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      .addCase(getRevenueBeverage.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getRevenueBeverage.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueBeverage = action.payload;
      })
      .addCase(getRevenueBeverage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      });
  },
});
export const { clearRevenueError } = revenueSlice.actions;
export default revenueSlice.reducer;
