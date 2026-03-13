import type { CategoriesGroupedResponse } from "../../types/cate";
import instance from "../../utils/axiosCustomize";

const getCategoriesGroupedByMenuGroupService = () =>
  instance.get<CategoriesGroupedResponse>("/user/categories/grouped");

const cateService = {
  getCategoriesGroupedByMenuGroupService,
};

export default cateService;
