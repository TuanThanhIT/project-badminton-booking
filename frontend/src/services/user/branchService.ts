import type { BranchQueryRequest } from "../../types/branch";
import instance from "../../utils/axiosCustomize";

const getAllBranchService = (data: BranchQueryRequest) => {
  const { keyword } = data;
  return instance.get("/user/branches", { params: keyword });
};

const branchService = {
  getAllBranchService,
};

export default branchService;
