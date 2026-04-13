import instance from "../../utils/axiosCustomize";
import type {
  DiscountCheckRequest,
  DiscountCheckResponse,
} from "../../types/discount";

const checkBookingDiscountService = (data: DiscountCheckRequest) =>
  instance.post<DiscountCheckResponse>(
    "/discounts/check-booking-discount",
    data,
  );

const discountService = {
  checkBookingDiscountService,
};

export default discountService;
