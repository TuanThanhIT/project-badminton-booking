export type DiscountResponse = {
  originalPrice: number;
  finalPrice: number;
  discountValue: number;
  type: string;
};

export type DiscountRequest = {
  code: string;
  orderAmount: number;
};

export type DiscountBookingRequest = {
  code: string;
  bookingAmount: number;
};

export type UpdateDiscountRequest = {
  code: string;
};

export type UpdateDiscountResponse = {
  message: string;
};

export type DiscountListResponse = {
  id: number;
  code: string;
  type: string;
  value: number;
  startDate: string;
  endDate: string;
  minOrderAmount?: number;
  minBookingAmount?: number;
};
