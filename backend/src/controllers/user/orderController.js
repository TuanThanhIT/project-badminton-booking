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

const createOrderController = asyncHandler(async (req, res) => {
  const data = { ...req.body, userId: req.user.id, ip: req.ip };
  const result = await orderService.createOrderService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Tạo đơn hàng thành công", result));
});

const walletOrderConfirmController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result = await orderService.walletOrderConfirmService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Xác nhận thanh toán đơn hàng bằng ví thanh toán thành công",
        result,
      ),
    );
});

const orderCallbackController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  await orderService.orderCallbackService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Thanh toán đơn hàng bằng VNPay thành công"));
});

const getOrderGroupByIdController = asyncHandler(async (req, res) => {
  const orderGroupId = req.params.orderGroupId;
  const userId = req.user.id;
  const data = { orderGroupId, userId };
  const result = await orderService.getOrderGroupByIdService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Kiểm tra đơn hàng thành công", result));
});

const getUserOrdersController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, ...req.query };
  const result = await orderService.getUserOrdersService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy thông tin tất cả đơn hàng thành công", result),
    );
});

const getOrderDetailController = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const data = { orderId, userId: req.user.id };
  const result = await orderService.getOrderDetailService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy chi tiết đơn hàng thành công", result));
});

const getOrderTrackingController = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const data = { orderId };
  const result = await orderService.getOrderTrackingService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy lịch sử trạng thái đơn hàng thành công", result),
    );
});

const getTrackingProgressController = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const data = { orderId };
  const result = await orderService.getTrackingProgressService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy tiến trình vận chuyển thành công", result));
});

const orderController = {
  checkoutPreviewController,
  calculateShippingController,
  clearCheckoutSessionController,
  createOrderController,
  orderCallbackController,
  walletOrderConfirmController,
  getOrderGroupByIdController,
  getOrderDetailController,
  getOrderTrackingController,
  getTrackingProgressController,
  getUserOrdersController,
};

export default orderController;
