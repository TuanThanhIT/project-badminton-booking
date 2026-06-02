import { BranchManager } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";

export const getManagerBranchId = async (managerId) => {
  const branchManager = await BranchManager.findOne({
    attributes: ["branchId"],
    where: { managerId, isActive: true },
    raw: true,
  });

  if (!branchManager) {
    throw new NotFoundError("Manager has no active branch");
  }

  return branchManager.branchId;
};
