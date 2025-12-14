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

export type AdminDiscountListResponse = {
  total: number;
  page: number;
  limit: number;
  discounts?: AdminDiscountResponse[];
  discountBookings: AdminDiscountResponse[];
};

export type AdminDiscountResponse = {
  id: number;
  code: string;
  type: string;
  value: number;
  isActive: boolean;
  isUsed: boolean;
  startDate: string;
  endDate: string;
  minOrderAmount?: number;
  minBookingAmount?: number;
  createdDate: string;
  updatedDate: string;
};

export type AdminDiscountRequest = {
  page?: number;
  limit?: number;
  type?: string;
  isUsed?: boolean;
};

export type AdminAddDiscountRequest = {
  code: string;
  type: string;
  value: number;
  startDate: string;
  endDate: string;
  minOrderAmount?: number;
  minBookingAmount?: number;
};

export type AdminAddDiscountResponse = {
  message: string;
};

export type AdminUpdateDiscountRequest = {
  discountId: number;
};

export type AdminDeleteDiscountRequest = {
  discountId: number;
};

export type AdminUpdateDiscountResponse = {
  message: string;
};

export type AdminDeleteDiscountResponse = {
  message: string;
};
