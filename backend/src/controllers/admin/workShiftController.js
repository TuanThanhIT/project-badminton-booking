import workShiftService from "../../services/admin/workShiftService.js";

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

const workShiftController = {
  createWorkShift,
};
export default workShiftController;
