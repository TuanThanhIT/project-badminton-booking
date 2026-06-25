import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import orderService from "../../services/manager/orderService.js";

const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrdersService(req.user.id, req.query);

  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy danh sách đơn hàng của quản lý thành công",
        result,
      ),
    );
});

const getOrderDetail = asyncHandler(async (req, res) => {
  const result = await orderService.getOrderDetailService(
    req.user.id,
    req.params.orderId,
  );

  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy chi tiết đơn hàng của quản lý thành công",
        result,
      ),
    );
});

const getMonthlyHighlights = asyncHandler(async (req, res) => {
  const result = await orderService.getMonthlyHighlightsService(
    req.user.id,
    req.query,
  );

  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy điểm nổi bật trong tháng của quản lý thành công",
        result,
      ),
    );
});

export default {
  getOrders,
  getOrderDetail,
  getMonthlyHighlights,
};
