import {
  type CategoryOtherResponse,
  type CategoryResponse,
} from "../types/category";
import instance from "../utils/axiosCustomize";

const getCategoriesService = () =>
  instance.get<CategoryResponse[]>("/user/category/list");

const getOtherCategoriesService = (cateId: number) =>
  instance.get<CategoryOtherResponse[]>(`/user/category/list/other/${cateId}`);

const getCatesService = (groupName: string) =>
  instance.get<CategoryOtherResponse[]>(`/user/category/list/${groupName}`);

const getAllGroupName = () =>
  instance.get<string[]>(`/user/category/group/list`);

const categoryService = {
  getCategoriesService,
  getOtherCategoriesService,
  getCatesService,
  getAllGroupName,
};
export default categoryService;
