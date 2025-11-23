import type {
  DiscountRequest,
  DiscountResponse,
  UpdateDiscountRequest,
  UpdateDiscountResponse,
} from "../types/discount";
import instance from "../utils/axiosCustomize";

const applyDiscountService = (code: string, orderAmount: number) => {
  const data: DiscountRequest = { code, orderAmount };
  return instance.post<DiscountResponse>("/user/discount/add", data);
};

const updateDiscountService = (code: string) => {
  const data: UpdateDiscountRequest = { code };
  return instance.patch<UpdateDiscountResponse>("/user/discount/update", data);
};

const discountService = {
  applyDiscountService,
  updateDiscountService,
};

export default discountService;
