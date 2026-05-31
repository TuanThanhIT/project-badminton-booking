import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import orderService from "../../services/manager/orderService.js";

const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrdersService(req.user.id, req.query);

  return res
    .status(200)
    .json(new SuccessResponse("Get manager orders successfully", result));
});

const getOrderDetail = asyncHandler(async (req, res) => {
  const result = await orderService.getOrderDetailService(
    req.user.id,
    req.params.orderId,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Get manager order detail successfully", result));
});

const getMonthlyHighlights = asyncHandler(async (req, res) => {
  const result = await orderService.getMonthlyHighlightsService(
    req.user.id,
    req.query,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Get manager monthly highlights successfully", result));
});

export default {
  getOrders,
  getOrderDetail,
  getMonthlyHighlights,
};
