import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  WorkShift,
  WorkShiftEmployee,
  User,
  Profile,
} from "../../models/index.js";
import mailer from "../../utils/mailer.js";
import sequelize from "../../config/db.js";
import { col, fn, literal, Op, where } from "sequelize";

const assignEmployeeToShiftService = async (
  workShiftId,
  employeeId,
  roleInShift
) => {
  try {
    const shift = await WorkShift.findByPk(workShiftId);
    if (!shift) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy ca làm!");
    }

    const user = await User.findByPk(employeeId, {
      include: [
        {
          model: Profile,
          attributes: ["fullName"],
        },
      ],
    });
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy nhân viên!");
    }

    const existed = await WorkShiftEmployee.findOne({
      where: { workShiftId, employeeId },
    });

    if (existed) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Nhân viên đã được phân vào ca này!"
      );
    }

    const record = await WorkShiftEmployee.create({
      workShiftId,
      employeeId,
      roleInShift,
    });

    await mailer.sendWorkShiftMail(
      user.email,
      user.Profile.fullName,
      shift.name,
      shift.workDate,
      shift.startTime,
      shift.endTime,
      roleInShift
    );

    return {
      message: "Phân ca cho nhân viên thành công!",
      record,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getEmployeesByShiftService = async (workShiftId) => {
  try {
    const shift = await WorkShift.findByPk(workShiftId);
    if (!shift) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy ca làm!");
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
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

export const updateEmployeeInShiftService = async (id, data) => {
  const t = await sequelize.transaction();
  try {
    const record = await WorkShiftEmployee.findByPk(id, {
      include: [{ model: WorkShift, as: "workShift" }],
      transaction: t,
    });

    if (!record) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Không tìm thấy phân ca nhân viên!"
      );
    }

    const { checkIn, checkOut, ...otherData } = data;

    let updateData = { ...otherData };

    // Validate checkIn
    if (checkIn) {
      if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(checkIn)) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Giờ checkIn không hợp lệ! (HH:MM hoặc HH:MM:SS)"
        );
      }
    }

    // Validate checkOut
    if (checkOut) {
      if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(checkOut)) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Giờ checkOut không hợp lệ! (HH:MM hoặc HH:MM:SS)"
        );
      }
    }

    // Nếu có checkIn hoặc checkOut → xử lý thời gian
    if (checkIn || checkOut) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");

      const checkInDateStr = checkIn
        ? `${yyyy}-${mm}-${dd} ${checkIn}`
        : record.checkIn;

      const checkOutDateStr = checkOut
        ? `${yyyy}-${mm}-${dd} ${checkOut}`
        : record.checkOut;

      if (checkInDateStr && checkOutDateStr) {
        const checkInDate = new Date(checkInDateStr);
        const checkOutDate = new Date(checkOutDateStr);

        if (checkOutDate <= checkInDate) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Thời gian checkOut phải lớn hơn checkIn!"
          );
        }

        const hoursWorked = (checkOutDate - checkInDate) / 1000 / 3600;

        const earnedWage = Math.round(hoursWorked * record.workShift.shiftWage);

        updateData = {
          ...updateData,
          checkIn: checkInDateStr,
          checkOut: checkOutDateStr,
          earnedWage,
        };
      } else {
        if (checkIn) updateData.checkIn = checkInDateStr;
        if (checkOut) updateData.checkOut = checkOutDateStr;
      }
    }

    await record.update(updateData, { transaction: t });

    await t.commit();

    return {
      message: "Cập nhật phân ca nhân viên thành công!",
      record,
    };
  } catch (error) {
    await t.rollback();
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const removeEmployeeFromShiftService = async (id) => {
  try {
    const record = await WorkShiftEmployee.findByPk(id);

    if (!record) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Không tìm thấy nhân viên trong ca!"
      );
    }

    await record.destroy();

    return {
      message: "Đã xóa nhân viên khỏi ca!",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getAllEmployeesMonthlySalaryService = async (month, year) => {
  try {
    const now = new Date();
    const currentMonth = month ? Number(month) : now.getMonth() + 1;
    const currentYear = year ? Number(year) : now.getFullYear();

    if (currentMonth < 1 || currentMonth > 12) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Tháng không hợp lệ!");
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
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getWorkShiftEmployeeDetailService = async (employeeId) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (currentMonth < 1 || currentMonth > 12) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Tháng không hợp lệ!");
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
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
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
