import bookingService from "../../services/employee/bookingService.js";

const getBookings = async (req, res, next) => {
  try {
    const { status, keyword, date } = req.query;
    const bookings = await bookingService.getBookingsService(
      status,
      keyword,
      date
    );
    return res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

const confirmedBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    await bookingService.confirmedBookingService(bookingId);
    return res.status(200).json({ message: "Xác nhận đặt sân thành công!" });
  } catch (error) {
    next(error);
  }
};

const completedBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    await bookingService.completedBookingService(bookingId);
    return res
      .status(200)
      .json({ message: "Khách đã kết thúc sân, đặt sân hoàn tất!" });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { cancelReason } = req.body;
    await bookingService.cancelBookingService(bookingId, cancelReason);
    return res
      .status(200)
      .json({ message: "Lịch đặt sân đã được hủy thành công!" });
  } catch (error) {
    next(error);
  }
};

const bookingController = {
  getBookings,
  confirmedBooking,
  completedBooking,
  cancelBooking,
};

export default bookingController;
