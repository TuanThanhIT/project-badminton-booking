import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import discountService from "../../services/customer/discountService.js";

const applyDiscount = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const discount = await discountService.applyDiscountService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Áp mã giảm giá thành công", discount));
});

const updateDiscount = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const discount = await discountService.updateDiscountService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Mã giảm giá đã được ghi nhận và áp dụng", discount),
    );
});

const getDiscount = asyncHandler(async (req, res) => {
  const discounts = await discountService.getDiscountService();
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy danh sách mã giảm giá đặt hàng thành công",
        discounts,
      ),
    );
});

const discountController = {
  applyDiscount,
  updateDiscount,
  getDiscount,
};
export default discountController;
