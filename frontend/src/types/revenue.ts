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
  salaryCost: number;
  inventoryCost: number;
  totalCost: number;
  profit: number;
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
  salaryCost: number;
  inventoryCost: number;
  totalCost: number;
  profit: number;
};

export type ManagerRevenueMonthlyChartItem = {
  month: string;
  label: string;
  courtRevenue: number;
  productRevenue: number;
  beverageRevenue: number;
  totalRevenue: number;
  salaryCost: number;
  inventoryCost: number;
  totalCost: number;
  profit: number;
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
  monthlyEstimate: {
    month: number;
    year: number;
    basedOnDays: number;
    daysInMonth: number;
    estimatedRevenue: number;
    estimatedProfit: number;
    averageDailyRevenue: number;
    averageDailyProfit: number;
  };
  chart: ManagerRevenueChartItem[];
  monthlyChart: ManagerRevenueMonthlyChartItem[];
  breakdown: ManagerRevenueBreakdownItem[];
};

///MANAGER
export type ManagerRevenueResponse = ApiResponse<ManagerRevenueData>;
