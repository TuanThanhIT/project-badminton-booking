import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import bookingService from "../../services/manager/bookingService.js";

const getBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getBookingsService(req.user.id, req.query);

  return res
    .status(200)
    .json(new SuccessResponse("Get manager bookings successfully", result));
});

const getBookingDetail = asyncHandler(async (req, res) => {
  const result = await bookingService.getBookingDetailService(
    req.user.id,
    req.params.bookingId,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Get manager booking detail successfully", result));
});

export default {
  getBookings,
  getBookingDetail,
};
