import instance from "../../utils/axiosCustomize";

const getFeedbacksService = (params: {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: number | string;
  rating?: number | string;
  feedbackType?: string;
}) => instance.get("/admin/feedbacks", { params });

const deleteFeedbackService = (feedbackId: number) =>
  instance.delete(`/admin/feedbacks/${feedbackId}`);

const adminFeedbackService = {
  getFeedbacksService,
  deleteFeedbackService,
};

export default adminFeedbackService;
