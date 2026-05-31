import instance from "../../utils/axiosCustomize";

export interface AdminBranchesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}

export interface CreateBranchData {
  branchName: string;
  phoneNumber: string;
  description: string;
  address: string;
  districtName: string;
  provinceName: string;
  wardName?: string;
  provinceId: number;
  districtId: number;
  wardCode?: string;
  latitude: number;
  longitude: number;
  ghnShopId?: number;
}

export type UpdateBranchData = Partial<CreateBranchData>;

const getAdminBranchesService = (params: AdminBranchesParams) =>
  instance.get("/admin/branches", { params });

const getAdminBranchDetailService = (branchId: number) =>
  instance.get(`/admin/branches/${branchId}`);

const createBranchService = (data: CreateBranchData) =>
  instance.post("/admin/branches", data);

const updateBranchService = (branchId: number, data: UpdateBranchData) =>
  instance.put(`/admin/branches/${branchId}`, data);

const toggleBranchActiveService = (branchId: number) =>
  instance.put(`/admin/branches/${branchId}/toggle-active`);

const addBranchImageService = (branchId: number, data: { imageUrl: string }) =>
  instance.post(`/admin/branches/${branchId}/images`, data);

const deleteBranchImageService = (branchId: number, imageId: number) =>
  instance.delete(`/admin/branches/${branchId}/images/${imageId}`);

const adminBranchService = {
  getAdminBranchesService,
  getAdminBranchDetailService,
  createBranchService,
  updateBranchService,
  toggleBranchActiveService,
  addBranchImageService,
  deleteBranchImageService,
};

export default adminBranchService;
