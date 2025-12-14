import orderService from "../../services/admin/orderService.js";

const countOrderByOrderStatus = async (req, res, next) => {
  try {
    const { date } = req.query;
    const data = await orderService.countOrderByOrderStatusService(date);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const orderController = {
  countOrderByOrderStatus,
};
export default orderController;
