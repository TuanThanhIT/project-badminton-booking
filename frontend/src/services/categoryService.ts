import {
  type CategoryOtherResponse,
  type CategoryResponse,
} from "../types/category";
import instance from "../utils/axiosCustomize";

// User Category Services
const getCategoriesService = () =>
  instance.get<CategoryResponse[]>("/user/category/list");

const getOtherCategoriesService = (cateId: number) =>
  instance.get<CategoryOtherResponse[]>(`/user/category/list/other/${cateId}`);

const categoryService = {
  // User services
  getCategoriesService,
  getOtherCategoriesService,
};

export default categoryService;
