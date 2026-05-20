import instance from "../../utils/axiosCustomize";
import type {
  BookingCallbackRequest,
  BookingCallbackResponse,
  CancelBookingRequest,
  CancelBookingResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  MyBookingsRequest,
  MyBookingsResponse,
} from "../../types/booking";

const createBookingService = (data: CreateBookingRequest) =>
  instance.post<CreateBookingResponse>("/bookings", data);

const bookingCallbackService = (data: BookingCallbackRequest) =>
  instance.patch<BookingCallbackResponse>("/bookings/vnpay/callback", data);

const getMyBookingsService = (data: MyBookingsRequest) =>
  instance.get<MyBookingsResponse>("/bookings/my-bookings", {
    params: data,
  });

const requestCancelBookingService = (
  bookingId: number,
  data: CancelBookingRequest,
  mode: "DIRECT" | "REQUEST" = "REQUEST",
) =>
  instance.patch<CancelBookingResponse>(
    `/bookings/${bookingId}/${mode === "DIRECT" ? "cancel" : "cancel-request"}`,
    data,
  );

const bookingService = {
  createBookingService,
  bookingCallbackService,
  getMyBookingsService,
  requestCancelBookingService,
};

export default bookingService;
