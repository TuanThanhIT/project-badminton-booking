import {
  CashRegister,
  WorkShift,
  WorkShiftEmployee,
} from "../../models/index.js";
import sequelize from "../../config/db.js";
import { sendAdminNotification } from "../../utils/sendNotification.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";

const getWorkShiftByDateService = async (data) => {
  const { workDate } = data;
  const workShifts = await WorkShift.findAll({
    where: { workDate },
    attributes: ["id", "name", "workDate", "startTime", "endTime", "shiftWage"],
  });
  return workShifts;
};

const updateCheckInAndCashRegisterService = async (data) => {
  const { workShiftId, checkInTime, openingCash } = data;
  return sequelize.transaction(async (t) => {
    const workShift = await WorkShift.findByPk(workShiftId);
    if (!workShift) {
      throw new NotFoundError("Ca làm không tồn tại");
    }

    if (!checkInTime || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(checkInTime)) {
      throw new BadRequestError(
        "Giờ checkIn không hợp lệ! (HH:MM hoặc HH:MM:SS)",
      );
    }

    const workShiftEmployee = await WorkShiftEmployee.findOne({
      where: { workShiftId },
      transaction: t,
    });
    if (!workShiftEmployee) {
      throw new NotFoundError("Ca làm chưa được phân cho nhân viên!");
    } else {
      if (!workShiftEmployee.checkIn) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");

        const checkInDateStr = `${yyyy}-${mm}-${dd} ${checkInTime}`;

        await workShiftEmployee.update(
          { checkIn: checkInDateStr },
          { transaction: t },
        );

        await CashRegister.create(
          {
            workShiftEmployeeId: workShiftEmployee.id,
            openingCash,
          },
          { transaction: t },
        );
      } else {
        throw new BadRequestError(
          "Mỗi ca chỉ được check in 1 lần! Không thể check in lại!",
        );
      }
      t.afterCommit(() => {
        sendAdminNotification(
          "Check-in ca làm",
          `Nhân viên có id là ${workShiftEmployee.employeeId} vừa check-in vào ${workShift.name} ngày ${workShift.workDate}`,
          "ADMIN",
          "adm-check-in",
        ).catch((err) => console.error("Admin notify failed", err));
      });

      return workShift;
    }
  });
};

const updateCheckoutAndCashRegisterService = async (data) => {
  const { workShiftId, checkOutTime, closingCash } = data;
  return sequelize.transaction(async (t) => {
    const workShift = await WorkShift.findByPk(workShiftId);
    if (!workShift) {
      throw new NotFoundError("Ca làm không tồn tại");
    }

    if (!checkOutTime || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(checkOutTime)) {
      throw new BadRequestError(
        "Giờ checkOut không hợp lệ! (HH:MM hoặc HH:MM:SS)",
      );
    }

    const workShiftEmployee = await WorkShiftEmployee.findOne({
      where: { workShiftId },
      transaction: t,
    });

    if (!workShiftEmployee) {
      throw new NotFoundError("Ca làm chưa được phân cho nhân viên");
    }

    if (workShiftEmployee.checkOut) {
      throw new BadRequestError(
        "Mỗi ca chỉ được check out 1 lần. Không thể check out lại",
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
      throw new NotFoundError("Chưa có thời gian checkIn");
    }

    const checkInDate = new Date(workShiftEmployee.checkIn);
    const checkOutDate = new Date(checkOutDateStr);

    if (checkOutDate <= checkInDate) {
      throw new BadRequestError("Thời gian checkOut phải lớn hơn checkIn");
    }

    const hoursWorked = (checkOutDate - checkInDate) / 1000 / 3600; // giờ làm việc
    const earnedWage = Math.round(hoursWorked * workShift.shiftWage); // làm tròn số

    // ------------------- Cập nhật checkOut và earnedWage -------------------
    await workShiftEmployee.update(
      {
        checkOut: checkOutDateStr,
        earnedWage,
      },
      { transaction: t },
    );

    // ------------------- Tạo CashRegister -------------------
    await CashRegister.create(
      {
        workShiftEmployeeId: workShiftEmployee.id,
        closingCash,
      },
      { transaction: t },
    );

    t.afterCommit(() => {
      sendAdminNotification(
        "Check-out ca làm",
        `Nhân viên có id là ${workShiftEmployee.employeeId} vừa check-out khỏi ${workShift.name} ngày ${workShift.workDate}`,
        "ADMIN",
        "adm-check-out",
      ).catch((err) => console.error("Admin notify failed", err));
    });

    return workShift;
  });
};

const workShiftService = {
  getWorkShiftByDateService,
  updateCheckInAndCashRegisterService,
  updateCheckoutAndCashRegisterService,
};
export default workShiftService;
