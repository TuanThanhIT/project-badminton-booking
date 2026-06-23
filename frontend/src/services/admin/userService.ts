import instance from "../../utils/axiosCustomize";

export interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: string;
  branchId?: number | string;
}

const getUsersService = (params: AdminUsersParams) =>
  instance.get("/admin/users", { params });

const getUserDetailService = (userId: number) =>
  instance.get(`/admin/users/${userId}`);

const toggleUserActiveService = (userId: number) =>
  instance.put(`/admin/users/${userId}/toggle-active`);

const createManagerService = (data: {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
}) => instance.post("/admin/users/create-manager", data);

const deleteUserService = (userId: number) =>
  instance.delete(`/admin/users/${userId}`);

const getUserModerationViolationsService = (
  userId: number,
  params: { page?: number; limit?: number },
) =>
  instance.get(`/admin/users/${userId}/moderation-violations`, {
    params,
  });

const adminUserService = {
  getUsersService,
  getUserDetailService,
  toggleUserActiveService,
  createManagerService,
  deleteUserService,
  getUserModerationViolationsService,
};

export default adminUserService;
