import { BranchManager } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import revenueReportService from "../shared/revenueReportService.js";

const getManagerBranchId = async (managerId) => {
  const branchManager = await BranchManager.findOne({
    attributes: ["branchId"],
    where: { managerId, isActive: true },
    raw: true,
  });

  if (!branchManager) {
    throw new NotFoundError("Quản lý chưa được gán chi nhánh đang hoạt động");
  }

  return branchManager.branchId;
};

const getManagerDashboardService = async (managerId, query = {}) => {
  const branchId = await getManagerBranchId(managerId);
  return revenueReportService.buildDashboard({
    branchId,
    range: query.range || "today",
  });
};

const getManagerRevenueReportService = async (managerId, query = {}) => {
  const branchId = await getManagerBranchId(managerId);
  return revenueReportService.buildRevenueReport({
    branchId,
    query,
    includeProfit: false,
  });
};

const getManagerRevenueService = async (managerId, query = {}) => {
  const report = await getManagerRevenueReportService(managerId, query);
  return {
    branchId: report.branchId,
    startDate: report.startDate,
    endDate: report.endDate,
    overview: {
      totalRevenue: report.summary.totalRevenue,
      courtRevenue: report.summary.bookingRevenue,
      productRevenue: report.summary.productRevenue,
      beverageRevenue: report.summary.beverageRevenue,
      salesRevenue: report.summary.salesRevenue,
      bookingCount: report.summary.bookingCount,
      orderCount: report.summary.orderCount,
      productQuantitySold: report.summary.productQuantitySold,
      beverageQuantitySold: report.summary.beverageQuantitySold,
    },
    chart: report.revenueChart.map((item) => ({
      ...item,
      courtRevenue: item.bookingRevenue,
    })),
    breakdown: report.revenueByType.map((item) => ({
      type: item.type === "BOOKING" ? "COURT" : item.type,
      label: item.label,
      revenue: item.revenue,
    })),
    revenueByType: report.revenueByType,
    topProducts: report.productRevenueItems,
    topBeverages: report.beverageRevenueItems,
    recentRevenueOrders: report.recentRevenueOrders,
  };
};

export default {
  getManagerRevenueService,
  getManagerDashboardService,
  getManagerRevenueReportService,
};
