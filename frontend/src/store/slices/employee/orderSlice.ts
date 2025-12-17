import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  CountOrderRequest,
  CountOrderResponse,
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
import orderAdminService from "../../../services/Admin/orderService";

interface OrderState {
  orders: OrderListEplResponse | undefined;
  countOrders: CountOrderResponse;
  message: string | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: OrderState = {
  orders: undefined,
  countOrders: [],
  message: undefined,
  loading: false,
  error: undefined,
};

type OrderStatus = "Pending" | "Paid" | "Confirmed" | "Completed" | "Cancelled";

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

export const countOrderByStatus = createAsyncThunk<
  CountOrderResponse,
  { data: CountOrderRequest },
  { rejectValue: ApiErrorType }
>("order/countOrderByStatus", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderAdminService.countOrderByOrderStatusService(data);
    return res.data as CountOrderResponse;
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
    updateOrderStatusLocal(
      state,
      action: PayloadAction<{ orderId: number; orderStatus: OrderStatus }>
    ) {
      if (!state.orders) return;

      const { orderId, orderStatus } = action.payload;
      const index = state.orders.orders.findIndex((n) => n.id === orderId);

      if (index !== -1) {
        state.orders.orders[index].orderStatus = orderStatus;
      }
    },

    setOrdersLocal(
      state,
      action: PayloadAction<{ prevOrders: OrderListEplResponse }>
    ) {
      state.orders = action.payload.prevOrders;
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
      })

      // countOrderByStatus
      .addCase(countOrderByStatus.fulfilled, (state, action) => {
        state.countOrders = action.payload;
      });
  },
});
export const { clearOrdersError, updateOrderStatusLocal, setOrdersLocal } =
  orderSlice.actions;
export default orderSlice.reducer;
