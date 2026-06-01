import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import workShiftService from "../../services/employee/workShiftService.js";

const getWorkShiftByDateController = asyncHandler(async (req, res) => {
  const data = {
    employeeId: req.user.id,
    workDate: req.query.date,
  };
  const result = await workShiftService.getWorkShiftByDateService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách ca làm thành công", result));
});

const getCurrentWorkShiftController = asyncHandler(async (req, res) => {
  const data = {
    employeeId: req.user.id,
    workDate: req.query.date,
    currentTime: req.query.time,
  };
  const result = await workShiftService.getCurrentWorkShiftService(data);
  const message = result
    ? "Lấy ca làm hiện tại thành công"
    : "Không có ca làm hiện tại";

  return res.status(200).json(new SuccessResponse(message, result));
});

const updateCheckInAndCashRegisterController = asyncHandler(
  async (req, res) => {
    const data = {
      employeeId: req.user.id,
      workShiftId: req.params.workShiftId,
      checkInTime: req.body.checkInTime,
      openingCash: req.body.openingCash,
    };
    const result =
      await workShiftService.updateCheckInAndCashRegisterService(data);

    return res
      .status(200)
      .json(
        new SuccessResponse(
          "Cập nhật check-in và tiền mặt đầu ca thành công",
          result,
        ),
      );
  },
);

const updateCheckOutAndCashRegisterController = asyncHandler(
  async (req, res) => {
    const data = {
      employeeId: req.user.id,
      workShiftId: req.params.workShiftId,
      checkOutTime: req.body.checkOutTime,
      closingCash: req.body.closingCash,
    };
    const result =
      await workShiftService.updateCheckoutAndCashRegisterService(data);

    return res
      .status(200)
      .json(
        new SuccessResponse(
          "Check-out và chốt tiền mặt cuối ca thành công",
          result,
        ),
      );
  },
);

const getShiftAssignmentsController = asyncHandler(async (req, res) => {
  const data = {
    employeeId: req.user.id,
    workShiftId: req.params.workShiftId,
  };
  const result = await workShiftService.getShiftAssignmentsService(data);

  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy danh sách nhân viên trong ca thành công",
        result,
      ),
    );
});

const updateShiftAssignmentTimeController = asyncHandler(async (req, res) => {
  const data = {
    employeeId: req.user.id,
    workShiftId: req.params.workShiftId,
    assignmentId: req.params.assignmentId,
    checkInTime: req.body.checkInTime,
    checkOutTime: req.body.checkOutTime,
  };
  const result = await workShiftService.updateShiftAssignmentTimeService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật giờ làm nhân viên thành công", result));
});

const workShiftController = {
  getWorkShiftByDateController,
  getCurrentWorkShiftController,
  updateCheckInAndCashRegisterController,
  updateCheckOutAndCashRegisterController,
  getShiftAssignmentsController,
  updateShiftAssignmentTimeController,
};

export default workShiftController;
