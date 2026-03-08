import orderService from "../../services/admin/orderService.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";

const countOrderByOrderStatus = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result = await orderService.countOrderByOrderStatusService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy thống kê thành công", result));
});

const orderController = {
  countOrderByOrderStatus,
};
export default orderController;
