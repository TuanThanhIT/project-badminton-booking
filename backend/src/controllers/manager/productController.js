import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import productService from "../../services/manager/productService.js";

const getProductsController = asyncHandler(async (req, res) => {
  const managerId = req.user.id;
  const result = await productService.getProductsService(managerId, req.query);

  return res
    .status(200)
    .json(new SuccessResponse("Get manager products successfully", result));
});

const getProductCategoriesController = asyncHandler(async (req, res) => {
  const result = await productService.getProductCategoriesService();

  return res
    .status(200)
    .json(new SuccessResponse("Get manager product categories successfully", result));
});

const getProductDetailController = asyncHandler(async (req, res) => {
  const managerId = req.user.id;
  const result = await productService.getProductDetailService(
    managerId,
    req.params.productId,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Get manager product detail successfully", result));
});

export default {
  getProductsController,
  getProductCategoriesController,
  getProductDetailController,
};
