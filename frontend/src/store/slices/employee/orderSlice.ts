import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  OrderCancelEplRequest,
  OrderCancelEplResponse,
  OrderCompleteRequest,
  OrderCompleteResponse,
  OrderConfirmRequest,
  OrderConfirmResponse,
  OrderEplRequest,
  OrderListEplResponse,
} from "../../../types/order";
import orderService from "../../../services/Employee/orderService";

interface OrderState {
  orders: OrderListEplResponse;
  message: string | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: OrderState = {
  orders: [],
  message: undefined,
  loading: false,
  error: undefined,
};

export const getOrders = createAsyncThunk<
  OrderListEplResponse,
  { data: OrderEplRequest },
  { rejectValue: ApiErrorType }
>("order/getOrders", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.getOrdersService(data);
    return res.data as OrderListEplResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const confirmOrder = createAsyncThunk<
  OrderConfirmResponse,
  { data: OrderConfirmRequest },
  { rejectValue: ApiErrorType }
>("order/confirmOrder", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.confirmOrderService(data);
    return res.data as OrderConfirmResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const completeOrder = createAsyncThunk<
  OrderCompleteResponse,
  { data: OrderCompleteRequest },
  { rejectValue: ApiErrorType }
>("order/completeOrder", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.completeOrderService(data);
    return res.data as OrderCompleteResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const cancelOrder = createAsyncThunk<
  OrderCancelEplResponse,
  { data: OrderCancelEplRequest },
  { rejectValue: ApiErrorType }
>("order/cancelOrder", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.cancelOrderService(data);
    return res.data as OrderCancelEplResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearOrdersError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // getOrders
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      //confirmOrder
      .addCase(confirmOrder.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(confirmOrder.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(confirmOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      //completeOrder
      .addCase(completeOrder.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(completeOrder.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(completeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

      //cancelOrder
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      });
  },
});
export const { clearOrdersError } = orderSlice.actions;
export default orderSlice.reducer;
