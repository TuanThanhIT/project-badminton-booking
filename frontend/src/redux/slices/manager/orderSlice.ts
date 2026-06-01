import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import managerOrderService from "../../../services/manager/orderService";
import type { ApiErrorType } from "../../../types/error";
import type {
  ManagerOrder,
  ManagerOrderDetailResponse,
  ManagerMonthlyHighlightsData,
  ManagerMonthlyHighlightsRequest,
  ManagerOrdersData,
  ManagerOrdersRequest,
  ManagerOrdersResponse,
} from "../../../types/order";

type ManagerOrderState = {
  loading: boolean;
  orders: ManagerOrder[];
  selectedOrder: ManagerOrder | null;
  monthlyHighlights: ManagerMonthlyHighlightsData | null;
  summary: ManagerOrdersData["summary"];
  pagination: ManagerOrdersData["pagination"];
};

const initialState: ManagerOrderState = {
  loading: false,
  orders: [],
  selectedOrder: null,
  monthlyHighlights: null,
  summary: {},
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
};

///MANAGER
export const getManagerOrders = createAsyncThunk<
  ManagerOrdersResponse,
  ManagerOrdersRequest | undefined,
  { rejectValue: ApiErrorType }
>("managerOrder/getManagerOrders", async (params = {}, { rejectWithValue }) => {
  try {
    const res = await managerOrderService.getOrdersService(params);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

///MANAGER
export const getManagerOrderDetail = createAsyncThunk<
  ManagerOrderDetailResponse,
  { orderId: number },
  { rejectValue: ApiErrorType }
>("managerOrder/getManagerOrderDetail", async ({ orderId }, { rejectWithValue }) => {
  try {
    const res = await managerOrderService.getOrderDetailService(orderId);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getManagerMonthlyHighlights = createAsyncThunk<
  ManagerMonthlyHighlightsData,
  ManagerMonthlyHighlightsRequest | undefined,
  { rejectValue: ApiErrorType }
>("managerOrder/getMonthlyHighlights", async (params = {}, { rejectWithValue }) => {
  try {
    const res = await managerOrderService.getMonthlyHighlightsService(params);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const upsertOrder = (orders: ManagerOrder[], order: ManagerOrder) => {
  if (!orders.some((item) => item.id === order.id)) return orders;
  return orders.map((item) => (item.id === order.id ? order : item));
};

///MANAGER
const orderSlice = createSlice({
  name: "managerOrder",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getManagerOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getManagerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data.items;
        state.summary = action.payload.data.summary;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getManagerOrders.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getManagerOrderDetail.fulfilled, (state, action) => {
        state.selectedOrder = action.payload.data;
        state.orders = upsertOrder(state.orders, action.payload.data);
      })
      .addCase(getManagerMonthlyHighlights.fulfilled, (state, action) => {
        state.monthlyHighlights = action.payload;
      });
  },
});

export default orderSlice.reducer;
