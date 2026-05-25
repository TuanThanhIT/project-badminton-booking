import instance from "../../utils/axiosCustomize";
import type {
  CompleteEmployeeBookingRequest,
  EmployeeBookingActionResponse,
  EmployeeBookingDetailResponse,
  EmployeeBookingsRequest,
  EmployeeBookingsResponse,
  RejectEmployeeBookingActionRequest,
} from "../../types/booking";

const getBookingsService = (params: EmployeeBookingsRequest) =>
  instance.get<EmployeeBookingsResponse>("/employee/bookings", { params });

const getBookingDetailService = (bookingId: number) =>
  instance.get<EmployeeBookingDetailResponse>(`/employee/bookings/${bookingId}`);

const confirmBookingService = (bookingId: number) =>
  instance.patch<EmployeeBookingActionResponse>(
    `/employee/bookings/${bookingId}/confirm`,
  );

const completeBookingService = (
  bookingId: number,
  data?: CompleteEmployeeBookingRequest,
) =>
  instance.patch<EmployeeBookingActionResponse>(
    `/employee/bookings/${bookingId}/complete`,
    data,
  );

const approveCancelBookingService = (bookingId: number) =>
  instance.patch<EmployeeBookingActionResponse>(
    `/employee/bookings/${bookingId}/cancel-request/approve`,
  );

const rejectCancelBookingService = (
  bookingId: number,
  data?: RejectEmployeeBookingActionRequest | string,
) =>
  instance.patch<EmployeeBookingActionResponse>(
    `/employee/bookings/${bookingId}/cancel-request/reject`,
    typeof data === "string" ? { reason: data } : data,
  );

const cancelNoShowBookingService = (
  bookingId: number,
  data?: RejectEmployeeBookingActionRequest | string,
) =>
  instance.patch<EmployeeBookingActionResponse>(
    `/employee/bookings/${bookingId}/cancel-pending`,
    typeof data === "string" ? { reason: data } : data,
  );

const employeeBookingService = {
  getBookingsService,
  getBookingDetailService,
  confirmBookingService,
  completeBookingService,
  approveCancelBookingService,
  rejectCancelBookingService,
  cancelNoShowBookingService,
};

export default employeeBookingService;
