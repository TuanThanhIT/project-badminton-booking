import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  CalculateShippingRequest,
  CheckoutPreviewData,
  CheckoutPreviewRequest,
  CheckoutPreviewResponse,
  ClearCheckoutSessionRequest,
  ClearCheckoutSessionResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderCallbackResponse,
  OrderDetailData,
  OrderDetailResponse,
  OrderGroupIdRequest,
  OrderGroupIdResponse,
  OrderRequest,
  OrderShippingRealtimePayload,
  OrderTrackingItem,
  OrderTrackingProgressItem,
  OrderTrackingResponse,
  TrackingProgressResponse,
  UserOrderGroup,
  UserOrderPagination,
  UserOrdersRequest,
  UserOrdersResponse,
  WalletOrderConfirmRequest,
  WalletOrderConfirmResponse,
  RequestCancelOrderRequest,
  RequestCancelOrderResponse,
  RequestReturnOrderRequest,
  RequestReturnOrderResponse,
  RetryOrderPaymentResponse,
} from "../../../types/order";
import orderService from "../../../services/user/orderService";
import discountService from "../../../services/user/discountService";
import type { ApplyDiscountRequest } from "../../../types/discount";
import type { VNPayCallbackRequest } from "../../../types/wallet";

interface OrderState {
  checkoutPreview?: CheckoutPreviewData;
  userOrderGroup: UserOrderGroup[];
  userOrderPagination?: UserOrderPagination;
  orderDetailData?: OrderDetailData;
  orderTrackingItem: OrderTrackingItem[];
  orderTrackingProgressItem: OrderTrackingProgressItem[];
}

