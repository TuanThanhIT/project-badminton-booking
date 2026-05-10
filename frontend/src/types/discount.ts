import type { ApiResponse } from "./api";

export type DiscountCheckRequest = {
  code: string;
  bookingAmount: number;
};

export type DiscountCheckResult = {
  discountId: number;
  code: string;
  discountValue: number;
  finalAmount: number;
};

export type DiscountCheckResponse = ApiResponse<DiscountCheckResult>;

export type ApplyDiscountRequest = {
  code: string;
  cartId: number;
};

export type DiscountData = {
  id: number;
  code: string;
  type: string;
  value: number;
  maxDiscount: number;
  minAmount: number;
  startDate: string;
  endDate: string;
};

export type DiscountRequest = {
  amount: number;
};

export type DiscountResponse = ApiResponse<DiscountData[]>;
