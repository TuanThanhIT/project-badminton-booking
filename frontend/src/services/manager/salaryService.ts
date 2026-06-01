import instance from "../../utils/axiosCustomize";
import type {
  ManagerMonthlySalaryResponse,
  ManagerSalaryQueries,
} from "../../types/salary";

///MANAGER
const getMonthlySalaryService = (params: ManagerSalaryQueries) =>
  instance.get<ManagerMonthlySalaryResponse>("/manager/salaries", { params });

///MANAGER
const managerSalaryService = {
  getMonthlySalaryService,
};

export default managerSalaryService;
