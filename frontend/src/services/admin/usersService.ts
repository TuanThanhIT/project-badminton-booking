import instance from "../../utils/axiosCustomize";
import type { CreateUserRequest, UserItem } from "../../types/user";
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

// ================================
// 2. KHÓA USER
// PUT /admin/users/lock/:userId
// ================================
const lockUserService = (userId: number) => {
  return instance.put(`/admin/users/lock/${userId}`);
};

// ================================
// 3. MỞ KHÓA USER
// PUT /admin/users/unlock/:userId
// ================================
const unlockUserService = (userId: number) => {
  return instance.put(`/admin/users/unlock/${userId}`);
};

// ================================
// 4. LẤY TẤT CẢ USER
// GET /admin/users/
// ================================
const getAllUsersService = () => {
  return instance.get<{ message: string; users: UserItem[] }>("/admin/users/");
};

// ================================
// 5. LẤY USER THEO ROLE
// GET /admin/users/role/:roleId
// ================================
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

// ================================
// EXPORT
// ================================
const usersService = {
  createUserService,
  lockUserService,
  unlockUserService,
  getAllUsersService,
  getUsersByRoleService,
  toggleLock,
};

export default usersService;
