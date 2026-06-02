import revenueReportService from "../shared/revenueReportService.js";

const getDashboardService = (query = {}) =>
  revenueReportService.buildDashboard({
    range: query.range || "today",
    branchId: query.branchId ? Number(query.branchId) : null,
  });

const getRevenueReportService = (query = {}) =>
  revenueReportService.buildRevenueReport({
    branchId: query.branchId ? Number(query.branchId) : null,
    query,
    includeProfit: true,
  });

const getRevenueOverviewService = async (startDate, endDate) => {
  const report = await getRevenueReportService({ startDate, endDate });
  return {
    bookingRevenue: report.summary.bookingRevenue,
    orderRevenue: report.summary.salesRevenue,
    productRevenue: report.summary.productRevenue,
    beverageRevenue: report.summary.beverageRevenue,
    totalRevenue: report.summary.totalRevenue,
    bookingCount: report.summary.bookingCount,
    orderCount: report.summary.orderCount,
    salesCost: report.summary.salesCost,
    grossProfit: report.summary.grossProfit,
    grossMargin: report.summary.grossMargin,
  };
};

const getRevenueByBranchService = async (startDate, endDate) => {
  const report = await getRevenueReportService({ startDate, endDate });
  return report.revenueByBranch.map((branch) => ({
    ...branch,
    orderRevenue: branch.productRevenue + branch.beverageRevenue,
  }));
};

const getRevenueByDateService = async (startDate, endDate) => {
  const report = await getRevenueReportService({ startDate, endDate });
  return report.revenueChart.map((item) => ({
    ...item,
    orderRevenue: item.salesRevenue,
  }));
};

const getRevenueByMonthService = async (startDate, endDate) => {
  const report = await getRevenueReportService({
    startDate,
    endDate,
  });
  const map = new Map();
  report.revenueChart.forEach((item) => {
    const month = item.date.slice(0, 7);
    if (!map.has(month)) {
      map.set(month, {
        month,
        bookingRevenue: 0,
        productRevenue: 0,
        beverageRevenue: 0,
        orderRevenue: 0,
        salesRevenue: 0,
        totalRevenue: 0,
        bookingCount: 0,
        orderCount: 0,
      });
    }
    const row = map.get(month);
    row.bookingRevenue += item.bookingRevenue;
    row.productRevenue += item.productRevenue;
    row.beverageRevenue += item.beverageRevenue;
    row.salesRevenue += item.salesRevenue;
    row.orderRevenue += item.salesRevenue;
    row.totalRevenue += item.totalRevenue;
  });
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
};

const getRevenueByBranchDetailService = async (branchId, startDate, endDate) => {
  const report = await getRevenueReportService({ branchId, startDate, endDate });
  return report.revenueChart.map((item) => ({
    ...item,
    orderRevenue: item.salesRevenue,
  }));
};

export default {
  getDashboardService,
  getRevenueReportService,
  getRevenueOverviewService,
  getRevenueByBranchService,
  getRevenueByDateService,
  getRevenueByMonthService,
  getRevenueByBranchDetailService,
};
