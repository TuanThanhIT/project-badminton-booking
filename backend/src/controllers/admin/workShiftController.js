import workShiftService from "../../services/admin/workShiftService.js";
import { StatusCodes } from "http-status-codes";
const createWorkShift = async (req, res, next) => {
  try {
    const { name, workDate, startTime, endTime, shiftWage } = req.body;
    const workShift = await workShiftService.createWorkShiftService(
      name,
      workDate,
      startTime,
      endTime,
      shiftWage
    );
    return res.status(201).json(workShift);
  } catch (error) {
    next(error);
  }
};
const createWorkShifts = async (req, res, next) => {
  try {
    const { workDate, shiftWage } = req.body;

    const result = await workShiftService.createWorkShiftsService(
      workDate,
      shiftWage
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Tạo ca làm việc thành công!",
      workShifts: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/workshift
 */
const getAllWorkShifts = async (req, res, next) => {
  try {
    const { page, limit, workDate } = req.query;

    const result = await workShiftService.getAllWorkShiftsService({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      workDate,
    });

    return res.status(StatusCodes.OK).json({
      message: "Lấy danh sách ca làm việc thành công!",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const workShiftController = {
  createWorkShift,
  createWorkShifts,
  getAllWorkShifts,
};
export default workShiftController;
