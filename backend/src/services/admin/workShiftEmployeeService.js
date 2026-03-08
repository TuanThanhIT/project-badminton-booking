import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError.js";
import {
  WorkShift,
  WorkShiftEmployee,
  User,
  Profile,
} from "../../models/index.js";
import mailer from "../../helpers/mailer.js";
import sequelize from "../../config/db.js";
import { col, fn, literal, Op } from "sequelize";
import NotFoundError from "../../errors/NotFoundError.js";
import ConflictError from "../../errors/ConflictError.js";
import BadRequestError from "../../errors/BadRequestError.js";

const assignEmployeeToShiftService = async (data) => {
  const { workShiftId, employeeId, roleInShift } = data;
  return sequelize.transaction(async (t) => {
    const shift = await WorkShift.findByPk(workShiftId, { transaction: t });
    if (!shift) {
      throw new NotFoundError("Không tìm thấy ca làm");
    }

    const user = await User.findByPk(
      employeeId,
      {
        include: [
          {
            model: Profile,
            attributes: ["fullName"],
          },
        ],
      },
      { transaction: t },
    );
    if (!user) {
      throw new NotFoundError("Không tìm thấy nhân viên");
    }

    const existed = await WorkShiftEmployee.findOne({
      where: { workShiftId, employeeId },
      transaction: t,
    });

    if (existed) {
      throw new ConflictError("Nhân viên đã được phân vào ca này");
    }

    const record = await WorkShiftEmployee.create(
      {
        workShiftId,
        employeeId,
        roleInShift,
      },
      { transaction: t },
    );

    t.afterCommit(() => {
      mailer
        .sendWorkShiftMail(
          user.email,
          user.Profile.fullName,
          shift.name,
          shift.workDate,
          shift.startTime,
          shift.endTime,
          roleInShift,
        )
        .catch((err) => console.error("Employee mail failed", err));
    });

    return record;
  });
};

const getEmployeesByShiftService = async (data) => {
  const { workShiftId } = data;
  const shift = await WorkShift.findByPk(workShiftId);
  if (!shift) {
    throw new NotFoundError("Không tìm thấy ca làm");
  }

  const employees = await WorkShiftEmployee.findAll({
    where: { workShiftId },
    include: [
      {
        model: User,
        as: "employee",
        attributes: ["id", "username", "email"],
        include: [
          {
            model: Profile,

            attributes: ["fullName", "phoneNumber", "avatar"],
          },
        ],
      },
    ],
    order: [["createdDate", "ASC"]],
  });

  return {
    shift,
    employees,
  };
};

export const updateEmployeeInShiftService = async (data) => {
  const { workShiftEmployeeId, updateData } = data;
  return sequelize.transaction(async (t) => {
    const record = await WorkShiftEmployee.findByPk(workShiftEmployeeId, {
      include: [{ model: WorkShift, as: "workShift" }],
      transaction: t,
    });

    if (!record) {
      throw new NotFoundError("Không tìm thấy ca làm của nhân viên");
    }

    const { checkIn, checkOut, ...otherData } = updateData;

    let finalData = { ...otherData };

    // ===== Nếu có cả checkIn & checkOut → validate logic + tính lương =====
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkOutDate <= checkInDate) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Thời gian checkOut phải sau thời gian checkIn",
        );
      }

      const hoursWorked =
        (checkOutDate.getTime() - checkInDate.getTime()) / 1000 / 3600;

      const earnedWage = Math.round(hoursWorked * record.workShift.shiftWage);

      finalData = {
        ...finalData,
        checkIn,
        checkOut,
        earnedWage,
      };
    } else {
      // ===== Update lẻ từng field =====
      if (checkIn) finalData.checkIn = checkIn;
      if (checkOut) finalData.checkOut = checkOut;
    }

    await record.update(finalData, { transaction: t });

    return record;
  });
};

const removeEmployeeFromShiftService = async (data) => {
  const { workShiftEmployeeId } = data;
  return sequelize.transaction(async (t) => {
    const record = await WorkShiftEmployee.findByPk(workShiftEmployeeId, {
      transaction: t,
    });
    if (!record) {
      throw new NotFoundError("Không tìm thấy nhân viên trong ca");
    }
    await record.destroy({ transaction: t });
  });
};

const getAllEmployeesMonthlySalaryService = async (data) => {
  const { month, year } = data;

  const now = new Date();
  const currentMonth = month ? Number(month) : now.getMonth() + 1;
  const currentYear = year ? Number(year) : now.getFullYear();

  if (currentMonth < 1 || currentMonth > 12) {
    throw new BadRequestError("Tháng không hợp lệ");
  }

  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0);

  const records = await WorkShiftEmployee.findAll({
    attributes: [
      "employeeId",
      [fn("COUNT", col("WorkShiftEmployee.id")), "totalShifts"],
      [fn("SUM", col("earnedWage")), "totalWage"],
    ],
    include: [
      {
        model: User,
        as: "employee",
        attributes: ["id", "username", "email"],
        include: [
          {
            model: Profile,
            attributes: ["fullName"],
          },
        ],
      },
      {
        model: WorkShift,
        as: "workShift",
        attributes: [],
        where: {
          workDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      },
    ],
    group: ["employeeId", "employee.id", "employee->Profile.id"],
    order: [[literal("totalWage"), "DESC"]],
  });

  const employees = records.map((item) => ({
    employeeId: item.employee.id,
    username: item.employee.username,
    email: item.employee.email,
    fullName: item.employee.Profile.fullName,
    phoneNumber: item.employee.Profile.phoneNumber,
    avatar: item.employee.Profile.avatar,
    totalShifts: Number(item.getDataValue("totalShifts")),
    totalWage: Number(item.getDataValue("totalWage")) || 0,
  }));

  // Tổng lương phải trả trong tháng
  const totalPayroll = employees.reduce((sum, emp) => sum + emp.totalWage, 0);

  return {
    month: currentMonth,
    year: currentYear,
    totalEmployees: employees.length,
    totalPayroll,
    employees,
  };
};

const getWorkShiftEmployeeDetailService = async (data) => {
  const { employeeId } = data;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (currentMonth < 1 || currentMonth > 12) {
    throw new BadRequestError("Tháng không hợp lệ");
  }

  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0);

  const workShiftEmployees = await WorkShiftEmployee.findAll({
    where: { employeeId },
    attributes: ["id", "checkIn", "checkOut"],
    include: [
      {
        model: WorkShift,
        as: "workShift",
        attributes: ["name", "workDate", "startTime", "endTime"],
        where: {
          workDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      },
    ],
  });
  return workShiftEmployees;
};

const workShiftEmployeeService = {
  assignEmployeeToShiftService,
  getEmployeesByShiftService,
  updateEmployeeInShiftService,
  removeEmployeeFromShiftService,
  getAllEmployeesMonthlySalaryService,
  getWorkShiftEmployeeDetailService,
};

export default workShiftEmployeeService;
