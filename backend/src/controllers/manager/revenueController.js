import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import revenueService from "../../services/manager/revenueService.js";

const getRevenue = asyncHandler(async (req, res) => {
  const result = await revenueService.getManagerRevenueService(
    req.user.id,
    req.query,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Get manager revenue successfully", result));
});

export default {
  getRevenue,
};
