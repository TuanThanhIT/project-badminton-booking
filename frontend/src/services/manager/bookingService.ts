import instance from "../../utils/axiosCustomize";
import type {
  EmployeeBookingDetailResponse,
  EmployeeBookingsRequest,
  EmployeeBookingsResponse,
} from "../../types/booking";

const getBookingsService = (params: EmployeeBookingsRequest) =>
  instance.get<EmployeeBookingsResponse>("/manager/bookings", { params });

const getBookingDetailService = (bookingId: number) =>
  instance.get<EmployeeBookingDetailResponse>(`/manager/bookings/${bookingId}`);

export default {
  getBookingsService,
  getBookingDetailService,
};
