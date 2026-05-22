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
  RetryBookingPaymentResponse,
  WalletBookingConfirmRequest,
  WalletBookingConfirmResponse,
} from "../../types/booking";

const createBookingService = (data: CreateBookingRequest) =>
  instance.post<CreateBookingResponse>("/user/bookings", data);

const bookingCallbackService = (data: BookingCallbackRequest) =>
  instance.patch<BookingCallbackResponse>(
    "/user/bookings/vnpay/callback",
    data,
  );

const retryBookingVNPayService = (bookingId: number) =>
  instance.post<RetryBookingPaymentResponse>(
    `/user/bookings/${bookingId}/vnpay/retry`,
  );

const walletBookingConfirmService = (data: WalletBookingConfirmRequest) =>
  instance.patch<WalletBookingConfirmResponse>(
    "/user/bookings/wallet/confirm",
    data,
  );

const getMyBookingsService = (data: MyBookingsRequest) =>
  instance.get<MyBookingsResponse>("/user/bookings/my-bookings", {
    params: data,
  });

const getBookingByIdService = (bookingId: number) =>
  instance.get<any>(`/user/bookings/${bookingId}`);

const requestCancelBookingService = (
  bookingId: number,
  data: CancelBookingRequest,
  mode: "DIRECT" | "REQUEST" = "REQUEST",
) =>
  instance.patch<CancelBookingResponse>(
    `/user/bookings/${bookingId}/${mode === "DIRECT" ? "cancel" : "cancel-request"}`,
    data,
  );

const bookingService = {
  createBookingService,
  bookingCallbackService,
  retryBookingVNPayService,
  walletBookingConfirmService,
  getBookingByIdService,
  getMyBookingsService,
  requestCancelBookingService,
};

export default bookingService;
