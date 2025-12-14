import bookingService from "../../services/admin/bookingService.js";

const countBookingByBookingStatus = async (req, res, next) => {
  try {
    const { date } = req.query;
    const data = await bookingService.countBookingByBookingStatusService(date);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const bookingController = {
  countBookingByBookingStatus,
};
export default bookingController;
