import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import orderService from "../../services/employee/orderService.js";

const getOrders = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const orders = await orderService.getOrdersService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy tất cả đơn hàng thành công", orders));
});

const confirmedOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const data = { orderId };
  const order = await orderService.confirmedOrderService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Xác nhận đơn hàng thành công", order));
});

const completedOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const data = { orderId };
  const order = await orderService.completedOrderService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Đơn hàng đã hoàn thành", order));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const data = { orderId, ...req.body };
  const order = await orderService.cancelOrderService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Đơn hàng của bạn đã được hủy thành công", order),
    );
});

const orderController = {
  getOrders,
  confirmedOrder,
  completedOrder,
  cancelOrder,
};
export default orderController;
