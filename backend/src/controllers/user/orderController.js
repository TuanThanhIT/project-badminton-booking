import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import orderService from "../../services/user/orderService.js";

const checkoutPreviewController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = { userId, ...req.body };
  const sessionResult = await orderService.checkoutPreviewService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy thông tin checkout thành công", sessionResult),
    );
});

const calculateShippingController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = { userId, ...req.body };
  const sessionResult = await orderService.calculateShippingService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Tính phí ship thành công", sessionResult));
});

const clearCheckoutSessionController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = { userId, ...req.body };
  await orderService.clearCheckoutSessionService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Xóa checkout session thành công"));
});

const orderController = {
  checkoutPreviewController,
  calculateShippingController,
  clearCheckoutSessionController,
};

export default orderController;
