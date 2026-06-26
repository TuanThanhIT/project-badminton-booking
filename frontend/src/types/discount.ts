import type { ApiResponse } from "./api";

export type DiscountBookingScope = {
  branchId?: number;
  startHour?: number;
  endHour?: number;
};

export type DiscountCheckRequest = {
  code: string;
  bookingAmount: number;
} & DiscountBookingScope;

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
  visibility?: "PUBLIC" | "PRIVATE";
  branchId?: number | null;
  startHour?: number | null;
  endHour?: number | null;
  eligible?: boolean;
  reason?: string | null;
};

export type DiscountRequest = {
  amount: number;
  targetType?: "ORDER" | "BOOKING";
} & DiscountBookingScope;

export type DiscountResponse = ApiResponse<DiscountData[]>;
