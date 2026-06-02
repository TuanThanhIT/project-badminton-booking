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

const getDashboard = asyncHandler(async (req, res) => {
  const result = await revenueService.getManagerDashboardService(
    req.user.id,
    req.query,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Get manager dashboard successfully", result));
});

const getRevenueReport = asyncHandler(async (req, res) => {
  const result = await revenueService.getManagerRevenueReportService(
    req.user.id,
    req.query,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Get manager revenue report successfully", result));
});

export default {
  getRevenue,
  getDashboard,
  getRevenueReport,
};
