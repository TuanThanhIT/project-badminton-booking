import {
  type AccountResponse,
  type LoginRequest,
  type LoginResponse,
} from "../../types/auth";
import instance from "../../utils/axiosCustomize";

const loginEmployeeService = (data: LoginRequest) =>
  instance.post<LoginResponse>("/employee/auth/login", data);

const getEmployeeAccountService = () =>
  instance.get<AccountResponse>("/employee/auth/account");

const authService = {
  loginEmployeeService,
  getEmployeeAccountService,
};

export default authService;
