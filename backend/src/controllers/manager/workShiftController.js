import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import workShiftService from "../../services/manager/workShiftService.js";

const getWorkShifts = asyncHandler(async (req, res) => {
  const result = await workShiftService.getManagerWorkShiftsService(
    req.user.id,
    req.query,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách ca làm của quản lý thành công", result));
});

const createWorkShift = asyncHandler(async (req, res) => {
  const result = await workShiftService.createManagerWorkShiftService(
    req.user.id,
    req.body,
  );

  return res
    .status(201)
    .json(new SuccessResponse("Tạo ca làm của quản lý thành công", result));
});

const assignEmployeeToShift = asyncHandler(async (req, res) => {
  const result = await workShiftService.assignEmployeeToShiftService(
    req.user.id,
    req.body,
  );

  return res
    .status(201)
    .json(new SuccessResponse("Gán nhân viên vào ca thành công", result));
});

const updateShiftAssignment = asyncHandler(async (req, res) => {
  const result = await workShiftService.updateShiftAssignmentService(
    req.user.id,
    req.params.assignmentId,
    req.body,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật phân công ca thành công", result));
});

const removeShiftAssignment = asyncHandler(async (req, res) => {
  const result = await workShiftService.removeShiftAssignmentService(
    req.user.id,
    req.params.assignmentId,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Xóa phân công ca thành công", result));
});

export default {
  getWorkShifts,
  createWorkShift,
  assignEmployeeToShift,
  updateShiftAssignment,
  removeShiftAssignment,
};
