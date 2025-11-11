import orderService from "../../services/customer/orderService.js";

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      orderStatus,
      totalAmount,
      code,
      note,
      orderDetails,
      paymentAmount,
      paymentMethod,
      paymentStatus,
    } = req.body;
    const orderId = await orderService.createOrderService(
      orderStatus,
      totalAmount,
      userId,
      code,
      note,
      orderDetails,
      paymentAmount,
      paymentMethod,
      paymentStatus
    );
    return res
      .status(201)
      .json({ orderId: orderId, message: "Đơn hàng đã được tạo thành công." });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getOrdersService(userId);
    return res.status(200).json(orders);
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
  createOrder,
  getOrders,
  cancelOrder,
};
export default orderController;
