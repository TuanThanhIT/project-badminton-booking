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
