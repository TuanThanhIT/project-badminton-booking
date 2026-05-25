import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import employeeBookingService from "../../services/employee/bookingService.js";

const getBookingsController = asyncHandler(async (req, res) => {
  const data = { employeeId: req.user.id, ...req.query };
  const result = await employeeBookingService.getBookingsService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy danh sách lịch đặt sân thành công", result),
    );
});

const getBookingDetailController = asyncHandler(async (req, res) => {
  const data = {
    bookingId: req.params.bookingId,
    employeeId: req.user.id,
  };
  const result = await employeeBookingService.getBookingDetailService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy chi tiết lịch đặt sân thành công", result),
    );
});

const confirmBookingController = asyncHandler(async (req, res) => {
  const data = {
    bookingId: req.params.bookingId,
    employeeId: req.user.id,
  };

  await employeeBookingService.confirmBookingService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Xác nhận lịch sân thành công"));
});

const completeBookingController = asyncHandler(async (req, res) => {
  const data = {
    bookingId: req.params.bookingId,
    employeeId: req.user.id,
    paymentMethod: req.body.paymentMethod,
  };

  await employeeBookingService.completeBookingService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Hoàn thành lịch sân thành công"));
});

const approveCancelBookingController = asyncHandler(async (req, res) => {
  const data = {
    bookingId: req.params.bookingId,
    employeeId: req.user.id,
  };
  const result = await employeeBookingService.approveCancelBookingService(data);

  return res
    .status(200)
    .json(
      new SuccessResponse("Xác nhận hủy lịch sân thành công", result),
    );
});

const rejectCancelBookingController = asyncHandler(async (req, res) => {
  const data = {
    bookingId: req.params.bookingId,
    employeeId: req.user.id,
    reason: req.body.reason,
  };
  await employeeBookingService.rejectCancelBookingService(data);

  return res
    .status(200)
    .json(
      new SuccessResponse("Từ chối yêu cầu hủy lịch sân thành công"),
    );
});

const cancelNoShowBookingController = asyncHandler(async (req, res) => {
  const data = {
    bookingId: req.params.bookingId,
    employeeId: req.user.id,
    reason: req.body.reason,
  };
  const result = await employeeBookingService.cancelNoShowBookingService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Hủy lịch sân thành công", result));
});

const employeeBookingController = {
  getBookingsController,
  getBookingDetailController,
  confirmBookingController,
  completeBookingController,
  approveCancelBookingController,
  rejectCancelBookingController,
  cancelNoShowBookingController,
};

export default employeeBookingController;
