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
    .json(new SuccessResponse("Get manager work shifts successfully", result));
});

const createWorkShift = asyncHandler(async (req, res) => {
  const result = await workShiftService.createManagerWorkShiftService(
    req.user.id,
    req.body,
  );

  return res
    .status(201)
    .json(new SuccessResponse("Create manager work shift successfully", result));
});

const assignEmployeeToShift = asyncHandler(async (req, res) => {
  const result = await workShiftService.assignEmployeeToShiftService(
    req.user.id,
    req.body,
  );

  return res
    .status(201)
    .json(new SuccessResponse("Assign employee to shift successfully", result));
});

const updateShiftAssignment = asyncHandler(async (req, res) => {
  const result = await workShiftService.updateShiftAssignmentService(
    req.user.id,
    req.params.assignmentId,
    req.body,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Update shift assignment successfully", result));
});

const removeShiftAssignment = asyncHandler(async (req, res) => {
  const result = await workShiftService.removeShiftAssignmentService(
    req.user.id,
    req.params.assignmentId,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Remove shift assignment successfully", result));
});

export default {
  getWorkShifts,
  createWorkShift,
  assignEmployeeToShift,
  updateShiftAssignment,
  removeShiftAssignment,
};
