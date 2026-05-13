import instance from "../../utils/axiosCustomize";

import type {
  CreateFeedbackRequest,
  CreateFeedbackResponse,
  FeedbackDetailResponse,
  UpdateFeedbackRequest,
  UpdateFeedbackResponse,
  DeleteFeedbackResponse,
  FeedbackDetailRequest,
  DeleteFeedbackRequest,
} from "../../types/feedback";

const createFeedbackService = (data: CreateFeedbackRequest) =>
  instance.post<CreateFeedbackResponse>("/user/feedbacks", data);
const getFeedbackDetailService = (data: FeedbackDetailRequest) => {
  const { orderId, variantId } = data;

  return instance.get<FeedbackDetailResponse>(
    `/user/feedbacks/orders/${orderId}/products/${variantId}`,
  );
};

const updateFeedbackService = (data: UpdateFeedbackRequest) => {
  const { orderId, variantId, ...payload } = data;

  return instance.patch<UpdateFeedbackResponse>(
    `/user/feedbacks/orders/${orderId}/products/${variantId}`,
    payload,
  );
};

const deleteFeedbackService = (data: DeleteFeedbackRequest) => {
  const { feedbackId } = data;
  return instance.delete<DeleteFeedbackResponse>(
    `/user/feedbacks/${feedbackId}`,
  );
};

const feedbackService = {
  createFeedbackService,
  getFeedbackDetailService,
  updateFeedbackService,
  deleteFeedbackService,
};

export default feedbackService;
