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

export const updateCheckInAndCashRegisterService = async (
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

export const updateCheckoutAndCashRegisterService = async (
  workShiftId,
  checkOutTime,
  closingCash
) => {
  try {
    const workShift = await WorkShift.findByPk(workShiftId);
    if (!workShift) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Ca làm không tồn tại!");
    }

    if (!checkOutTime || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(checkOutTime)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giờ checkOut không hợp lệ! (HH:MM hoặc HH:MM:SS)"
      );
    }

    const workShiftEmployee = await WorkShiftEmployee.findOne({
      where: { workShiftId },
    });

    if (!workShiftEmployee) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Ca làm chưa được phân cho nhân viên!"
      );
    }

    if (workShiftEmployee.checkOut) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Mỗi ca chỉ được check out 1 lần! Không thể check out lại!"
      );
    }

    // ------------------- Tạo datetime string -------------------
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const checkOutDateStr = `${yyyy}-${mm}-${dd} ${checkOutTime}`;

    // ------------------- Tính earnedWage -------------------
    if (!workShiftEmployee.checkIn) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Chưa có thời gian checkIn!");
    }

    const checkInDate = new Date(workShiftEmployee.checkIn);
    const checkOutDate = new Date(checkOutDateStr);

    if (checkOutDate <= checkInDate) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Thời gian checkOut phải lớn hơn checkIn!"
      );
    }

    const hoursWorked = (checkOutDate - checkInDate) / 1000 / 3600; // giờ làm việc
    const earnedWage = Math.round(hoursWorked * workShift.shiftWage); // làm tròn số

    // ------------------- Cập nhật checkOut và earnedWage -------------------
    await workShiftEmployee.update({
      checkOut: checkOutDateStr,
      earnedWage,
    });

    // ------------------- Tạo CashRegister -------------------
    await CashRegister.create({
      workShiftEmployeeId: workShiftEmployee.id,
      closingCash,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const workShiftService = {
  getWorkShiftByDateService,
  updateCheckInAndCashRegisterService,
  updateCheckoutAndCashRegisterService,
};
export default workShiftService;
