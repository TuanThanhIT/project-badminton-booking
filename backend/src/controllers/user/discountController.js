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

const discountController = {
  checkDiscountController,
};

export default discountController;
