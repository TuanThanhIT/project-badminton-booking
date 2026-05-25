import {
  Branch,
  BranchManager,
  Court,
  CourtPrice,
} from "../../models/index.js";

import NotFoundError from "../../errors/NotFoundError.js";

const getMyBranchService = async (managerId) => {
  // tìm manager thuộc branch nào
  const branchManager = await BranchManager.findOne({
    where: {
      managerId,
    },
  });

  if (!branchManager) {
    throw new NotFoundError("Manager chưa được gán chi nhánh");
  }

  const branch = await Branch.findOne({
    where: {
      id: branchManager.branchId,
    },

    include: [
      {
        model: Court,
        as: "courts",
      },
      {
        model: CourtPrice,
        as: "courtPrices",
      },
    ],
  });

  if (!branch) {
    throw new NotFoundError("Không tìm thấy chi nhánh");
  }

  return branch;
};

const branchService = {
  getMyBranchService,
};

export default branchService;
