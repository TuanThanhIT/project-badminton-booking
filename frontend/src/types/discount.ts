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

export type UpdateDiscountRequest = {
  code: string;
};

export type UpdateDiscountResponse = {
  message: string;
};
