import instance from "../../utils/axiosCustomize";

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  branchId?: number | string;
  revenueType?: "ALL" | "BOOKING" | "PRODUCT" | "BEVERAGE";
  itemType?: "ALL" | "PRODUCT_VARIANT" | "BEVERAGE";
  groupBy?: "day" | "week" | "month" | "branch" | "item";
  range?: "today" | "7days" | "30days" | "month";
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

const getRevenueProductsService = (params: DateRangeParams) =>
  instance.get("/admin/revenue/products", { params });

const getRevenueBeveragesService = (params: DateRangeParams) =>
  instance.get("/admin/revenue/beverages", { params });

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
  getRevenueProductsService,
  getRevenueBeveragesService,
};

export default adminRevenueService;
