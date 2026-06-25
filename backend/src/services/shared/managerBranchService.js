import { BranchManager } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";

export const getManagerBranchId = async (managerId) => {
  const branchManager = await BranchManager.findOne({
    attributes: ["branchId"],
    where: { managerId, isActive: true },
    raw: true,
  });

  if (!branchManager) {
    throw new NotFoundError("Quản lý chưa được gán chi nhánh đang hoạt động");
  }

  return branchManager.branchId;
};
