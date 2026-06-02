import instance from "../../utils/axiosCustomize";
import type {
  ManagerRevenueQueries,
  ManagerRevenueResponse,
} from "../../types/revenue";

///MANAGER
const getRevenueService = (params: ManagerRevenueQueries) =>
  instance.get<ManagerRevenueResponse>("/manager/revenues", { params });

const getDashboardService = (params?: { range?: string }) =>
  instance.get("/manager/revenues/dashboard", { params });

const getRevenueReportService = (params: ManagerRevenueQueries) =>
  instance.get("/manager/revenues/report", { params });

///MANAGER
const managerRevenueService = {
  getRevenueService,
  getDashboardService,
  getRevenueReportService,
};

export default managerRevenueService;
