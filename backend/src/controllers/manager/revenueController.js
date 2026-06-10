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
    .json(new SuccessResponse("Lay doanh thu cua quan ly thanh cong", result));
});

const getDashboard = asyncHandler(async (req, res) => {
  const result = await revenueService.getManagerDashboardService(
    req.user.id,
    req.query,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Lay du lieu dashboard cua quan ly thanh cong", result));
});

const getRevenueReport = asyncHandler(async (req, res) => {
  const result = await revenueService.getManagerRevenueReportService(
    req.user.id,
    req.query,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Lay bao cao doanh thu cua quan ly thanh cong", result));
});

export default {
  getRevenue,
  getDashboard,
  getRevenueReport,
};
