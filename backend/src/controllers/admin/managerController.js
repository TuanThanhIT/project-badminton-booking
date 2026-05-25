import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import managerService from "../../services/admin/managerService.js";

const getAllManagersController = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result = await managerService.getAllManagersService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách manager thành công", result));
});

const getBranchManagersController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const result = await managerService.getBranchManagersService(branchId);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách manager chi nhánh thành công", result));
});

const getBranchManagerHistoryController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const result = await managerService.getBranchManagerHistoryService(branchId);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy lịch sử manager chi nhánh thành công", result));
});

const assignManagerController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const data = { branchId: Number(branchId), ...req.body };
  const result = await managerService.assignManagerToBranchService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Gán manager cho chi nhánh thành công", result));
});

const revokeManagerController = asyncHandler(async (req, res) => {
  const { branchManagerId } = req.params;
  const data = { branchManagerId: Number(branchManagerId), ...req.body };
  const result = await managerService.revokeBranchManagerService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Thu hồi quyền manager thành công", result));
});

const changeUserRoleController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const data = { userId: Number(userId), ...req.body };
  const result = await managerService.changeUserRoleService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Thay đổi role người dùng thành công", result));
});

const adminManagerController = {
  getAllManagersController,
  getBranchManagersController,
  getBranchManagerHistoryController,
  assignManagerController,
  revokeManagerController,
  changeUserRoleController,
};

export default adminManagerController;
