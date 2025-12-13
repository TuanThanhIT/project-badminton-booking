import {
  type AccountResponse,
  type LoginRequest,
  type LoginResponse,
} from "../../types/auth";
import instance from "../../utils/axiosCustomize";

const loginAdminService = (data: LoginRequest) =>
  instance.post<LoginResponse>("/admin/auth/login", data);

const getAdminAccountService = () =>
  instance.get<AccountResponse>("/admin/auth/account");

const authService = {
  loginAdminService,
  getAdminAccountService,
};

export default authService;
