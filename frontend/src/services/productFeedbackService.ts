import type {
  AddOrUpdateFeedbackRequest,
  AddOrUpdateFeedbackResponse,
  ProductFeedbackDetailRequest,
  ProductFeedBackDetailResponse,
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
    `user/product/feedback/${orderDetailId}`
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

const productFeedbackService = {
  createProductFeedbackService,
  getProductFeedbackDetailService,
  updateProductFeedbackService,
};
export default productFeedbackService;