const initialState: OrderState = {
  checkoutPreview: undefined,
  userOrderGroup: [],
  userOrderPagination: undefined,
  orderDetailData: undefined,
  orderTrackingItem: [],
  orderTrackingProgressItem: [],
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
>("order/applyDiscount", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await discountService.applyDiscountService(data);
    return res.data as CheckoutPreviewResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const createOrder = createAsyncThunk<
  CreateOrderResponse,
  { data: CreateOrderRequest },
  { rejectValue: ApiErrorType }
>("order/createOrder", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.createOrderService(data);
    return res.data as CreateOrderResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const orderCallback = createAsyncThunk<
  OrderCallbackResponse,
  { data: VNPayCallbackRequest },
  { rejectValue: ApiErrorType }
>("order/orderCallback", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.orderCallbackService(data);
    return res.data as OrderCallbackResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const retryOrderVNPay = createAsyncThunk<
  RetryOrderPaymentResponse,
  { orderGroupId: number },
  { rejectValue: ApiErrorType }
>("order/retryOrderVNPay", async ({ orderGroupId }, { rejectWithValue }) => {
  try {
    const res = await orderService.retryOrderVNPayService(orderGroupId);
    return res.data as RetryOrderPaymentResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const walletOrderConfirm = createAsyncThunk<
  WalletOrderConfirmResponse,
  { data: WalletOrderConfirmRequest },
  { rejectValue: ApiErrorType }
>("order/walletOrderConfirm", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.walletOrderConfirmService(data);
    return res.data as WalletOrderConfirmResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const clearCheckoutSession = createAsyncThunk<
  ClearCheckoutSessionResponse,
  { data: ClearCheckoutSessionRequest },
  { rejectValue: ApiErrorType }
>("order/clearCheckoutSession", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.clearCheckoutSessionService(data);
    return res.data as ClearCheckoutSessionResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getOrderGroupId = createAsyncThunk<
  OrderGroupIdResponse,
  { data: OrderGroupIdRequest },
  { rejectValue: ApiErrorType }
>("order/getOrderGroupId", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.getOrderGroupIdService(data);
    return res.data as OrderGroupIdResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getUserOrders = createAsyncThunk<
  UserOrdersResponse,
  { data: UserOrdersRequest },
  { rejectValue: ApiErrorType }
>("order/getUserOrders", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.getUserOrdersService(data);
    return res.data as UserOrdersResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getOrderDetail = createAsyncThunk<
  OrderDetailResponse,
  { data: OrderRequest },
  { rejectValue: ApiErrorType }
>("order/getOrderDetail", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.getOrderDetailService(data);
    return res.data as OrderDetailResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getOrderTracking = createAsyncThunk<
  OrderTrackingResponse,
  { data: OrderRequest },
  { rejectValue: ApiErrorType }
>("order/getOrderTracking", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.getOrderTrackingService(data);
    return res.data as OrderTrackingResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getTrackingProgress = createAsyncThunk<
  TrackingProgressResponse,
  { data: OrderRequest },
  { rejectValue: ApiErrorType }
>("order/getTrackingProgress", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await orderService.getTrackingProgressService(data);
    return res.data as TrackingProgressResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const requestCancelOrder = createAsyncThunk<
  RequestCancelOrderResponse,
  { orderId: number; data: RequestCancelOrderRequest },
  { rejectValue: ApiErrorType }
>(
  "order/requestCancelOrder",
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const res = await orderService.requestCancelOrderService(orderId, data);
      return res.data as RequestCancelOrderResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  },
);

export const requestReturnOrder = createAsyncThunk<
  RequestReturnOrderResponse,
  { orderId: number; data: RequestReturnOrderRequest },
  { rejectValue: ApiErrorType }
>(
  "order/requestReturnOrder",
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const res = await orderService.requestReturnOrderService(orderId, data);
      return res.data as RequestReturnOrderResponse;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  },
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    updateOrderShippingRealtime(
      state,
      action: PayloadAction<OrderShippingRealtimePayload>,
    ) {
      const payload = action.payload;

      if (state.orderDetailData?.orderId === payload.orderId) {
        state.orderDetailData = {
          ...state.orderDetailData,
          status: payload.orderStatus,
          shippingStatus: payload.shippingStatus,
        };
      }

      state.userOrderGroup = state.userOrderGroup.map((group) => ({
        ...group,
        orders: group.orders.map((order) => {
          if (order.orderId !== payload.orderId) return order;

          return {
            ...order,
            orderStatus: payload.orderStatus,
            shippingStatus: payload.shippingStatus,
            displayStatus: payload.displayStatus || order.displayStatus,
          };
        }),
      }));

      const tracking = payload.tracking;

      if (state.orderDetailData?.orderId === payload.orderId && tracking) {
        const existed = state.orderTrackingItem.some(
          (item) =>
            item.status === tracking.status &&
            new Date(item.time).getTime() ===
              new Date(tracking.time).getTime(),
        );

        if (!existed) {
          state.orderTrackingItem.unshift({
            status: tracking.status,
            label: "",
            time: tracking.time,
          });
        }
      }
    },
    updateOrderStatus(
      state,
      action: PayloadAction<OrderShippingRealtimePayload>,
    ) {
      orderSlice.caseReducers.updateOrderShippingRealtime(state, action);
    },
    clearOrderDetail(state) {
      state.orderDetailData = undefined;
      state.orderTrackingItem = [];
      state.orderTrackingProgressItem = [];
    },
  },
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
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.userOrderGroup = action.payload.data.items;
        state.userOrderPagination = action.payload.data.pagination;
      })
      .addCase(getOrderDetail.fulfilled, (state, action) => {
        state.orderDetailData = action.payload.data;
      })
      .addCase(getOrderTracking.fulfilled, (state, action) => {
        state.orderTrackingItem = action.payload.data;
      })
      .addCase(getTrackingProgress.fulfilled, (state, action) => {
        state.orderTrackingProgressItem = action.payload.data;
      })
      .addCase(requestCancelOrder.fulfilled, (state, action) => {
        const { orderId } = action.meta.arg;

        for (const group of state.userOrderGroup) {
          const order = group.orders.find((item) => item.orderId === orderId);
          if (order) {
            order.orderStatus = "CANCEL_REQUESTED";
            order.displayStatus = "Yêu cầu hủy";
          }
        }

        if (state.orderDetailData?.orderId === orderId) {
          state.orderDetailData.status = "CANCEL_REQUESTED";
        }
      })
      .addCase(requestReturnOrder.fulfilled, (state, action) => {
        const { orderId } = action.meta.arg;

        for (const group of state.userOrderGroup) {
          const order = group.orders.find((item) => item.orderId === orderId);
          if (order) {
            order.orderStatus = "RETURN_REQUESTED";
            order.displayStatus = "Yêu cầu trả hàng";
          }
        }

        if (state.orderDetailData?.orderId === orderId) {
          state.orderDetailData.status = "RETURN_REQUESTED";
        }
      });
  },
});

export const {
  updateOrderShippingRealtime,
  updateOrderStatus,
  clearOrderDetail,
} = orderSlice.actions;

export default orderSlice.reducer;

