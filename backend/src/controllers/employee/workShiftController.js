import workShiftService from "../../services/employee/workShiftService.js";

const getWorkShiftByDate = async (req, res, next) => {
  try {
    const workDate = req.params.date;
    const workShifts = await workShiftService.getWorkShiftByDateService(
      workDate
    );
    return res.status(200).json(workShifts);
  } catch (error) {
    next(error);
  }
};

const updateWorkShiftEmployeeAndCashRegister = async (req, res, next) => {
  try {
    const workShiftId = req.params.id;
    const { openCash, checkInTime } = req.body;

    await workShiftService.updateWorkShiftEmployeeAndCashRegisterService(
      workShiftId,
      checkInTime,
      openCash
    );
    return res
      .status(200)
      .json({ message: "Cập nhật thông tin ca làm thành công!" });
  } catch (error) {
    next(error);
  }
};

const workShiftController = {
  getWorkShiftByDate,
  updateWorkShiftEmployeeAndCashRegister,
};
export default workShiftController;
