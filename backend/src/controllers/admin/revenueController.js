import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import adminRevenueService from "../../services/admin/revenueService.js";

const getRevenueOverviewController = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await adminRevenueService.getRevenueOverviewService(
    startDate,
    endDate,
    req.query,
  );
  return res
    .status(200)
    .json(new SuccessResponse("Revenue overview loaded successfully", result));
});

const getRevenueByBranchController = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await adminRevenueService.getRevenueByBranchService(
    startDate,
    endDate,
    req.query,
  );
  return res
    .status(200)
    .json(new SuccessResponse("Revenue by branch loaded successfully", result));
});

const getRevenueByDateController = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await adminRevenueService.getRevenueByDateService(
    startDate,
    endDate,
    req.query,
  );
  return res
    .status(200)
    .json(new SuccessResponse("Revenue by date loaded successfully", result));
});

const getRevenueByMonthController = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await adminRevenueService.getRevenueByMonthService(
    startDate,
    endDate,
    req.query,
  );
  return res
    .status(200)
    .json(new SuccessResponse("Revenue by month loaded successfully", result));
});

const getRevenueByBranchDetailController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;
  const result = await adminRevenueService.getRevenueByBranchDetailService(
    Number(id),
    startDate,
    endDate,
  );
  return res
    .status(200)
    .json(new SuccessResponse("Branch revenue detail loaded successfully", result));
});

const getRevenueProductsController = asyncHandler(async (req, res) => {
  const { startDate, endDate, limit } = req.query;
  const result = await adminRevenueService.getRevenueProductsService(
    startDate,
    endDate,
    limit,
    req.query,
  );
  return res
    .status(200)
    .json(new SuccessResponse("Product revenue loaded successfully", result));
});

const getRevenueBeveragesController = asyncHandler(async (req, res) => {
  const { startDate, endDate, limit } = req.query;
  const result = await adminRevenueService.getRevenueBeveragesService(
    startDate,
    endDate,
    limit,
    req.query,
  );
  return res
    .status(200)
    .json(new SuccessResponse("Beverage revenue loaded successfully", result));
});

const getDashboardController = asyncHandler(async (req, res) => {
  const result = await adminRevenueService.getDashboardService(req.query);
  return res
    .status(200)
    .json(new SuccessResponse("Dashboard loaded successfully", result));
});

const getRevenueReportController = asyncHandler(async (req, res) => {
  const result = await adminRevenueService.getRevenueReportService(req.query);
  return res
    .status(200)
    .json(new SuccessResponse("Revenue report loaded successfully", result));
});

const adminRevenueController = {
  getRevenueOverviewController,
  getRevenueByBranchController,
  getRevenueByDateController,
  getRevenueByMonthController,
  getRevenueByBranchDetailController,
  getRevenueProductsController,
  getRevenueBeveragesController,
  getDashboardController,
  getRevenueReportController,
};

export default adminRevenueController;
