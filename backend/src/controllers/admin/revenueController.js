import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import adminRevenueService from "../../services/admin/revenueService.js";

const getRevenueOverviewController = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await adminRevenueService.getRevenueOverviewService(startDate, endDate);
  return res.status(200).json(new SuccessResponse("Lấy tổng quan doanh thu thành công", result));
});

const getRevenueByBranchController = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await adminRevenueService.getRevenueByBranchService(startDate, endDate);
  return res.status(200).json(new SuccessResponse("Lấy doanh thu theo chi nhánh thành công", result));
});

const getRevenueByDateController = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await adminRevenueService.getRevenueByDateService(startDate, endDate);
  return res.status(200).json(new SuccessResponse("Lấy doanh thu theo ngày thành công", result));
});

const getRevenueByMonthController = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await adminRevenueService.getRevenueByMonthService(startDate, endDate);
  return res.status(200).json(new SuccessResponse("Lấy doanh thu theo tháng thành công", result));
});

const getRevenueByBranchDetailController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;
  const result = await adminRevenueService.getRevenueByBranchDetailService(Number(id), startDate, endDate);
  return res.status(200).json(new SuccessResponse("Lấy chi tiết doanh thu chi nhánh thành công", result));
});

const getDashboardController = asyncHandler(async (req, res) => {
  const result = await adminRevenueService.getDashboardService(req.query);
  return res.status(200).json(new SuccessResponse("Lấy dữ liệu dashboard thành công", result));
});

const getRevenueReportController = asyncHandler(async (req, res) => {
  const result = await adminRevenueService.getRevenueReportService(req.query);
  return res.status(200).json(new SuccessResponse("Lấy báo cáo doanh thu thành công", result));
});

const adminRevenueController = {
  getRevenueOverviewController,
  getRevenueByBranchController,
  getRevenueByDateController,
  getRevenueByMonthController,
  getRevenueByBranchDetailController,
  getDashboardController,
  getRevenueReportController,
};

export default adminRevenueController;
