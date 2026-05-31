import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  EmployeeOrder,
  EmployeeOrderActionResponse,
  EmployeeOrderDetailResponse,
  EmployeeOrdersData,
  EmployeeOrdersRequest,
  EmployeeOrdersResponse,
  RejectEmployeeOrderActionRequest,
} from "../../../types/order";
import employeeOrderService from "../../../services/employee/orderService";

type EmployeeOrderState = {
  orders: EmployeeOrder[];
  selectedOrder: EmployeeOrder | null;
  summary: EmployeeOrdersData["summary"];
  pagination: EmployeeOrdersData["pagination"];
};

const initialState: EmployeeOrderState = {
  orders: [],
  selectedOrder: null,
  summary: {},
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
};

export const getEmployeeOrders = createAsyncThunk<
  EmployeeOrdersResponse,
  { params: EmployeeOrdersRequest },
  { rejectValue: ApiErrorType }
>("employeeOrder/getEmployeeOrders", async ({ params }, { rejectWithValue }) => {
  try {
    const res = await employeeOrderService.getOrdersService(params);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getEmployeeOrderDetail = createAsyncThunk<
  EmployeeOrderDetailResponse,
  { orderId: number },
  { rejectValue: ApiErrorType }
>("employeeOrder/getEmployeeOrderDetail", async ({ orderId }, { rejectWithValue }) => {
  try {
    const res = await employeeOrderService.getOrderDetailService(orderId);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const actionThunk = (
  type: string,
  fn: (orderId: number, reason?: string) => Promise<{ data: EmployeeOrderActionResponse }>,
) =>
  createAsyncThunk<
    EmployeeOrderActionResponse,
    { orderId: number; data?: RejectEmployeeOrderActionRequest },
    { rejectValue: ApiErrorType }
  >(type, async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const res = await fn(orderId, data?.reason);
      return res.data;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  });

export const confirmEmployeeOrder = actionThunk(
  "employeeOrder/confirmEmployeeOrder",
  (orderId) => employeeOrderService.confirmOrderService(orderId),
);

export const prepareEmployeeOrder = actionThunk(
  "employeeOrder/prepareEmployeeOrder",
  (orderId) => employeeOrderService.prepareOrderService(orderId),
);

export const readyToShipEmployeeOrder = actionThunk(
  "employeeOrder/readyToShipEmployeeOrder",
  (orderId) => employeeOrderService.readyToShipService(orderId),
);

export const shipEmployeeOrder = actionThunk(
  "employeeOrder/shipEmployeeOrder",
  (orderId) => employeeOrderService.shipOrderService(orderId),
);

export const approveCancelEmployeeOrder = actionThunk(
  "employeeOrder/approveCancelEmployeeOrder",
  (orderId) => employeeOrderService.approveCancelService(orderId),
);

export const rejectCancelEmployeeOrder = actionThunk(
  "employeeOrder/rejectCancelEmployeeOrder",
  (orderId, reason) =>
    employeeOrderService.rejectCancelService(orderId, { reason }),
);

export const approveReturnEmployeeOrder = actionThunk(
  "employeeOrder/approveReturnEmployeeOrder",
  (orderId) => employeeOrderService.approveReturnService(orderId),
);

export const completeReturnEmployeeOrder = actionThunk(
  "employeeOrder/completeReturnEmployeeOrder",
  (orderId) => employeeOrderService.completeReturnService(orderId),
);

export const forceReturnGHNEmployeeOrder = actionThunk(
  "employeeOrder/forceReturnGHNEmployeeOrder",
  (orderId) => employeeOrderService.forceReturnGHNService(orderId),
);

const upsertOrder = (orders: EmployeeOrder[], order: EmployeeOrder) => {
  const existed = orders.some((item) => item.id === order.id);
  if (!existed) return orders;
  return orders.map((item) => (item.id === order.id ? order : item));
};

const employeeOrderSlice = createSlice({
  name: "employeeOrder",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEmployeeOrders.fulfilled, (state, action) => {
        state.orders = action.payload.data.items;
        state.summary = action.payload.data.summary;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getEmployeeOrderDetail.fulfilled, (state, action) => {
        state.selectedOrder = action.payload.data;
        state.orders = upsertOrder(state.orders, action.payload.data);
      });
  },
});

export default employeeOrderSlice.reducer;
