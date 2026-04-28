import type { ApiResponse } from "./api";

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

export type CheckoutPreviewGroup = {
  groupId: number;
  branchId: number;
  branchName: string;
  items: CheckoutPreviewItem[];
  weight: number;
  shippingFee: number | null;
  leadtime: number;
  estimatedDelivery: {
    from: string;
    to: string;
  };
};

export type DiscountInfo = {
  code: string | null;
  amount: number;
};

export type CheckoutPreviewData = {
  cartId: string;
  address: CheckoutPreviewAddress;
  groups: CheckoutPreviewGroup[];
  subTotal: number;
  shippingFeeTotal: number;
  serviceId: number;
  discount: DiscountInfo;
  isShippingCalculated: boolean;
  total: number;
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
