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

const updateCheckInAndCashRegister = async (req, res, next) => {
  try {
    const workShiftId = req.params.id;
    const { openCash, checkInTime } = req.body;

    await workShiftService.updateCheckInAndCashRegisterService(
      workShiftId,
      checkInTime,
      openCash
    );
    return res
      .status(200)
      .json({ message: "Check-in thông tin ca làm thành công!" });
  } catch (error) {
    next(error);
  }
};

const updateCheckOutAndCashRegister = async (req, res, next) => {
  try {
    const workShiftId = req.params.id;
    const { closeCash, checkOutTime } = req.body;

    await workShiftService.updateCheckoutAndCashRegisterService(
      workShiftId,
      checkOutTime,
      closeCash
    );
    return res.status(200).json({
      message:
        "Bạn đã check-out thành công. Vui lòng Log-out để hoàn thành ca làm! ",
    });
  } catch (error) {
    next(error);
  }
};

const workShiftController = {
  getWorkShiftByDate,
  updateCheckInAndCashRegister,
  updateCheckOutAndCashRegister,
};
export default workShiftController;
