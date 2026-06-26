import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import discountService from "../../services/user/discountService.js";

const checkDiscountController = asyncHandler(async (req, res) => {
  // body chứa: code, bookingAmount (+ context phạm vi: branchId, startHour, endHour)
  const data = { ...req.body, userId: req.user?.id };

  const result = await discountService.checkDiscountBookingService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Kiểm tra mã giảm giá thành công", result));
});

const applyDiscountController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = { userId, ...req.body };
  const sessionResult = await discountService.applyDiscountService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Áp mã giảm giá thành công", sessionResult));
});

const getDiscountsCheckoutController = asyncHandler(async (req, res) => {
  const data = { ...req.query, userId: req.user?.id };
  const discounts = await discountService.getDiscountsCheckoutService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy mã giảm giá thành công", discounts));
});

const discountController = {
  checkDiscountController,
  applyDiscountController,
  getDiscountsCheckoutController,
};

export default discountController;
