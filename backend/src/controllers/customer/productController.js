import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import productCustomerService from "../../services/customer/productService.js";

const getProductsByFilter = asyncHandler(async (req, res) => {
  const {
    category_id: cateId,
    price_range,
    size,
    color,
    material,
    product_id,
    sort,
    page,
    limit,
    keyword,
  } = req.query;
  const data = {
    cateId,
    prices: price_range?.split("-") ?? [],
    sizes: size?.split(",") ?? [],
    colors: color?.split(",") ?? [],
    materials: material?.split(",") ?? [],
    excludeProductId: product_id ?? null,
    sort,
    page,
    limit,
    keyword,
  };
  const products =
    await productCustomerService.getProductsByFilterService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy danh sách sản phẩm lọc theo điều kiện thành công",
        products,
      ),
    );
});

const getProductsByGroupNameAndFilter = asyncHandler(async (req, res) => {
  const {
    group_name: groupName,
    price_range,
    size,
    color,
    material,
    product_id,
    sort,
    page,
    limit,
    keyword,
  } = req.query;
  const data = {
    groupName,
    prices: price_range?.split("-") ?? [],
    sizes: size?.split(",") ?? [],
    colors: color?.split(",") ?? [],
    materials: material?.split(",") ?? [],
    excludeProductId: product_id ?? null,
    sort,
    page,
    limit,
    keyword,
  };
  const productsFilter =
    await productCustomerService.getProductsByGroupNameAndFilterService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy danh sách sản phẩm lọc theo nhóm và điều kiện thành công",
        productsFilter,
      ),
    );
});

const getProductDetail = asyncHandler(async (req, res) => {
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

const productCustomerController = {
  getProductsByFilter,
  getProductDetail,
  getProductsByGroupNameAndFilter,
};
export default productCustomerController;
