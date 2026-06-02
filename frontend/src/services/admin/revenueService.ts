import instance from "../../utils/axiosCustomize";

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  branchId?: number | string;
  revenueType?: string;
  itemType?: string;
  groupBy?: string;
  range?: string;
}

const getRevenueReportService = (params: DateRangeParams) =>
  instance.get("/admin/revenue/report", { params });

const getRevenueOverviewService = (params: DateRangeParams) =>
  instance.get("/admin/revenue/overview", { params });

const getRevenueByBranchService = (params: DateRangeParams) =>
  instance.get("/admin/revenue/by-branch", { params });

const getRevenueByDateService = (params: DateRangeParams) =>
  instance.get("/admin/revenue/by-date", { params });

const getRevenueByMonthService = (params: DateRangeParams) =>
  instance.get("/admin/revenue/by-month", { params });

const getRevenueByBranchDetailService = (branchId: number, params: DateRangeParams) =>
  instance.get(`/admin/revenue/by-branch/${branchId}/detail`, { params });

const getDashboardService = (params?: DateRangeParams) =>
  instance.get("/admin/revenue/dashboard", { params });

const adminRevenueService = {
  getDashboardService,
  getRevenueReportService,
  getRevenueOverviewService,
  getRevenueByBranchService,
  getRevenueByDateService,
  getRevenueByMonthService,
  getRevenueByBranchDetailService,
};

export default adminRevenueService;
