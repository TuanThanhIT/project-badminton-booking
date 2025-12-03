import type {
  ProductEplRequest,
  ProductEplResponse,
} from "../../types/product";
import instance from "../../utils/axiosCustomize";

const getProducts = (data: ProductEplRequest) =>
  instance.get<ProductEplResponse>("/employee/product/list", {
    params: data,
  });
const productService = {
  getProducts,
};
export default productService;
