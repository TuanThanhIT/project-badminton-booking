import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import branchService from "../../services/user/branchService.js";

const getBranchOptionsController = asyncHandler(async (req, res) => {
  const branches = await branchService.getBranchOptionsService();
  return res
    .status(200)
    .json(new SuccessResponse("Lấy tất cả chi nhánh thành công", branches));
});

const getPagedBranchesController = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const branches = await branchService.getPagedBranchesService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách chi nhánh thành công", branches));
});

const getBranchDetailController = asyncHandler(async (req, res) => {
  const data = { branchId: req.params.branchId };
  const branchDetail = await branchService.getBranchDetailService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy chi tiết chi nhánh thành công", branchDetail),
    );
});

const getAllBranchesController = asyncHandler(async (req, res) => {
  const branches = await branchService.getAllBranchesService();
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách chi nhánh thành công", branches));
});

const branchController = {
  getAllBranchesController,
  getBranchDetailController,
  getBranchOptionsController,
  getPagedBranchesController,
};

export default branchController;
