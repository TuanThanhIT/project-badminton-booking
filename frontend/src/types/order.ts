import type { ApiResponse } from "./api";

export type ShippingStatus =
  | "PENDING"
  | "CREATED"
  | "PICKING"
  | "PICKED"
  | "IN_TRANSIT"
  | "DELIVERING"
  | "DELIVERED"
  | "FAILED"
  | "RETURNING"
  | "RETURNED"
  | "CANCELLED";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_TO_SHIP"
  | "SHIPPING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type CheckoutPreviewAddress = {
  addressId: number;
  districtId: number;
  wardCode: string;
};

export type CheckoutPreviewItem = {
  variantId: number;
  productName: string;
  thumbnail: string;
  color: string;
  size: string;
  material: string;
  quantity: number;
  price: number;
  lineTotal: number;
};

export type CheckoutPreviewOrder = {
  orderTempId: number;
  branchId: number;
  branchName: string;
  items: CheckoutPreviewItem[];
  weight: number;
  shippingFee: number | null;
  leadtime: number | null;
  estimatedDelivery: {
    from: string | null;
    to: string | null;
  };
};

export type DiscountInfo = {
  code: string | null;
  amount: number;
};

export type CheckoutPreviewGroup = {
  groupId: number;
  orders: CheckoutPreviewOrder[];

  subTotal: number;
  shippingFeeTotal: number;
  serviceId: number | null;

  discount: DiscountInfo;
  total: number;
};

export type CheckoutPreviewData = {
  cartId: string;
  address: CheckoutPreviewAddress;

  group: CheckoutPreviewGroup;

  isShippingCalculated: boolean;
  status: "PREVIEW" | "CONFIRMED" | "PAID" | "CANCELLED";
};

export type CheckoutPreviewResponse = ApiResponse<CheckoutPreviewData>;

export type CheckoutPreviewRequest = {
  cartId: number;
  addressId: number;
};

export type CalculateShippingRequest = {
  cartId: number;
};

export type CreateOrderRequest = {
  cartId: number;
  addressId: number;
  paymentMethod: string;
  note?: string;
};

export type CreateOrderData = {
  orderGroupId: number;
  amount: number;
  paymentUrl?: string;
};

export type CreateOrderResponse = ApiResponse<CreateOrderData>;

export type OrderCallbackRequest = {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
};

export type OrderCallbackResponse = ApiResponse<null>;

export type WalletOrderConfirmRequest = {
  orderGroupId: number;
  otpCode: string;
  email: string;
};

export type WalletOrderConfirmData = {
  orderGroupId: number;
  amount: number;
};

export type WalletOrderConfirmResponse = ApiResponse<WalletOrderConfirmData>;

export type ClearCheckoutSessionRequest = {
  cartId: number;
};

export type ClearCheckoutSessionResponse = ApiResponse<null>;

export type OrderGroupIdRequest = {
  orderGroupId: number;
};

export type OrderGroupIdData = {
  orderGroupId: number;
  amount: number;
  status: string;
  paymentMethod: string;
  isSuccess: boolean;
  createdDate: string;
};

export type OrderGroupIdResponse = ApiResponse<OrderGroupIdData>;

export type UserOrderItem = {
  name: string;
  quantity: number;
  price: number;
  thumbnailUrl: string;
};

export type UserOrder = {
  orderId: number;
  shippingStatus: ShippingStatus;
  orderStatus: OrderStatus;
  displayStatus: string;
  items: UserOrderItem[];
};

export type UserOrderGroup = {
  orderGroupId: number;
  totalAmount: string;
  totalShippingFee: string;
  finalAmount: string;
  status: string;
  createdDate: string;
  orders: UserOrder[];
};

export type UserOrderPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type UserOrderResponseData = {
  items: UserOrderGroup[];
  pagination: UserOrderPagination;
};

export type UserOrdersResponse = ApiResponse<UserOrderResponseData>;

export type UserOrdersRequest = {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  sort?: "newest" | "oldest";
  status?: string;
};

export type OrderDetailAddress = {
  name: string;
  phone: string;
  address: string;
};

export type OrderDetailItem = {
  name: string;
  quantity: number;
  price: number;
  variantInfo: string;
  thumbnailUrl: string;
};

export type OrderDetailFee = {
  subtotal: string;
  shipping: string;
  total: string;
};

export type OrderDetailData = {
  orderId: number;
  status: OrderStatus;
  shippingStatus: ShippingStatus;
  trackingCode: string | null;

  address: OrderDetailAddress;
  items: OrderDetailItem[];

  fee: OrderDetailFee;
};

export type OrderDetailResponse = ApiResponse<OrderDetailData>;

export type OrderTrackingItem = {
  status: ShippingStatus;
  label: string;
  time: string; // ISO string từ BE
};

export type OrderTrackingResponse = ApiResponse<OrderTrackingItem[]>;

export type OrderTrackingProgressItem = {
  step: ShippingStatus;
  done: boolean;
  current: boolean;
};

export type TrackingProgressResponse = ApiResponse<OrderTrackingProgressItem[]>;

export type OrderRequest = {
  orderId: number;
};
