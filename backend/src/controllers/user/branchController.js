import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import branchService from "../../services/user/branchService.js";

const getBranchesController = asyncHandler(async (req, res) => {
  const data = { ...req.query };

  const result = await branchService.getBranchesService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách chi nhánh thành công", result));
});
const getBranchByIdController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;

  const result = await branchService.getBranchByIdService(branchId);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy chi nhánh thành công", result));
});
const branchController = {
  getBranchesController,
  getBranchByIdController,
};

export default branchController;
