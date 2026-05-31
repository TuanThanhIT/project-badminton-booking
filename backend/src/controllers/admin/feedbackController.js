import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import adminFeedbackService from "../../services/admin/feedbackService.js";

const getFeedbacksController = asyncHandler(async (req, res) => {
  const result = await adminFeedbackService.getAdminFeedbacksService(req.query);
  return res.status(200).json(new SuccessResponse("Lấy danh sách đánh giá thành công", result));
});

const deleteFeedbackController = asyncHandler(async (req, res) => {
  const result = await adminFeedbackService.deleteAdminFeedbackService(req.params.feedbackId);
  return res.status(200).json(new SuccessResponse("Xóa đánh giá thành công", result));
});

const adminFeedbackController = {
  getFeedbacksController,
  deleteFeedbackController,
};

export default adminFeedbackController;
