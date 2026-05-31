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

const retryBookingVNPayController = asyncHandler(async (req, res) => {
  const result = await bookingService.retryBookingVNPayService({
    bookingId: req.params.bookingId,
    userId: req.user.id,
    ip: req.ip,
  });

  return res
    .status(200)
    .json(new SuccessResponse("Tạo lại link thanh toán VNPay thành công", result));
});

const getBookingByIdController = asyncHandler(async (req, res) => {
  const bookingId = req.params.bookingId;
  const userId = req.user.id;
  const data = { bookingId, userId };
  const result = await bookingService.getBookingByIdService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Kiểm tra lịch đặt sân thành công", result));
});

const walletBookingConfirmController = asyncHandler(async (req, res) => {
  const result = await bookingService.walletBookingConfirmService(req.body);

  return res
    .status(200)
    .json(
      new SuccessResponse("Xác nhận thanh toán đặt sân thành công", result),
    );
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
  getBookingByIdController,
  bookingCallbackController,
  retryBookingVNPayController,
  walletBookingConfirmController,
  requestCancelBookingController,
  cancelBookingController,
};

export default bookingController;
