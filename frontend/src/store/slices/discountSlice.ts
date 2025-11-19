import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  DiscountResponse,
  UpdateDiscountResponse,
} from "../../types/discount";
import type { ApiErrorType } from "../../types/error";
import discountService from "../../services/discountService";
import discountBookingService from "../../services/discountBookingService";

interface DiscountState {
  discount?: DiscountResponse;
  message?: string;
  loading: boolean;
  error: string | undefined;
}

const initialState: DiscountState = {
  discount: undefined,
  message: undefined,
  loading: false,
  error: undefined,
};

export const applyDiscount = createAsyncThunk<
  DiscountResponse,
  { code: string; orderAmount: number },
  { rejectValue: ApiErrorType }
>(
  "discount/applyDiscount",
  async ({ code, orderAmount }, { rejectWithValue }) => {
    try {
      const res = await discountService.applyDiscountService(code, orderAmount);
      return res.data as DiscountResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  }
);

export const applyDiscountBooking = createAsyncThunk<
  DiscountResponse,
  { code: string; bookingAmount: number },
  { rejectValue: ApiErrorType }
>(
  "discount/applyDiscountBooking",
  async ({ code, bookingAmount }, { rejectWithValue }) => {
    try {
      const res = await discountBookingService.applyDiscountBookingService(
        code,
        bookingAmount
      );
      return res.data as DiscountResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  }
);

export const updateDiscount = createAsyncThunk<
  UpdateDiscountResponse,
  { code: string },
  { rejectValue: ApiErrorType }
>("discount/updateDiscount", async ({ code }, { rejectWithValue }) => {
  try {
    const res = await discountService.updateDiscountService(code);
    return res.data as UpdateDiscountResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});
const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    clearDiscountError(state) {
      state.error = undefined;
    },
    clearDiscount(state) {
      state.discount = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // applyDiscount
      .addCase(applyDiscount.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(applyDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.discount = action.payload;
      })
      .addCase(applyDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })
      // updateDiscount
      .addCase(updateDiscount.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(updateDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(updateDiscount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })
      // applyDiscountBooking
      .addCase(applyDiscountBooking.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(applyDiscountBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.discount = action.payload;
      })
      .addCase(applyDiscountBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      });
  },
});
export const { clearDiscountError, clearDiscount } = discountSlice.actions;
export default discountSlice.reducer;
