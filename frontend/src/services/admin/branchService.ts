import instance from "../../utils/axiosCustomize";

export interface AdminBranchesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  status?: string;
  districtName?: string;
  provinceName?: string;
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

const getAdminBranchOptionsService = () =>
  instance.get("/admin/branches/options");

const getAdminBranchDetailService = (branchId: number) =>
  instance.get(`/admin/branches/${branchId}`);

const getAdminBranchOverviewService = (branchId: number) =>
  instance.get(`/admin/branches/${branchId}/overview`);

const getAdminBranchCourtsService = (branchId: number, params?: Record<string, unknown>) =>
  instance.get(`/admin/branches/${branchId}/courts`, { params });

const getAdminBranchEmployeesService = (branchId: number, params?: Record<string, unknown>) =>
  instance.get(`/admin/branches/${branchId}/employees`, { params });

const getAdminBranchBookingsService = (branchId: number, params?: Record<string, unknown>) =>
  instance.get(`/admin/branches/${branchId}/bookings`, { params });

const getAdminBranchOrdersService = (branchId: number, params?: Record<string, unknown>) =>
  instance.get(`/admin/branches/${branchId}/orders`, { params });

const getAdminBranchInventoryService = (branchId: number, params?: Record<string, unknown>) =>
  instance.get(`/admin/branches/${branchId}/inventory`, { params });

const getAdminBranchPurchaseReceiptsService = (branchId: number, params?: Record<string, unknown>) =>
  instance.get(`/admin/branches/${branchId}/purchase-receipts`, { params });

const getAdminBranchStockHistoryService = (branchId: number, params?: Record<string, unknown>) =>
  instance.get(`/admin/branches/${branchId}/stock-history`, { params });

const getAdminBranchRevenueService = (branchId: number, params?: Record<string, unknown>) =>
  instance.get(`/admin/branches/${branchId}/revenue`, { params });

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
  getAdminBranchOptionsService,
  getAdminBranchDetailService,
  getAdminBranchOverviewService,
  getAdminBranchCourtsService,
  getAdminBranchEmployeesService,
  getAdminBranchBookingsService,
  getAdminBranchOrdersService,
  getAdminBranchInventoryService,
  getAdminBranchPurchaseReceiptsService,
  getAdminBranchStockHistoryService,
  getAdminBranchRevenueService,
  createBranchService,
  updateBranchService,
  toggleBranchActiveService,
  addBranchImageService,
  deleteBranchImageService,
};

export default adminBranchService;
