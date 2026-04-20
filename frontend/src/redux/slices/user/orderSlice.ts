import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  CalculateShippingRequest,
  CheckoutPreviewData,
  CheckoutPreviewRequest,
  CheckoutPreviewResponse,
} from "../../../types/order";
import orderService from "../../../services/user/orderService";
import discountService from "../../../services/user/discountService";
import type { ApplyDiscountRequest } from "../../../types/discount";

interface OrderState {
  checkoutPreview?: CheckoutPreviewData;
}

const initialState: OrderState = {
  checkoutPreview: undefined,
};

export const getCheckoutPreview = createAsyncThunk<
  CheckoutPreviewResponse,
  { data: CheckoutPreviewRequest },
  { rejectValue: ApiErrorType }
>("order/getCheckoutPreview", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.getCheckoutPreviewService(data);
    return res.data as CheckoutPreviewResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const calculateShipping = createAsyncThunk<
  CheckoutPreviewResponse,
  { data: CalculateShippingRequest },
  { rejectValue: ApiErrorType }
>("order/calculateShipping", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.calculateShippingService(data);
    return res.data as CheckoutPreviewResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const applyDiscount = createAsyncThunk<
  CheckoutPreviewResponse,
  { data: ApplyDiscountRequest },
  { rejectValue: ApiErrorType }
>("discount/applyDiscount", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await discountService.applyDiscountService(data);
    return res.data as CheckoutPreviewResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCheckoutPreview.fulfilled, (state, action) => {
        state.checkoutPreview = action.payload.data;
      })
      .addCase(calculateShipping.fulfilled, (state, action) => {
        state.checkoutPreview = action.payload.data;
      })
      .addCase(applyDiscount.fulfilled, (state, action) => {
        state.checkoutPreview = action.payload.data;
      });
  },
});

export default orderSlice.reducer;
