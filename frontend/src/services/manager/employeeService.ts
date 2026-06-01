import instance from "../../utils/axiosCustomize";

import type {
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  ManagerEmployeesResponse,
} from "../../types/employee";

const getEmployeesService = () =>
  instance.get<ManagerEmployeesResponse>("/manager/employees");

const createEmployeeService = (data: CreateEmployeeRequest) =>
  instance.post<CreateEmployeeResponse>("/manager/employees", data);

const managerEmployeeService = {
  getEmployeesService,
  createEmployeeService,
};

export default managerEmployeeService;
