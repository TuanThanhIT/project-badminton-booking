import type {
  BranchListResponse,
  BranchDetailResponse,
  BranchesRequest,
  BranchDetailRequest,
  BranchSimpleListResponse,
  BranchResponse,
} from "../../types/branch";
import instance from "../../utils/axiosCustomize";

const getBranchesService = (data: BranchesRequest) =>
  instance.get<BranchListResponse>("/user/branches", { params: data });

const getBranchByIdService = (data: BranchDetailRequest) =>
  instance.get<BranchDetailResponse>(`/user/branches/${data.branchId}`);

const getAllBranchesService = () =>
  instance.get<BranchSimpleListResponse>("/user/branches/simple");

const getAllBranchService = () => {
  return instance.get<BranchResponse>("/user/branches/all");
};
const branchService = {
  getBranchesService,
  getBranchByIdService,
  getAllBranchesService,
  getAllBranchService,
};
export default branchService;
