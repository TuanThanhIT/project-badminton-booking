import bookingService from "../../services/admin/bookingService.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";

const countBookingByBookingStatus = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result = await bookingService.countBookingByBookingStatusService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy thống kê thành công", result));
});

const bookingController = {
  countBookingByBookingStatus,
};
export default bookingController;
