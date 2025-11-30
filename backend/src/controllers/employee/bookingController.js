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

const bookingController = {
  getBookings,
};

export default bookingController;
