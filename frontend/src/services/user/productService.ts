import type {
  ProductDetailRequest,
  ProductDetailResponse,
  ProductFilterResponse,
  ProductQueriesRequest,
} from "../../types/product";
import instance from "../../utils/axiosCustomize";

const getProductsByFilterService = (data: ProductQueriesRequest) =>
  instance.get<ProductFilterResponse>("/user/products", { params: data });

const getProductDetailService = (data: ProductDetailRequest) => {
  const { productId } = data;
  return instance.get<ProductDetailResponse>(`/user/products/${productId}`);
};

const productService = {
  getProductsByFilterService,
  getProductDetailService,
};

export default productService;
