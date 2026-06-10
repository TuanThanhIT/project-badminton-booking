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

const getProductImagesController = asyncHandler(async (req, res) => {
  const result = await adminProductService.getAdminProductImagesService(req.params.productId);
  return res.status(200).json(new SuccessResponse("Lấy danh sách hình ảnh sản phẩm thành công", result));
});

const createProductImagesController = asyncHandler(async (req, res) => {
  const result = await adminProductService.createAdminProductImagesService(req.params.productId, req.body);
  return res.status(201).json(new SuccessResponse("Thêm hình ảnh sản phẩm thành công", result));
});

const updateProductImageController = asyncHandler(async (req, res) => {
  const result = await adminProductService.updateAdminProductImageService(req.params.imageId, req.body);
  return res.status(200).json(new SuccessResponse("Cập nhật hình ảnh sản phẩm thành công", result));
});

const deleteProductImageController = asyncHandler(async (req, res) => {
  const result = await adminProductService.deleteAdminProductImageService(req.params.imageId);
  return res.status(200).json(new SuccessResponse("Xóa hình ảnh sản phẩm thành công", result));
});

const getProductVariantsController = asyncHandler(async (req, res) => {
  const result = await adminProductService.getAdminProductVariantsService(req.params.productId);
  return res.status(200).json(new SuccessResponse("Lấy danh sách biến thể sản phẩm thành công", result));
});

const createProductVariantController = asyncHandler(async (req, res) => {
  const result = await adminProductService.createAdminProductVariantService(req.params.productId, req.body);
  return res.status(201).json(new SuccessResponse("Thêm biến thể sản phẩm thành công", result));
});

const updateProductVariantController = asyncHandler(async (req, res) => {
  const result = await adminProductService.updateAdminProductVariantService(req.params.variantId, req.body);
  return res.status(200).json(new SuccessResponse("Cập nhật biến thể sản phẩm thành công", result));
});

const deleteProductVariantController = asyncHandler(async (req, res) => {
  const result = await adminProductService.deleteAdminProductVariantService(req.params.variantId);
  return res.status(200).json(new SuccessResponse("Xóa biến thể sản phẩm thành công", result));
});

const getStockBranchesController = asyncHandler(async (req, res) => {
  const result = await adminProductService.getAdminProductStockBranchesService();
  return res.status(200).json(new SuccessResponse("Lấy danh sách chi nhánh tồn kho thành công", result));
});

const adminProductController = {
  getProductsController,
  getProductDetailController,
  createProductController,
  updateProductController,
  deleteProductController,
  getCategoriesController,
  getProductImagesController,
  createProductImagesController,
  updateProductImageController,
  deleteProductImageController,
  getProductVariantsController,
  createProductVariantController,
  updateProductVariantController,
  deleteProductVariantController,
  getStockBranchesController,
};

export default adminProductController;
