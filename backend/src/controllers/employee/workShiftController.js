import workShiftService from "../../services/employee/workShiftService.js";

const getWorkShiftByDate = async (req, res, next) => {
  try {
    const workDate = req.query.date;
    const workShifts = await workShiftService.getWorkShiftByDateService(
      req.user.id,
      workDate,
    );

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách ca làm thành công!",
      data: workShifts,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentWorkShift = async (req, res, next) => {
  try {
    const { date, time } = req.query;
    const workShift = await workShiftService.getCurrentWorkShiftService(
      req.user.id,
      date,
      time,
    );

    return res.status(200).json({
      success: true,
      message: workShift
        ? "Lấy ca làm hiện tại thành công!"
        : "Không có ca làm hiện tại.",
      data: workShift,
    });
  } catch (error) {
    next(error);
  }
};

const updateCheckInAndCashRegister = async (req, res, next) => {
  try {
    const result = await workShiftService.updateCheckInAndCashRegisterService({
      employeeId: req.user.id,
      workShiftId: req.params.workShiftId,
      checkInTime: req.body.checkInTime,
      openingCash: req.body.openingCash,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const updateCheckOutAndCashRegister = async (req, res, next) => {
  try {
    const result = await workShiftService.updateCheckoutAndCashRegisterService({
      employeeId: req.user.id,
      workShiftId: req.params.workShiftId,
      checkOutTime: req.body.checkOutTime,
      closingCash: req.body.closingCash,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getShiftAssignments = async (req, res, next) => {
  try {
    const result = await workShiftService.getShiftAssignmentsService({
      employeeId: req.user.id,
      workShiftId: req.params.workShiftId,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách nhân viên trong ca thành công!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateShiftAssignmentTime = async (req, res, next) => {
  try {
    const result = await workShiftService.updateShiftAssignmentTimeService({
      employeeId: req.user.id,
      workShiftId: req.params.workShiftId,
      assignmentId: req.params.assignmentId,
      checkInTime: req.body.checkInTime,
      checkOutTime: req.body.checkOutTime,
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật giờ làm nhân viên thành công!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const workShiftController = {
  getWorkShiftByDate,
  getCurrentWorkShift,
  updateCheckInAndCashRegister,
  updateCheckOutAndCashRegister,
  getShiftAssignments,
  updateShiftAssignmentTime,
};

export default workShiftController;
