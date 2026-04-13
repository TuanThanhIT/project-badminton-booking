import type {
  BranchListResponse,
  BranchDetailResponse,
  BranchesRequest,
  BranchDetailRequest,
  BranchSimpleListResponse,
} from "../../types/branch";
import instance from "../../utils/axiosCustomize";

const getBranchesService = (data: BranchesRequest) =>
  instance.get<BranchListResponse>("/branches", { params: data });

const getBranchByIdService = (data: BranchDetailRequest) =>
  instance.get<BranchDetailResponse>(`/branches/${data.branchId}`);

const getAllBranchesService = () =>
  instance.get<BranchSimpleListResponse>("/branches/all");

const branchService = {
  getBranchesService,
  getBranchByIdService,
  getAllBranchesService,
};
export default branchService;
