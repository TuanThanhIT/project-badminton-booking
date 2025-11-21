export type AddOrderRequest = {
  orderStatus: string;
  totalAmount: number;
  code: string;
  note: string;
  orderDetails: {
    varientId: number;
    quantity: number;
    subTotal: number;
  }[];
  paymentAmount: number;
  paymentMethod: string;
  paymentStatus: string;
};

export type AddOrderResponse = {
  message: string;
  orderId: number;
};

export type ProductInfo = {
  productName: string;
  thumbnailUrl: string;
};

export type VarientInfo = {
  id: number;
  color: string | null;
  size: string | null;
  material: string | null;
  product: ProductInfo;
};

export type OrderDetailInfo = {
  id: number;
  quantity: number;
  subTotal: number;
  review?: boolean;
  varient: VarientInfo;
};

export type OrderPaymentInfo = {
  paymentMethod: string;
};

export type OrderResponse = {
  id: number;
  orderStatus: "Pending" | "Paid" | "Confirmed" | "Completed" | "Cancelled";
  totalAmount: number;
  note: string | null;
  createdDate: string;
  orderDetails: OrderDetailInfo[];
  payment: OrderPaymentInfo;
};

export type OrderListResponse = OrderResponse[];

export type OrderCancelResponse = {
  message: string;
};

export type OrderCancelRequest = {
  orderId: number;
  cancelReason: string;
};

export type MoMoPaymentResponse = {
  partnerCode: string;
  accessKey: string;
  requestId: string;
  orderId: string;
  amount: string;
  orderInfo: string;
  orderType: string;
  transId: number;
  payUrl: string; // URL để redirect khách thanh toán
  resultCode: number; // 0 = success
  message: string;
  localMessage: string;
  signature: string;
};

export type MomoPaymentRequest = {
  entityId: string;
  amount: number;
  orderInfo: string;
  type: string;
};
