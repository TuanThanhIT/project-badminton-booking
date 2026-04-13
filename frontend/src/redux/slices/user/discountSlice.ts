import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  DiscountCheckRequest,
  DiscountCheckResponse,
  DiscountCheckResult,
} from "../../../types/discount";
import type { ApiErrorType } from "../../../types/error";
import discountService from "../../../services/user/discountService";

interface DiscountState {
  discount: DiscountCheckResult | null;
  loading: boolean;
}

const initialState: DiscountState = {
  discount: null,
  loading: false,
};

// 🔥 THUNK
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

const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    clearDiscount: (state) => {
      state.discount = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkBookingDiscount.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(checkBookingDiscount.fulfilled, (state, action) => {
      state.discount = action.payload.data;
      state.loading = false;
    });

    builder.addCase(checkBookingDiscount.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { clearDiscount } = discountSlice.actions;
export default discountSlice.reducer;
