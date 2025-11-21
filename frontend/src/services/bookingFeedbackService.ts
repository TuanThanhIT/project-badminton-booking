import { da } from "zod/v4/locales";
import type {
  AddFeedbackRequest,
  AddFeedbackResponse,
  BookingFeedbackDetailRequest,
  BookingFeedBackDetailResponse,
  BookingFeedbackRequest,
  BookingFeedbackResponse,
  UpdateFeedbackRequest,
  UpdateFeedbackResponse,
} from "../types/bookingFeedback";
import instance from "../utils/axiosCustomize";

const createBookingFeedbackService = async (data: AddFeedbackRequest) => {
  return instance.post<AddFeedbackResponse>("/user/booking/feedback", data);
};

const getBookingFeedbackDetailService = async (
  data: BookingFeedbackDetailRequest
) => {
  const bookingId = data.bookingId;
  return instance.get<BookingFeedBackDetailResponse>(
    `user/booking/feedback/update/${bookingId}`
  );
};

const updateBookingFeedbackService = async (dt: UpdateFeedbackRequest) => {
  const { content, rating, bookingId } = dt;
  const data = { content, rating };
  return instance.patch<UpdateFeedbackResponse>(
    `/user/booking/feedback/${bookingId}`,
    data
  );
};

const getBookingFeedbackService = async (data: BookingFeedbackRequest) => {
  const { courtId } = data;
  return instance.get<BookingFeedbackResponse>(
    `/user/booking/feedback/${courtId}}`
  );
};
const bookingFeedbackService = {
  createBookingFeedbackService,
  getBookingFeedbackDetailService,
  getBookingFeedbackService,
  updateBookingFeedbackService,
};
export default bookingFeedbackService;
