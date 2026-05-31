import type {
  ProductDetailRequest,
  ProductDetailResponse,
  ProductFeedbackRequest,
  ProductFeedbackResponse,
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

const getProductFeedbackService = (data: ProductFeedbackRequest) => {
  const { productId, page, limit, rating } = data;

  return instance.get<ProductFeedbackResponse>(
    `/user/products/feedbacks/${productId}`,
    {
      params: {
        page,
        limit,
        rating,
      },
    },
  );
};

const productService = {
  getProductsByFilterService,
  getProductDetailService,
  getProductFeedbackService,
};

export default productService;
