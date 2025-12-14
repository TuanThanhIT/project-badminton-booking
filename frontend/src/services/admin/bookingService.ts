import type {
  CountBookingRequest,
  CountBookingResponse,
} from "../../types/booking";
import instance from "../../utils/axiosCustomize";

const countBookingByBookingStatusService = (data: CountBookingRequest) => {
  return instance.get<CountBookingResponse>("/admin/booking/count", {
    params: data,
  });
};

const bookingAdminService = {
  countBookingByBookingStatusService,
};

export default bookingAdminService;
