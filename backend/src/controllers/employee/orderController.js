import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import orderService from "../../services/employee/orderService.js";

const confirmOrderController = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const data = { orderId };
  const result = await orderService.confirmOrderService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Xác nhận đơn hàng thành công", result));
});

const prepareOrderController = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const data = { orderId };
  const result = await orderService.prepareOrderService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Chuẩn bị đơn hàng thành công", result));
});

const readyToShipController = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const data = { orderId };
  const result = await orderService.readyToShipService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Hoàn tất đóng gói đơn hàng", result));
});

const shipOrderController = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const data = { orderId };
  const result = await orderService.shipOrderService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Giao hàng cho đơn vị vận chuyển thành công", result),
    );
});

const approveCancelOrderController = asyncHandler(async (req, res) => {
  const data = { orderId: req.params.orderId };
  const result = await orderService.approveCancelOrderService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Xác nhận hủy đơn thành công", result));
});

const rejectCancelOrderController = asyncHandler(async (req, res) => {
  const data = { orderId: req.params.orderId, ...req.body };
  await orderService.rejectCancelOrderService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Từ chối yêu cầu hủy đơn thành công"));
});

const approveReturnOrderController = asyncHandler(async (req, res) => {
  const data = { orderId: req.params.orderId };
  await orderService.approveReturnOrderService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Duyệt yêu cầu trả hàng thành công"));
});

const completeReturnOrderController = asyncHandler(async (req, res) => {
  const data = { orderId: req.params.orderId };
  const result = await orderService.completeReturnOrderService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Xác nhận hoàn hàng thành công", result));
});

const forceReturnGHNOrderController = asyncHandler(async (req, res) => {
  const data = { orderId: req.params.orderId };
  await orderService.forceReturnGHNOrderService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Yêu cầu GHN hoàn hàng thành công"));
});

const orderController = {
  confirmOrderController,
  prepareOrderController,
  readyToShipController,
  shipOrderController,
  approveCancelOrderController,
  rejectCancelOrderController,
  approveReturnOrderController,
  completeReturnOrderController,
  forceReturnGHNOrderController,
};

export default orderController;
