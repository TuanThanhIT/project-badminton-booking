import instance from "../utils/axiosCustomize";
import type { ProductRecommendationResponse } from "../types/productRecommendation";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const getProductRecommendations = async (topK = 12) => {
  const res = await instance.get<ApiEnvelope<ProductRecommendationResponse>>(
    "/user/ai/product-recommendations",
    { params: { topK }, timeout: 60000 },
  );
  return res.data.data;
};

export const getRelatedProducts = async (productId: number, topK = 12) => {
  const res = await instance.get<ApiEnvelope<ProductRecommendationResponse>>(
    "/user/ai/product-recommendations/related",
    { params: { productId, topK }, timeout: 60000 },
  );
  return res.data.data;
};

const productRecommendationService = {
  getProductRecommendations,
  getRelatedProducts,
};

export default productRecommendationService;
