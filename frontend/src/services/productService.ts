import type { ProductParams, ProductRelatedParams } from "../types/product";
import instance from "../utils/axiosCustomize";

const getProductByFiltersService = (params: ProductParams) =>
  instance.get("/user/product/list", { params });

const getProductDetailService = (productId: number) =>
  instance.get(`/user/product/${productId}`);

const getProductRelatedService = (params: ProductRelatedParams) =>
  instance.get("/user/product/list", { params });

const productService = {
  getProductByFiltersService,
  getProductDetailService,
  getProductRelatedService,
};
export default productService;
