import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import bookingFeedbackService from "../../services/customer/bookingFeedbackService.js";

const createBookingFeedback = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = { ...req.body, userId };
  await bookingFeedbackService.createBookingFeedbackService(data);
  return res.status(201).json(new SuccessResponse("Đánh giá sân thành công"));
});

const getBookingFeedbackUpdate = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const bookingId = req.params.id;
  const data = { bookingId, userId };

  const bookingFeedback =
    await bookingFeedbackService.getBookingFeedbackUpdateService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy đánh giá sân thành công", bookingFeedback));
});

const updateBookingFeedback = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const bookingId = req.params.id;
  const data = { ...req.body, userId, bookingId };
  await bookingFeedbackService.updateBookingFeedbackService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật đánh giá cho sân thành công"));
});

const getBookingFeedback = asyncHandler(async (req, res) => {
  const courtId = req.params.id;
  const data = { courtId };
  const bookingFeedback =
    await bookingFeedbackService.getBookingFeedbackService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy toàn bộ đánh giá sân thành công, bookingFeedback",
        bookingFeedback,
      ),
    );
});

const bookingFeedbackController = {
  createBookingFeedback,
  getBookingFeedback,
  getBookingFeedbackUpdate,
  updateBookingFeedback,
};
export default bookingFeedbackController;
