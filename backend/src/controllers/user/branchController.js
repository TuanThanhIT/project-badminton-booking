import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import branchService from "../../services/user/branchService.js";

const getAllBranchController = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const branches = await branchService.getAllBranchService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy tất cả chi nhánh thành công", branches));
});

const branchController = {
  getAllBranchController,
};

export default branchController;
