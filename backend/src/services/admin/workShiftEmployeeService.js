import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  WorkShift,
  WorkShiftEmployee,
  User,
  Profile,
} from "../../models/index.js";

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

    const user = await User.findByPk(employeeId);
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
      earnedWage: shift.shiftWage,
    });

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
};

const updateEmployeeInShiftService = async (id, data) => {
  const record = await WorkShiftEmployee.findByPk(id);

  if (!record) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Không tìm thấy phân ca nhân viên!"
    );
  }

  await record.update(data);

  return {
    message: "Cập nhật nhân viên trong ca thành công!",
    record,
  };
};

const removeEmployeeFromShiftService = async (id) => {
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
};

const workShiftEmployeeService = {
  assignEmployeeToShiftService,
  getEmployeesByShiftService,
  updateEmployeeInShiftService,
  removeEmployeeFromShiftService,
};

export default workShiftEmployeeService;
