import type {
  BookingCancelEplRequest,
  BookingCancelEplResponse,
  BookingCompleteRequest,
  BookingCompleteResponse,
  BookingConfirmRequest,
  BookingConfirmResponse,
  BookingEplRequest,
  BookingListEplResponse,
} from "../../types/booking";
import instance from "../../utils/axiosCustomize";

const getBookings = (data: BookingEplRequest) => {
  return instance.get<BookingListEplResponse>("/employee/booking/list", {
    params: data,
  });
};

const confirmBookingService = (data: BookingConfirmRequest) => {
  const { bookingId } = data;
  return instance.patch<BookingConfirmResponse>(
    `/employee/booking/confirm/${bookingId}`
  );
};

const completeBookingService = (data: BookingCompleteRequest) => {
  const { bookingId } = data;
  return instance.patch<BookingCompleteResponse>(
    `/employee/booking/complete/${bookingId}`
  );
};

const cancelBookingService = (data: BookingCancelEplRequest) => {
  const bookingId = data.bookingId;
  const cancelReason = data.cancelReason;
  return instance.patch<BookingCancelEplResponse>(
    `/employee/booking/cancel/${bookingId}`,
    { cancelReason }
  );
};

const bookingService = {
  getBookings,
  confirmBookingService,
  completeBookingService,
  cancelBookingService,
};

export default bookingService;
