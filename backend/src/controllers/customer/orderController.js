import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import orderService from "../../services/customer/orderService.js";

const createOrder = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, ...req.body };
  const orderId = await orderService.createOrderService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Đơn hàng đã được tạo thành công", orderId));
});

const getOrders = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  const orders = await orderService.getOrdersService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách đơn hàng thành công", orders));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const data = { orderId, ...req.body };
  await orderService.cancelOrderService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Đơn hàng của bạn đã được hủy thành công", data));
});

const orderController = {
  createOrder,
  getOrders,
  cancelOrder,
};
export default orderController;
