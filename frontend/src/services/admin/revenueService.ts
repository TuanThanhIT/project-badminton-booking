import type {
  RevenueBeverageResponse,
  RevenueDateResponse,
  RevenueOverviewResponse,
  RevenueProductResponse,
  RevenueRequest,
  RevenueTransactionResponse,
} from "../../types/revenue";
import instance from "../../utils/axiosCustomize";

const getRevenueOverviewService = (data: RevenueRequest) => {
  return instance.get<RevenueOverviewResponse>("/admin/revenue/overview", {
    params: data,
  });
};

const getRevenueDateService = (data: RevenueRequest) => {
  return instance.get<RevenueDateResponse>("/admin/revenue/date", {
    params: data,
  });
};

const getRevenueTransactionService = (data: RevenueRequest) => {
  return instance.get<RevenueTransactionResponse>("/admin/revenue/list", {
    params: data,
  });
};

const getRevenueProductService = (data: RevenueRequest) => {
  return instance.get<RevenueProductResponse>("/admin/revenue/product", {
    params: data,
  });
};

const getRevenueBeverageService = (data: RevenueRequest) => {
  return instance.get<RevenueBeverageResponse>("/admin/revenue/beverage", {
    params: data,
  });
};

const revenueService = {
  getRevenueOverviewService,
  getRevenueDateService,
  getRevenueTransactionService,
  getRevenueProductService,
  getRevenueBeverageService,
};
export default revenueService;
