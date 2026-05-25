import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import orderService from "../../services/employee/orderService.js";

const getOrdersController = asyncHandler(async (req, res) => {
  const data = {
    employeeId: req.user.id,
    ...req.query,
  };
  const result = await orderService.getOrdersService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách đơn hàng thành công", result));
});

const getOrderDetailController = asyncHandler(async (req, res) => {
  const data = {
    orderId: req.params.orderId,
    employeeId: req.user.id,
  };
  const result = await orderService.getOrderDetailService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy chi tiết đơn hàng thành công", result));
});

const confirmOrderController = asyncHandler(async (req, res) => {
  const data = {
    orderId: req.params.orderId,
    employeeId: req.user.id,
  };
  const result = await orderService.confirmOrderService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Xác nhận đơn hàng thành công", result));
});

const prepareOrderController = asyncHandler(async (req, res) => {
  const data = {
    orderId: req.params.orderId,
    employeeId: req.user.id,
  };
  const result = await orderService.prepareOrderService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Chuẩn bị đơn hàng thành công", result));
});

const readyToShipController = asyncHandler(async (req, res) => {
  const data = {
    orderId: req.params.orderId,
    employeeId: req.user.id,
  };
  const result = await orderService.readyToShipService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Hoàn tất đóng gói đơn hàng", result));
});

const shipOrderController = asyncHandler(async (req, res) => {
  const data = {
    orderId: req.params.orderId,
    employeeId: req.user.id,
  };
  const result = await orderService.shipOrderService(data);

  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Giao hàng cho đơn vị vận chuyển thành công",
        result,
      ),
    );
});

const approveCancelOrderController = asyncHandler(async (req, res) => {
  const data = {
    orderId: req.params.orderId,
    employeeId: req.user.id,
  };
  const result = await orderService.approveCancelOrderService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Xác nhận hủy đơn thành công", result));
});

const rejectCancelOrderController = asyncHandler(async (req, res) => {
  const data = {
    orderId: req.params.orderId,
    employeeId: req.user.id,
    ...req.body,
  };
  const result = await orderService.rejectCancelOrderService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Từ chối yêu cầu hủy đơn thành công", result));
});

const approveReturnOrderController = asyncHandler(async (req, res) => {
  const data = {
    orderId: req.params.orderId,
    employeeId: req.user.id,
  };
  const result = await orderService.approveReturnOrderService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Duyệt yêu cầu trả hàng thành công", result));
});

const completeReturnOrderController = asyncHandler(async (req, res) => {
  const data = {
    orderId: req.params.orderId,
    employeeId: req.user.id,
  };
  const result = await orderService.completeReturnOrderService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Xác nhận hoàn hàng thành công", result));
});

const forceReturnGHNOrderController = asyncHandler(async (req, res) => {
  const data = {
    orderId: req.params.orderId,
    employeeId: req.user.id,
  };
  const result = await orderService.forceReturnGHNOrderService(data);

  return res
    .status(200)
    .json(
      new SuccessResponse("Chuyển đơn sang luồng hoàn hàng thành công", result),
    );
});

const orderController = {
  getOrdersController,
  getOrderDetailController,
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
