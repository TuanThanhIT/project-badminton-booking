import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import monthlyBookingService from "../../services/user/monthlyBookingService.js";

const createMonthlyBookingController = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    userId: req.user.id,
    ip: req.ip,
  };

  const result = await monthlyBookingService.createMonthlyBookingService(data);

  return res
    .status(201)
    .json(new SuccessResponse("Đặt sân tháng thành công", result));
});
const calculateMonthlyBookingController = asyncHandler(async (req, res) => {
  const result = await monthlyBookingService.calculateMonthlyBookingService(
    req.body,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Tính tiền thuê tháng thành công", result));
});
const monthlyBookingController = {
  createMonthlyBookingController,
  calculateMonthlyBookingController,
};

export default monthlyBookingController;
