import type {
  CategoriesGroupedResponse,
  CategoriesByGroupRequest,
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

const getCategoriesByGroupService = (data: CategoriesByGroupRequest) => {
  const { groupName } = data;
  return instance.get<OtherCategoriesResponse>(
    `/user/categories/group/${encodeURIComponent(groupName)}`,
  );
};

const cateService = {
  getCategoriesByGroupService,
  getCategoriesGroupedByMenuGroupService,
  getOtherCategoriesInSameGroupService,
};

export default cateService;
