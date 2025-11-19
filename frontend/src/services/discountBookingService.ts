import type {
  DiscountBookingRequest,
  DiscountResponse,
  UpdateDiscountRequest,
  UpdateDiscountResponse,
} from "../types/discount";
import instance from "../utils/axiosCustomize";

const applyDiscountBookingService = (code: string, bookingAmount: number) => {
  const data: DiscountBookingRequest = { code, bookingAmount };
  return instance.post<DiscountResponse>("/user/discount/booking/add", data);
};

const updateDiscountBookingService = (code: string) => {
  const data: UpdateDiscountRequest = { code };
  return instance.patch<UpdateDiscountResponse>(
    "/user/discount/booking/update",
    data
  );
};

const discountBookingService = {
  applyDiscountBookingService,
  updateDiscountBookingService,
};

export default discountBookingService;
