import productFeedbackService from "../../services/customer/productFeedbackService.js";

const createProductFeedback = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { content, rating } = req.body;
    const orderDetailId = req.params.id;
    await productFeedbackService.createFeedbackService(
      content,
      rating,
      userId,
      orderDetailId
    );
    return res.status(201).json({ message: "Đánh giá sản phẩm thành công!" });
  } catch (error) {
    next(error);
  }
};

const getFeedbackUpdate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderDetailId = req.params.id;

    const proFeedback = await productFeedbackService.getFeedbackUpdateService(
      orderDetailId,
      userId
    );
    return res.status(200).json(proFeedback);
  } catch (error) {
    next(error);
  }
};

const updateFeedback = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderDetailId = req.params.id;
    const { rating, content } = req.body;
    await productFeedbackService.updateFeedbackService(
      content,
      rating,
      userId,
      orderDetailId
    );
    return res
      .status(200)
      .json({ message: "Cập nhật đánh giá cho sản phẩm thành công!" });
  } catch (error) {
    next(error);
  }
};

const getFeedbackProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const productFeedback =
      await productFeedbackService.getFeedbackProductService(productId);
    return res.status(200).json(productFeedback);
  } catch (error) {
    next(error);
  }
};
const productFeedbackController = {
  createProductFeedback,
  getFeedbackUpdate,
  updateFeedback,
  getFeedbackProduct,
};
export default productFeedbackController;
