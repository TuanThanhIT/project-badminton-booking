import type {
  CategoryListResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryItem,
  SimpleCategoryListResponse,
} from "../../types/category";
import instance from "../../utils/axiosCustomize";

// Tạo category mới
const createCategoryService = (data: CreateCategoryRequest) => {
  return instance.post<CategoryItem>("/admin/category/add", data);
};

// Lấy danh sách category (có pagination và search)
const getCategoriesService = (
  page: number = 1,
  limit: number = 10,
  search: string = ""
) => {
  return instance.get<CategoryListResponse>("/admin/category", {
    params: { page, limit, search },
  });
};

// Cập nhật category
const updateCategoryService = (id: number, data: UpdateCategoryRequest) => {
  return instance.put<CategoryItem>(`/admin/category/update/${id}`, data);
};

const getSimpleCategoriesService = () => {
  return instance.get<SimpleCategoryListResponse>("/admin/category/list");
};

const categoryService = {
  createCategoryService,
  getCategoriesService,
  updateCategoryService,
  getSimpleCategoriesService,
};

export default categoryService;
