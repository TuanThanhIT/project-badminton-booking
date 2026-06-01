import instance from "../../utils/axiosCustomize";
import type {
  ManagerRevenueQueries,
  ManagerRevenueResponse,
} from "../../types/revenue";

///MANAGER
const getRevenueService = (params: ManagerRevenueQueries) =>
  instance.get<ManagerRevenueResponse>("/manager/revenues", { params });

///MANAGER
const managerRevenueService = {
  getRevenueService,
};

export default managerRevenueService;
