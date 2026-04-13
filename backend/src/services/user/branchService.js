import { Branch } from "../../models/index.js";

const getAllBranchService = async () => {
  const branches = await Branch.findAll({
    attributes: ["id", "branchName", "address", "district", "city"],
  });
  return branches;
};

const branchService = {
  getAllBranchService,
};

export default branchService;
