import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import productFeedbackService from "../../services/customer/productFeedbackService.js";

const createProductFeedback = asyncHandler(async (req, res) => {
  const { orderDetailId } = req.params;
  const data = {
    userId: req.user.id,
    orderDetailId,
    ...req.body,
  };
  await productFeedbackService.createFeedbackService(data);
  return res.status(201).json({ message: "Đánh giá sản phẩm thành công!" });
});

const getFeedbackUpdate = asyncHandler(async (req, res) => {
  const { orderDetailId } = req.params;
  const data = { userId: req.user.id, orderDetailId };
  const proFeedback =
    await productFeedbackService.getFeedbackUpdateService(data);
  return res.status(200).json("Lấy đánh giá sản phẩm thành công", proFeedback);
});

const updateFeedback = asyncHandler(async (req, res) => {
  const { orderDetailId } = req.params;
  const data = {
    userId: req.user.id,
    orderDetailId,
    ...req.body,
  };
  const productFeedback =
    await productFeedbackService.updateFeedbackService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Cập nhật đánh giá cho sản phẩm thành công",
        productFeedback,
      ),
    );
});

const getProductFeedback = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const data = { productId };
  const productFeedback =
    await productFeedbackService.getProductFeedbackService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy đánh giá cho sản phẩm thành công",
        productFeedback,
      ),
    );
});

const productFeedbackController = {
  createProductFeedback,
  getFeedbackUpdate,
  updateFeedback,
  getProductFeedback,
};
export default productFeedbackController;
