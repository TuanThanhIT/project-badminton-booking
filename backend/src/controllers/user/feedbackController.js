import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import feedbackService from "../../services/user/feedbackService.js";

const createFeedbackOrderController = asyncHandler(async (req, res) => {
  const data = { ...req.body, userId: req.user.id };
  const feedback = await feedbackService.createFeedbackOrderService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Đánh giá sản phẩm thành công", feedback));
});

const updateFeedbackOrderController = asyncHandler(async (req, res) => {
  const data = { ...req.body, ...req.params, userId: req.user.id };
  const feedback = await feedbackService.updateFeedbackOrderService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Chỉnh sửa đánh giá thành công", feedback));
});

const getFeedbackOrderDetailController = asyncHandler(async (req, res) => {
  const data = { ...req.params, userId: req.user.id };
  const feedbackDetail =
    await feedbackService.getFeedbackOrderDetailService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy chi tiết đánh giá thành công", feedbackDetail),
    );
});

const deleteFeedbackOrderController = asyncHandler(async (req, res) => {
  const data = {
    ...req.params,
    userId: req.user.id,
  };
  await feedbackService.deleteFeedbackOrderService(data);
  return res.status(200).json(new SuccessResponse("Xóa đánh giá thành công"));
});

const feedbackController = {
  createFeedbackOrderController,
  updateFeedbackOrderController,
  getFeedbackOrderDetailController,
  deleteFeedbackOrderController,
};

export default feedbackController;
