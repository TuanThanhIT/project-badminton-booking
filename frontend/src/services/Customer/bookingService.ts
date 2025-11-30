import type {
  AddBookingRequest,
  AddBookingResponse,
  BookingCancelRequest,
  BookingCancelResponse,
  BookingListResponse,
} from "../../types/booking";
import instance from "../../utils/axiosCustomize";

const createBookingService = (data: AddBookingRequest) =>
  instance.post<AddBookingResponse>("/user/booking/add", data);

const getBookingService = () =>
  instance.get<BookingListResponse>("/user/booking/list");

const cancelBookingService = (data: BookingCancelRequest) => {
  const bookingId = data.bookingId;
  const cancelReason = data.cancelReason;
  return instance.patch<BookingCancelResponse>(
    `/user/booking/cancel/${bookingId}`,
    {
      cancelReason,
    }
  );
};

const bookingService = {
  createBookingService,
  getBookingService,
  cancelBookingService,
};
export default bookingService;
