import { Op } from "sequelize";
import { Branch } from "../../models/index.js";

const getAllBranchService = async (data) => {
  const { keyword } = data;
  const branches = await Branch.findAll({
    attributes: ["id", "branchName"],
    where: {
      ...(keyword && { branchName: { [Op.like]: `%${keyword}%` } }),
    },
  });
  return branches;
};

const branchService = {
  getAllBranchService,
};

export default branchService;
