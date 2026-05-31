import type { ApiResponse } from "./api";

///MANAGER
export type ManagerRevenueQueries = {
  startDate?: string;
  endDate?: string;
};

///MANAGER
export type ManagerRevenueOverview = {
  totalRevenue: number;
  courtRevenue: number;
  productRevenue: number;
  beverageRevenue: number;
  bookingCount: number;
  orderCount: number;
};

///MANAGER
export type ManagerRevenueChartItem = {
  date: string;
  label: string;
  courtRevenue: number;
  productRevenue: number;
  beverageRevenue: number;
  totalRevenue: number;
};

///MANAGER
export type ManagerRevenueBreakdownItem = {
  type: "COURT" | "PRODUCT" | "BEVERAGE";
  label: string;
  revenue: number;
};

///MANAGER
export type ManagerRevenueData = {
  branchId: number;
  startDate: string;
  endDate: string;
  overview: ManagerRevenueOverview;
  chart: ManagerRevenueChartItem[];
  breakdown: ManagerRevenueBreakdownItem[];
};

///MANAGER
export type ManagerRevenueResponse = ApiResponse<ManagerRevenueData>;
