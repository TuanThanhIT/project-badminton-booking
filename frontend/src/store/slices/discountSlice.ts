import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { DiscountResponse } from "../../types/discount";
import type { ApiErrorType } from "../../types/error";
import discountService from "../../services/discountService";

interface DiscountState {
  discount?: DiscountResponse;
  loading: boolean;
  error: string | undefined;
}

const initialState: DiscountState = {
  discount: undefined,
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
      // fetchCart
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
      });
  },
});
export const { clearDiscountError, clearDiscount } = discountSlice.actions;
export default discountSlice.reducer;
