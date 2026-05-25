import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import adminDiscountService from "../../services/admin/discountService.js";

const getDiscountsController = asyncHandler(async (req, res) => {
  const result = await adminDiscountService.getAdminDiscountsService(req.query);
  return res.status(200).json(new SuccessResponse("Lấy danh sách khuyến mãi thành công", result));
});

const createDiscountController = asyncHandler(async (req, res) => {
  const result = await adminDiscountService.createAdminDiscountService(req.body);
  return res.status(201).json(new SuccessResponse("Tạo mã giảm giá thành công", result));
});

const updateDiscountController = asyncHandler(async (req, res) => {
  const result = await adminDiscountService.updateAdminDiscountService(req.params.discountId, req.body);
  return res.status(200).json(new SuccessResponse("Cập nhật mã giảm giá thành công", result));
});

const toggleDiscountController = asyncHandler(async (req, res) => {
  const result = await adminDiscountService.toggleAdminDiscountActiveService(req.params.discountId);
  return res.status(200).json(new SuccessResponse(
    result.isActive ? "Đã bật mã giảm giá" : "Đã tắt mã giảm giá", result
  ));
});

const deleteDiscountController = asyncHandler(async (req, res) => {
  const result = await adminDiscountService.deleteAdminDiscountService(req.params.discountId);
  return res.status(200).json(new SuccessResponse("Xóa mã giảm giá thành công", result));
});

const adminDiscountController = {
  getDiscountsController,
  createDiscountController,
  updateDiscountController,
  toggleDiscountController,
  deleteDiscountController,
};

export default adminDiscountController;
