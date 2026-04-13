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
