import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import adminBeverageService from "../../services/admin/beverageService.js";

const getBeveragesController = asyncHandler(async (req, res) => {
  const result = await adminBeverageService.getAdminBeveragesService(req.query);
  return res.status(200).json(new SuccessResponse("Lấy danh sách đồ uống thành công", result));
});

const createBeverageController = asyncHandler(async (req, res) => {
  const result = await adminBeverageService.createAdminBeverageService(req.body);
  return res.status(201).json(new SuccessResponse("Tạo đồ uống thành công", result));
});

const updateBeverageController = asyncHandler(async (req, res) => {
  const result = await adminBeverageService.updateAdminBeverageService(req.params.beverageId, req.body);
  return res.status(200).json(new SuccessResponse("Cập nhật đồ uống thành công", result));
});

const deleteBeverageController = asyncHandler(async (req, res) => {
  const result = await adminBeverageService.deleteAdminBeverageService(req.params.beverageId);
  return res.status(200).json(new SuccessResponse("Xóa đồ uống thành công", result));
});

const getBeverageStocksController = asyncHandler(async (req, res) => {
  const result = await adminBeverageService.getBeverageStocksService(req.params.beverageId);
  return res.status(200).json(new SuccessResponse("Lấy tồn kho theo chi nhánh thành công", result));
});

const adminBeverageController = {
  getBeveragesController,
  createBeverageController,
  updateBeverageController,
  deleteBeverageController,
  getBeverageStocksController,
};

export default adminBeverageController;
