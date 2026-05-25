import instance from "../../utils/axiosCustomize";

const getBeveragesService = (params: { page?: number; limit?: number; search?: string }) =>
  instance.get("/admin/beverages", { params });

const createBeverageService = (data: {
  beverageName: string;
  thumbnailUrl?: string;
  price: number;
}) => instance.post("/admin/beverages", data);

const updateBeverageService = (beverageId: number, data: {
  beverageName?: string;
  thumbnailUrl?: string;
  price?: number;
}) => instance.put(`/admin/beverages/${beverageId}`, data);

const deleteBeverageService = (beverageId: number) =>
  instance.delete(`/admin/beverages/${beverageId}`);

// Dùng cho Manager quản lý tồn kho từng chi nhánh
const getBeverageStocksService = (beverageId: number) =>
  instance.get(`/admin/beverages/${beverageId}/stocks`);

const adminBeverageService = {
  getBeveragesService,
  createBeverageService,
  updateBeverageService,
  deleteBeverageService,
  getBeverageStocksService,
};

export default adminBeverageService;
