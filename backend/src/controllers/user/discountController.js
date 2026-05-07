import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import discountService from "../../services/user/discountService.js";

const checkDiscountController = asyncHandler(async (req, res) => {
  // body thường chứa: code và bookingAmount (tổng tiền tạm tính)
  const data = { ...req.body };

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
  const data = { ...req.query };
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
