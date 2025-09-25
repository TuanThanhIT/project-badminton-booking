import type { CategoryResponse } from "../types/category";
import instance from "../utils/axiosCustomize";

const getCategoryService = () =>
  instance.get<CategoryResponse[]>("/admin/category/list");

const categoryService = {
  getCategoryService,
};
export default categoryService;
