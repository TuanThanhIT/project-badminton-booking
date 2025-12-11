import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  CashRegister,
  WorkShift,
  WorkShiftEmployee,
} from "../../models/index.js";
import sequelize from "../../config/db.js";

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

const updateCheckInAndCashRegisterService = async (
  workShiftEmployeeId,
  checkInData,
  openingCashData
) => {
  const t = await sequelize.transaction();

  try {
    const workShiftEmployee = await WorkShiftEmployee.findByPk(
      workShiftEmployeeId,
      { transaction: t, lock: t.LOCK.UPDATE }
    );

    if (!workShiftEmployee) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy ca làm!");
    }

    if (workShiftEmployee.checkIn) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Bạn đã điểm danh vào rồi!");
    }

    // Update check-in
    await workShiftEmployee.update(checkInData, { transaction: t });

    // Mở cash register
    await CashRegister.create(
      { ...openingCashData, workShiftEmployeeId },
      { transaction: t }
    );

    await t.commit();
  } catch (error) {
    await t.rollback();

    if (error instanceof ApiError) throw error;

    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateCheckoutAndCashRegisterService = async (
  workShiftEmployeeId,
  checkoutData,
  closingCashData
) => {
  const t = await sequelize.transaction();

  try {
    const workShiftEmployee = await WorkShiftEmployee.findByPk(
      workShiftEmployeeId,
      { transaction: t, lock: t.LOCK.UPDATE }
    );

    if (!workShiftEmployee) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy ca làm!");
    }

    if (workShiftEmployee.checkOut) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Bạn đã điểm danh ra rồi!");
    }

    // Tính lương earnedWage
    const checkInTime = new Date(workShiftEmployee.checkIn);
    const checkOutTime = new Date(checkoutData.checkOut);

    const hours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    const earnedWage = hours * workShiftEmployee.hourlyWage;

    // Update checkout + earnedWage
    await workShiftEmployee.update(
      {
        ...checkoutData,
        earnedWage,
      },
      { transaction: t }
    );

    // Closing cash
    await CashRegister.create(
      { ...closingCashData, workShiftEmployeeId },
      { transaction: t }
    );

    await t.commit();
  } catch (error) {
    await t.rollback();

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
