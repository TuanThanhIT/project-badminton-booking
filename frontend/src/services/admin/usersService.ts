import instance from "../../utils/axiosCustomize";

import type {
  CreateUserRequest,
  UserItem,
  GetEmployeesResponse,
} from "../../types/user";
// ================================
// 1. TẠO USER
// POST /admin/users/createUsers
// ================================

const createUserService = (data: CreateUserRequest) => {
  return instance.post<{ message: string; data: UserItem }>(
    "/admin/users/createUsers",
    data
  );
};

const lockUserService = (userId: number) => {
  return instance.put(`/admin/users/lock/${userId}`);
};

const unlockUserService = (userId: number) => {
  return instance.put(`/admin/users/unlock/${userId}`);
};

const getAllUsersService = () => {
  return instance.get<{ message: string; users: UserItem[] }>("/admin/users");
};

const getUsersByRoleService = (roleId: number) => {
  return instance.get<{ message: string; data: UserItem[] }>(
    `/admin/users/role/${roleId}`
  );
};
const toggleLock = (userId: number, isActive: boolean) => {
  if (isActive) {
    return lockUserService(userId);
  }
  return unlockUserService(userId);
};
const getEmployeesService = () => {
  return instance.get<GetEmployeesResponse>("/admin/users/employees");
};

const usersService = {
  createUserService,
  lockUserService,
  unlockUserService,
  getAllUsersService,
  getUsersByRoleService,
  toggleLock,
  getEmployeesService,
};

export default usersService;
