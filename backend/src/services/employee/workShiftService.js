import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  CashRegister,
  WorkShift,
  WorkShiftEmployee,
} from "../../models/index.js";

const getWorkShiftByDateService = async (workDate) => {
  try {
    const workShifts = await WorkShift.findAll({
      where: { workDate },
      attributes: [
        "id",
        "name",
        "workDate",
        "startTime",
        "endTime",
        "shiftWage",
      ],
    });
    return workShifts;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

export const updateWorkShiftEmployeeAndCashRegisterService = async (
  workShiftId,
  checkInTime,
  openingCash
) => {
  try {
    const workShift = await WorkShift.findByPk(workShiftId);
    if (!workShift) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Ca làm không tồn tại!");
    }

    if (!checkInTime || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(checkInTime)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giờ checkIn không hợp lệ! (HH:MM hoặc HH:MM:SS)"
      );
    }

    const workShiftEmployee = await WorkShiftEmployee.findOne({
      where: { workShiftId },
    });
    if (!workShiftEmployee) {
      throw new ApiError("Ca làm chưa được phân cho nhân viên!");
    } else {
      if (!workShiftEmployee.checkIn) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");

        const checkInDateStr = `${yyyy}-${mm}-${dd} ${checkInTime}`;

        await workShiftEmployee.update({ checkIn: checkInDateStr });

        await CashRegister.create({
          workShiftEmployeeId: workShiftEmployee.id,
          openingCash,
        });
      } else {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Mỗi ca chỉ được check in 1 lần! Không thể check in lại!"
        );
      }
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const workShiftService = {
  getWorkShiftByDateService,
  updateWorkShiftEmployeeAndCashRegisterService,
};
export default workShiftService;
