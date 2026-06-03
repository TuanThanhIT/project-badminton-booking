import instance from "../../utils/axiosCustomize";

const getCategoriesService = (params?: {
  page?: number; limit?: number; search?: string; menuGroup?: string;
}) => instance.get("/admin/categories", { params });

const createCategoryService = (data: { cateName: string; menuGroup: string }) =>
  instance.post("/admin/categories", data);

const updateCategoryService = (id: number, data: { cateName?: string; menuGroup?: string }) =>
  instance.put(`/admin/categories/${id}`, data);

const deleteCategoryService = (id: number) =>
  instance.delete(`/admin/categories/${id}`);

const adminCategoryService = {
  getCategoriesService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
};

export default adminCategoryService;
