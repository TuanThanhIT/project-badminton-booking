import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import bookingService from "../../services/user/bookingService.js";

const createBookingController = asyncHandler(async (req, res) => {
  // Lấy dữ liệu từ body và userId từ middleware auth
  const bookingData = {
    ...req.body,
    userId: req.user.id,
    ip: req.ip,
  };

  const result = await bookingService.createBookingService(bookingData);

  return res
    .status(201)
    .json(new SuccessResponse("Đặt sân thành công", result));
});

const getMyBookingsController = asyncHandler(async (req, res) => {
  const query = {
    ...req.query,
    userId: req.user.id,
  };

  const result = await bookingService.getMyBookingsService(query);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy lịch sử đặt sân thành công", result));
});

const bookingCallbackController = asyncHandler(async (req, res) => {
  const result = await bookingService.bookingCallbackService(req.body);

  return res
    .status(200)
    .json(new SuccessResponse("Hoàn tất thanh toán đặt sân", result));
});

const requestCancelBookingController = asyncHandler(async (req, res) => {
  const result = await bookingService.requestCancelBookingService({
    userId: req.user.id,
    bookingId: req.params.bookingId,
    reason: req.body.reason || req.body.cancelReason,
    mode: "REQUEST_ONLY",
  });

  const message =
    result.mode === "CANCELLED"
      ? "Hủy lịch sân thành công"
      : "Đã gửi yêu cầu hủy lịch sân, vui lòng chờ nhân viên xác nhận";

  return res.status(200).json(new SuccessResponse(message, result));
});

const cancelBookingController = asyncHandler(async (req, res) => {
  const result = await bookingService.requestCancelBookingService({
    userId: req.user.id,
    bookingId: req.params.bookingId,
    reason: req.body.reason || req.body.cancelReason,
    mode: "DIRECT_ONLY",
  });

  return res
    .status(200)
    .json(new SuccessResponse("Hủy lịch sân thành công", result));
});

const bookingController = {
  createBookingController,
  getMyBookingsController,
  bookingCallbackController,
  requestCancelBookingController,
  cancelBookingController,
};

export default bookingController;
