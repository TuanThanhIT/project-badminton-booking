import instance from "../../utils/axiosCustomize";

const getAllBranchService = () => {
  return instance.get("/user/branches");
};

const branchService = {
  getAllBranchService,
};

export default branchService;
