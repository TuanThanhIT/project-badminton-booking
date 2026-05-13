import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  ApplyDiscountRequest,
  DiscountCheckRequest,
  DiscountCheckResponse,
  DiscountCheckResult,
  DiscountData,
  DiscountRequest,
  DiscountResponse,
} from "../../../types/discount";
import type { ApiErrorType } from "../../../types/error";
import discountService from "../../../services/user/discountService";

interface DiscountState {
  discount: DiscountCheckResult | null;
  loading: boolean;
  discounts: DiscountData[];
}

const initialState: DiscountState = {
  discount: null,
  loading: false,
  discounts: [],
};

export const checkBookingDiscount = createAsyncThunk<
  DiscountCheckResponse,
  DiscountCheckRequest,
  { rejectValue: ApiErrorType }
>("discount/checkBookingDiscount", async (data, { rejectWithValue }) => {
  try {
    const res = await discountService.checkBookingDiscountService(data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getDiscountsCheckout = createAsyncThunk<
  DiscountResponse,
  { data: DiscountRequest },
  { rejectValue: ApiErrorType }
>("discount/getDiscountsCheckout", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await discountService.getDiscountsCheckoutService(data);
    return res.data as DiscountResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    clearDiscount: (state) => {
      state.discount = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkBookingDiscount.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkBookingDiscount.fulfilled, (state, action) => {
        state.discount = action.payload.data;
        state.loading = false;
      })
      .addCase(checkBookingDiscount.rejected, (state) => {
        state.loading = false;
      })

      .addCase(getDiscountsCheckout.fulfilled, (state, action) => {
        state.discounts = action.payload.data;
      });
  },
});

export const { clearDiscount } = discountSlice.actions;
export default discountSlice.reducer;
