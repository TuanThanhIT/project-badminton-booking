import bookingService from "../../services/customer/bookingService.js";

const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      bookingStatus,
      totalAmount,
      code,
      note,
      bookingDetails,
      paymentAmount,
      paymentMethod,
      paymentStatus,
    } = req.body;
    const bookingId = await bookingService.createBookingService(
      bookingStatus,
      totalAmount,
      userId,
      code,
      note,
      bookingDetails,
      paymentAmount,
      paymentMethod,
      paymentStatus
    );
    return res.status(201).json({ bookingId, message: "Đặt sân thành công." });
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookings = await bookingService.getBookingsService(userId);
    return res.status(200).json(bookings);
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
      .json({ message: "Sân của bạn đã được hủy thành công!" });
  } catch (error) {
    next(error);
  }
};
const bookingController = {
  createBooking,
  getBookings,
  cancelBooking,
};

export default bookingController;
