import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import bookingService from "../../services/user/bookingService.js";

const createBookingController = asyncHandler(async (req, res) => {
  // Lấy dữ liệu từ body và userId từ middleware auth
  const bookingData = {
    ...req.body,
    userId: req.user.id,
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

const bookingController = {
  createBookingController,
  getMyBookingsController,
};

export default bookingController;
