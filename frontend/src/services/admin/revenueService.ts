import instance from "../../utils/axiosCustomize";

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

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

const getDashboardService = () =>
  instance.get("/admin/revenue/dashboard");

const adminRevenueService = {
  getDashboardService,
  getRevenueOverviewService,
  getRevenueByBranchService,
  getRevenueByDateService,
  getRevenueByMonthService,
  getRevenueByBranchDetailService,
};

export default adminRevenueService;
