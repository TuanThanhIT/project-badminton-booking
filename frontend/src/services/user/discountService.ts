import instance from "../../utils/axiosCustomize";
import type {
  ApplyDiscountRequest,
  DiscountCheckRequest,
  DiscountCheckResponse,
  DiscountRequest,
  DiscountResponse,
} from "../../types/discount";
import type { CheckoutPreviewResponse } from "../../types/order";

const checkBookingDiscountService = (data: DiscountCheckRequest) =>
  instance.post<DiscountCheckResponse>(
    "/discounts/check-booking-discount",
    data,
  );

const applyDiscountService = (data: ApplyDiscountRequest) =>
  instance.post<CheckoutPreviewResponse>("/user/discounts/apply", data);

const getDiscountsCheckoutService = (data: DiscountRequest) => {
  return instance.get<DiscountResponse>("/user/discounts", { params: data });
};

const discountService = {
  checkBookingDiscountService,
  applyDiscountService,
  getDiscountsCheckoutService,
};

export default discountService;
