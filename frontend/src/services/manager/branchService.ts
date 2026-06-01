import instance from "../../utils/axiosCustomize";

const getMyBranchService = () => {
  return instance.get("/manager/branches/my-branch");
};

const managerBranchService = {
  getMyBranchService,
};

export default managerBranchService;
