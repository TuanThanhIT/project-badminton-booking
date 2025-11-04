import type { DiscountRequest, DiscountResponse } from "../types/discount";
import instance from "../utils/axiosCustomize";

const applyDiscountService = (code: string, orderAmount: number) => {
  const data: DiscountRequest = { code, orderAmount };
  return instance.post<DiscountResponse>("/user/discount/add", data);
};

const discountService = {
  applyDiscountService,
};

export default discountService;
