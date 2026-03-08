import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import bookingService from "../../services/customer/bookingService.js";

const createBooking = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, ...req.body };
  const bookingId = await bookingService.createBookingService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Đặt sân thành công", bookingId));
});

const getBookings = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  const bookings = await bookingService.getBookingsService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy lịch đặt sân thành công", bookings));
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const data = { bookingId, ...req.body };
  await bookingService.cancelBookingService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Sân của bạn đã được hủy thành công"));
});

const bookingController = {
  createBooking,
  getBookings,
  cancelBooking,
};

export default bookingController;
