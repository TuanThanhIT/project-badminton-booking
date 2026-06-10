import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import orderService from "../../services/manager/orderService.js";

const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrdersService(req.user.id, req.query);

  return res
    .status(200)
    .json(new SuccessResponse("Lay danh sach don hang cua quan ly thanh cong", result));
});

const getOrderDetail = asyncHandler(async (req, res) => {
  const result = await orderService.getOrderDetailService(
    req.user.id,
    req.params.orderId,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Lay chi tiet don hang cua quan ly thanh cong", result));
});

const getMonthlyHighlights = asyncHandler(async (req, res) => {
  const result = await orderService.getMonthlyHighlightsService(
    req.user.id,
    req.query,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Lay diem noi bat trong thang cua quan ly thanh cong", result));
});

export default {
  getOrders,
  getOrderDetail,
  getMonthlyHighlights,
};
