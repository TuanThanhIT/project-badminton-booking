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
    .json(new SuccessResponse("Lấy doanh thu của quản lý thành công", result));
});

const getDashboard = asyncHandler(async (req, res) => {
  const result = await revenueService.getManagerDashboardService(
    req.user.id,
    req.query,
  );

  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy dữ liệu dashboard của quản lý thành công",
        result,
      ),
    );
});

const getRevenueReport = asyncHandler(async (req, res) => {
  const result = await revenueService.getManagerRevenueReportService(
    req.user.id,
    req.query,
  );

  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy báo cáo doanh thu của quản lý thành công",
        result,
      ),
    );
});

export default {
  getRevenue,
  getDashboard,
  getRevenueReport,
};
