import type {
  AddOrUpdateFeedbackRequest,
  AddOrUpdateFeedbackResponse,
  ProductFeedbackDetailRequest,
  ProductFeedBackDetailResponse,
  ProductFeedbackRequest,
  ProductFeedbackResponse,
} from "../types/productFeedback";
import instance from "../utils/axiosCustomize";

const createProductFeedbackService = async (dt: AddOrUpdateFeedbackRequest) => {
  const { content, rating, orderDetailId } = dt;
  const data = { content, rating };
  return instance.post<AddOrUpdateFeedbackResponse>(
    `/user/product/feedback/${orderDetailId}`,
    data
  );
};

const getProductFeedbackDetailService = async (
  data: ProductFeedbackDetailRequest
) => {
  const orderDetailId = data.orderDetailId;
  return instance.get<ProductFeedBackDetailResponse>(
    `user/product/feedback/update/${orderDetailId}`
  );
};

const updateProductFeedbackService = async (dt: AddOrUpdateFeedbackRequest) => {
  const { content, rating, orderDetailId } = dt;
  const data = { content, rating };
  return instance.patch<AddOrUpdateFeedbackResponse>(
    `/user/product/feedback/${orderDetailId}`,
    data
  );
};

const getProductFeedbackService = async (data: ProductFeedbackRequest) => {
  const { productId } = data;
  return instance.get<ProductFeedbackResponse>(
    `/user/product/feedback/${productId}`
  );
};
const productFeedbackService = {
  createProductFeedbackService,
  getProductFeedbackDetailService,
  updateProductFeedbackService,
  getProductFeedbackService,
};
export default productFeedbackService;
