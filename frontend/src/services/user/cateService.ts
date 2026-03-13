import type {
  CategoriesGroupedResponse,
  OtherCategoriesResponse,
  OtherCatesParamsRequest,
} from "../../types/cate";
import instance from "../../utils/axiosCustomize";

const getCategoriesGroupedByMenuGroupService = () =>
  instance.get<CategoriesGroupedResponse>("/user/categories/grouped");

const getOtherCategoriesInSameGroupService = (
  data: OtherCatesParamsRequest,
) => {
  const { cateId } = data;
  return instance.get<OtherCategoriesResponse>(
    `/user/categories/${cateId}/siblings`,
  );
};

const cateService = {
  getCategoriesGroupedByMenuGroupService,
  getOtherCategoriesInSameGroupService,
};

export default cateService;
