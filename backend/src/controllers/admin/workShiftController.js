import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import workShiftService from "../../services/admin/workShiftService.js";

const createWorkShift = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const workShift = await workShiftService.createWorkShiftService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Tạo ca làm thành công", workShift));
});

const createWorkShifts = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result = await workShiftService.createWorkShiftsService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse("Tạo tất cả ca làm trong ngày thành công", result),
    );
});

const getAllWorkShifts = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result = await workShiftService.getAllWorkShiftsService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Lấy danh sách ca làm việc thành công", result));
});

const workShiftController = {
  createWorkShift,
  createWorkShifts,
  getAllWorkShifts,
};
export default workShiftController;
