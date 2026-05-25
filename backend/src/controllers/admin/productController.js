import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import adminProductService from "../../services/admin/productService.js";

const getProductsController = asyncHandler(async (req, res) => {
  const result = await adminProductService.getAdminProductsService(req.query);
  return res.status(200).json(new SuccessResponse("Lấy danh sách sản phẩm thành công", result));
});

const getProductDetailController = asyncHandler(async (req, res) => {
  const result = await adminProductService.getAdminProductDetailService(req.params.productId);
  return res.status(200).json(new SuccessResponse("Lấy chi tiết sản phẩm thành công", result));
});

const createProductController = asyncHandler(async (req, res) => {
  const result = await adminProductService.createAdminProductService(req.body);
  return res.status(201).json(new SuccessResponse("Tạo sản phẩm thành công", result));
});

const updateProductController = asyncHandler(async (req, res) => {
  const result = await adminProductService.updateAdminProductService(req.params.productId, req.body);
  return res.status(200).json(new SuccessResponse("Cập nhật sản phẩm thành công", result));
});

const deleteProductController = asyncHandler(async (req, res) => {
  const result = await adminProductService.deleteAdminProductService(req.params.productId);
  return res.status(200).json(new SuccessResponse("Xóa sản phẩm thành công", result));
});

const getCategoriesController = asyncHandler(async (req, res) => {
  const result = await adminProductService.getAdminCategoriesService();
  return res.status(200).json(new SuccessResponse("Lấy danh sách danh mục thành công", result));
});

const adminProductController = {
  getProductsController,
  getProductDetailController,
  createProductController,
  updateProductController,
  deleteProductController,
  getCategoriesController,
};

export default adminProductController;
