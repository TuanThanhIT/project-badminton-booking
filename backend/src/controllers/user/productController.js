import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import productService from "../../services/user/productService.js";

const getProductsByFilterController = asyncHandler(async (req, res) => {
  const {
    cateId,
    branchId,
    pricesRange,
    sizes,
    colors,
    materials,
    productId,
    sort,
    page,
    limit,
    keyword,
  } = req.query;
  const data = {
    cateId,
    prices: pricesRange?.split("-").filter(Boolean) || [],
    sizes: sizes?.split(",").filter(Boolean) || [],
    colors: colors?.split(",").filter(Boolean) || [],
    materials: materials?.split(",").filter(Boolean) || [],
    branchIds: branchId?.split(",").filter(Boolean) || [],
    excludeProductId: productId ?? null,
    sort,
    page,
    limit,
    keyword,
  };
  const products = await productService.getProductsByFilterService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy danh sách sản phẩm lọc theo điều kiện thành công",
        products,
      ),
    );
});

const getProductDetailController = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const data = { productId };
  const productDetail =
    await productCustomerService.getProductDetailService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse("Lấy chi tiết sản phẩm thành công", productDetail),
    );
});

const productController = {
  getProductsByFilterController,
  getProductDetailController,
};
export default productController;
