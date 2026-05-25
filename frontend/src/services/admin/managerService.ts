import instance from "../../utils/axiosCustomize";

const getAllManagersService = (params?: { search?: string }) =>
  instance.get("/admin/managers", { params });

const getBranchManagersService = (branchId: number) =>
  instance.get(`/admin/managers/branches/${branchId}`);

const getBranchManagerHistoryService = (branchId: number) =>
  instance.get(`/admin/managers/branches/${branchId}/history`);

const assignManagerService = (branchId: number, data: { managerId: number; note?: string }) =>
  instance.post(`/admin/managers/branches/${branchId}/assign`, data);

const revokeManagerService = (branchManagerId: number, data?: { note?: string }) =>
  instance.put(`/admin/managers/revoke/${branchManagerId}`, data);

const changeUserRoleService = (userId: number, data: { newRole: string }) =>
  instance.put(`/admin/managers/users/${userId}/change-role`, data);

const adminManagerService = {
  getAllManagersService,
  getBranchManagersService,
  getBranchManagerHistoryService,
  assignManagerService,
  revokeManagerService,
  changeUserRoleService,
};

export default adminManagerService;
