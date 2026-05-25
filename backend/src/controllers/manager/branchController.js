import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

import branchService from "../../services/manager/branchService.js";

const getMyBranchController = asyncHandler(async (req, res) => {
  const managerId = req.user.id;

  const branch = await branchService.getMyBranchService(managerId);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy thông tin chi nhánh thành công", branch));
});

const branchController = {
  getMyBranchController,
};

export default branchController;
