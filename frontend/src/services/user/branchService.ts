import type {
  BranchListResponse,
  BranchDetailResponse,
  BranchesRequest,
  BranchDetailRequest,
} from "../../types/branch";
import instance from "../../utils/axiosCustomize";

const getBranchesService = (data: BranchesRequest) =>
  instance.get<BranchListResponse>("/branches", { params: data });

const getBranchByIdService = (data: BranchDetailRequest) =>
  instance.get<BranchDetailResponse>(`/branches/${data.branchId}`);
const branchService = {
  getBranchesService,
  getBranchByIdService,
};
export default branchService;
