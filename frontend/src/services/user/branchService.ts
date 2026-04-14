import type {
  BranchDetailRequest,
  BranchDetailResponse,
  BranchesRequest,
  BranchListItemResponse,
  BranchListResponse,
  BranchOptionsListResponse,
} from "../../types/branch";
import instance from "../../utils/axiosCustomize";

const getPagedBranchesService = (data: BranchesRequest) =>
  instance.get<BranchListResponse>("/user/branches", { params: data });

const getBranchDetailService = (data: BranchDetailRequest) =>
  instance.get<BranchDetailResponse>(`/user/branches/${data.branchId}`);

const getBranchOptionsService = () => {
  return instance.get<BranchOptionsListResponse>("/user/branches/options");
};

const getAllBranchesService = () => {
  return instance.get<BranchListItemResponse>("/user/branches/all");
};

const branchService = {
  getBranchDetailService,
  getPagedBranchesService,
  getBranchOptionsService,
  getAllBranchesService,
};
export default branchService;
