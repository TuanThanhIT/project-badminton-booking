import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import workShiftService from "../../services/employee/workShiftService.js";

const getWorkShiftByDate = asyncHandler(async (req, res) => {
  const data = { workDate: req.params.date };
  const workShifts = await workShiftService.getWorkShiftByDateService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy ca làm theo ngày thành công", workShifts));
});

const updateCheckInAndCashRegister = asyncHandler(async (req, res) => {
  const { workShiftId } = req.params;
  const data = { workShiftId, ...req.body };
  const workShift =
    await workShiftService.updateCheckInAndCashRegisterService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Check-in thông tin ca làm thành công", workShift),
    );
});

const updateCheckOutAndCashRegister = asyncHandler(async (req, res) => {
  const { workShiftId } = req.params;
  const data = { workShiftId, ...req.body };
  const workShift =
    await workShiftService.updateCheckoutAndCashRegisterService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Bạn đã check-out thành công. Vui lòng Log-out để hoàn thành ca làm",
        workShift,
      ),
    );
});

const workShiftController = {
  getWorkShiftByDate,
  updateCheckInAndCashRegister,
  updateCheckOutAndCashRegister,
};
export default workShiftController;
