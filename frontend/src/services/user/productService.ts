import type {
  ProductFilterResponse,
  ProductQueriesRequest,
} from "../../types/product";
import instance from "../../utils/axiosCustomize";

const getProductsByFilterService = (data: ProductQueriesRequest) =>
  instance.get<ProductFilterResponse>("/user/products", { params: data });

const productService = {
  getProductsByFilterService,
};

export default productService;
