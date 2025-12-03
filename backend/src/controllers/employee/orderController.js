import orderService from "../../services/employee/orderService.js";

const getOrders = async (req, res, next) => {
  try {
    const { status, keyword, date } = req.query;
    const orders = await orderService.getOrdersService(status, keyword, date);
    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const confirmedOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    await orderService.confirmedOrderService(orderId);
    return res.status(200).json({ message: "Xác nhận đơn hàng thành công!" });
  } catch (error) {
    next(error);
  }
};

const completedOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    await orderService.completedOrderService(orderId);
    return res.status(200).json({ message: "Đơn hàng đã hoàn thành!" });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { cancelReason } = req.body;
    await orderService.cancelOrderService(orderId, cancelReason);
    return res
      .status(200)
      .json({ message: "Đơn hàng của bạn đã được hủy thành công!" });
  } catch (error) {
    next(error);
  }
};
const orderController = {
  getOrders,
  confirmedOrder,
  completedOrder,
  cancelOrder,
};
export default orderController;
