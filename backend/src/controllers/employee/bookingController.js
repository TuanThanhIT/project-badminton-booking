import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import bookingService from "../../services/employee/bookingService.js";

const getBookings = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const bookings = await bookingService.getBookingsService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy tất cả đặt sân thành công", bookings));
});

const confirmedBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const data = { bookingId };
  const booking = await bookingService.confirmedBookingService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Xác nhận đặt sân thành công", booking));
});

const completedBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const data = { bookingId };
  const booking = await bookingService.completedBookingService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Khách đã kết thúc sân, đặt sân hoàn tất", booking),
    );
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const data = { bookingId, ...req.body };
  const booking = await bookingService.cancelBookingService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lịch đặt sân đã được hủy thành công", booking));
});

const bookingController = {
  getBookings,
  confirmedBooking,
  completedBooking,
  cancelBooking,
};

export default bookingController;
