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

const orderController = {
  confirmOrderController,
  prepareOrderController,
  readyToShipController,
  shipOrderController,
};

export default orderController;
