import type {
  ProductDetailRequest,
  ProductDetailResponse,
  ProductFeedbackRequest,
  ProductFeedbackResponse,
  ProductFilterResponse,
  ProductImageSearchResponse,
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

const imageSearchProductsService = (formData: FormData) =>
  instance.post<ProductImageSearchResponse>(
    "/user/products/image-search",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 70000,
    },
  );

const productService = {
  getProductsByFilterService,
  getProductDetailService,
  getProductFeedbackService,
  imageSearchProductsService,
};

export default productService;
