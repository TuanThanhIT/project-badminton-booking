import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import discountService from "../../services/admin/discountService.js";

const createDiscount = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const discount = await discountService.createDiscountService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse("Tạo mã giảm giá cho đơn hàng thành công", discount),
    );
});

const getDiscounts = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const discounts = await discountService.getDiscountsService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy tất cả mã giảm giá thành công", discounts));
});

const updateDiscount = asyncHandler(async (req, res) => {
  const { discountId } = req.params;
  const data = { discountId };
  const discount = await discountService.updateDiscountService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Thay đổi trạng thái mã giảm giá thành công",
        discount,
      ),
    );
});

const deleteDiscount = asyncHandler(async (req, res) => {
  const { discountId } = req.params;
  const data = { discountId };
  await discountService.deleteDiscountService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Xóa mã giảm giá đơn hàng thành công"));
});

const discountController = {
  createDiscount,
  getDiscounts,
  updateDiscount,
  deleteDiscount,
};

export default discountController;
