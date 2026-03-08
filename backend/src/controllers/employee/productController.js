import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import productService from "../../services/employee/productService.js";

const getProducts = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const products = await productService.getProductsService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy tất cả sản phẩm thành công", products));
});

const productController = {
  getProducts,
};

export default productController;
