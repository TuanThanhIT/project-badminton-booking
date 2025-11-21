import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../types/error";
import type {
  AddOrderRequest,
  AddOrderResponse,
  OrderCancelRequest,
  OrderCancelResponse,
  OrderListResponse,
} from "../../types/order";
import orderService from "../../services/orderService";

interface OrderState {
  orders: OrderListResponse;
  message: string | undefined;
  addOrders: AddOrderResponse | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: OrderState = {
  orders: [],
  message: undefined,
  addOrders: undefined,
  loading: false,
  error: undefined,
};

export const addOrder = createAsyncThunk<
  AddOrderResponse,
  { data: AddOrderRequest },
  { rejectValue: ApiErrorType }
>("order/addOrder", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.createOrderService(data);
    return res.data as AddOrderResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getOrders = createAsyncThunk<
  OrderListResponse,
  void,
  { rejectValue: ApiErrorType }
>("order/getOrders", async (_, { rejectWithValue }) => {
  try {
    const res = await orderService.getOrderService();
    return res.data as OrderListResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const cancelOrder = createAsyncThunk<
  OrderCancelResponse,
  { data: OrderCancelRequest },
  { rejectValue: ApiErrorType }
>("order/cancelOrder", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.cancelOrderService(data);
    return res.data as OrderCancelResponse;
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
      // addOrder
      .addCase(addOrder.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.addOrders = action.payload;
      })
      .addCase(addOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.userMessage;
      })

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

      // Cancel Order
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
