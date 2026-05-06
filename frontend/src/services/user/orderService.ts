import type {
  CalculateShippingRequest,
  CheckoutPreviewRequest,
  CheckoutPreviewResponse,
  ClearCheckoutSessionRequest,
  ClearCheckoutSessionResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderCallbackResponse,
  OrderDetailResponse,
  OrderGroupIdRequest,
  OrderGroupIdResponse,
  OrderRequest,
  OrderTrackingResponse,
  TrackingProgressResponse,
  UserOrdersResponse,
  WalletOrderConfirmRequest,
  WalletOrderConfirmResponse,
} from "../../types/order";
import type { VNPayCallbackRequest } from "../../types/wallet";
import instance from "../../utils/axiosCustomize";

const getCheckoutPreviewService = (data: CheckoutPreviewRequest) =>
  instance.post<CheckoutPreviewResponse>("/user/orders/checkout/preview", data);

const calculateShippingService = (data: CalculateShippingRequest) =>
  instance.post<CheckoutPreviewResponse>(
    "/user/orders/checkout/shipping",
    data,
  );

const createOrderService = (data: CreateOrderRequest) =>
  instance.post<CreateOrderResponse>("/user/orders", data);

const orderCallbackService = (data: VNPayCallbackRequest) =>
  instance.patch<OrderCallbackResponse>("/user/orders/vnpay/callback", data);

const walletOrderConfirmService = (data: WalletOrderConfirmRequest) =>
  instance.patch<WalletOrderConfirmResponse>(
    "/user/orders/wallet/confirm",
    data,
  );

const clearCheckoutSessionService = (data: ClearCheckoutSessionRequest) =>
  instance.delete<ClearCheckoutSessionResponse>(
    "/user/orders/checkout/session",
    {
      data,
    },
  );

const getOrderGroupIdService = (data: OrderGroupIdRequest) =>
  instance.get<OrderGroupIdResponse>(`/user/orders/group/${data.orderGroupId}`);

const getUserOrdersService = () => {
  return instance.get<UserOrdersResponse>("/user/orders");
};

const getOrderDetailService = (data: OrderRequest) => {
  const { orderId } = data;
  return instance.get<OrderDetailResponse>(`/user/orders/detail/${orderId}`);
};

const getOrderTrackingService = (data: OrderRequest) => {
  const { orderId } = data;
  return instance.get<OrderTrackingResponse>(
    `/user/orders/tracking/${orderId}`,
  );
};

const getTrackingProgressService = (data: OrderRequest) => {
  const { orderId } = data;
  return instance.get<TrackingProgressResponse>(
    `/user/orders/progress/${orderId}`,
  );
};

const orderService = {
  getCheckoutPreviewService,
  calculateShippingService,
  createOrderService,
  orderCallbackService,
  walletOrderConfirmService,
  clearCheckoutSessionService,
  getOrderGroupIdService,
  getUserOrdersService,
  getOrderDetailService,
  getOrderTrackingService,
  getTrackingProgressService,
};

export default orderService;
