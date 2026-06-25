import { Op } from "sequelize";
import {
  BranchManager,
  Profile,
  User,
  WorkShift,
  WorkShiftEmployee,
} from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { ROLE_IN_SHIFT } from "../../constants/workShiftConstant.js";

const getManagerBranchId = async (managerId) => {
  const branchManager = await BranchManager.findOne({
    attributes: ["branchId"],
    where: { managerId, isActive: true },
    raw: true,
  });

  if (!branchManager) {
    throw new NotFoundError("Quản lý chưa được gán chi nhánh đang hoạt động");
  }

  return branchManager.branchId;
};

const buildMonthRange = ({ month, year }) => {
  const now = new Date();
  const monthNumber = Number(month) || now.getMonth() + 1;
  const yearNumber = Number(year) || now.getFullYear();
  const startDate = `${yearNumber}-${String(monthNumber).padStart(2, "0")}-01`;
  const endDate = new Date(yearNumber, monthNumber, 0)
    .toISOString()
    .slice(0, 10);

  return { month: monthNumber, year: yearNumber, startDate, endDate };
};

const normalizeTime = (time) => {
  if (!time || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) return null;
  const [hour, minute, second = "00"] = time.split(":");
  return `${hour.padStart(2, "0")}:${minute}:${second}`;
};

const buildDateTime = (date, time) => new Date(`${date}T${normalizeTime(time)}`);

const getShiftWageByRole = (workShift, roleInShift) =>
  roleInShift === ROLE_IN_SHIFT.CASHIER
    ? Number(workShift.cashierShiftWage || 0)
    : Number(workShift.staffShiftWage || 0);

const calculateAssignmentSalary = (assignment) => {
  const earnedWage = Number(assignment.earnedWage || 0);
  const completionRate = Number(assignment.completionRate || 0);

  if (earnedWage > 0 || completionRate > 0) {
    return { earnedWage, completionRate };
  }

  if (!assignment.checkIn || !assignment.checkOut || !assignment.workShift) {
    return { earnedWage: 0, completionRate: 0 };
  }

  const shiftStartDate = buildDateTime(
    assignment.workShift.workDate,
    assignment.workShift.startTime,
  );
  const shiftEndDate = buildDateTime(
    assignment.workShift.workDate,
    assignment.workShift.endTime,
  );
  const shiftDuration = shiftEndDate - shiftStartDate;

  if (shiftDuration <= 0) {
    return { earnedWage: 0, completionRate: 0 };
  }

  const workedDuration =
    new Date(assignment.checkOut) - new Date(assignment.checkIn);
  const normalizedCompletionRate = Number(
    Math.min(1, Math.max(0, workedDuration / shiftDuration)).toFixed(4),
  );

  return {
    completionRate: normalizedCompletionRate,
    earnedWage: Math.round(
      getShiftWageByRole(assignment.workShift, assignment.roleInShift) *
        normalizedCompletionRate,
    ),
  };
};

const toSalaryAssignment = (assignment) => {
  const item = assignment.get ? assignment.get({ plain: true }) : assignment;
  const salary = calculateAssignmentSalary(item);

  return {
    assignmentId: item.id,
    workShiftId: item.workShiftId,
    roleInShift: item.roleInShift,
    checkIn: item.checkIn,
    checkOut: item.checkOut,
    completionRate: salary.completionRate,
    earnedWage: salary.earnedWage,
    shiftWage: getShiftWageByRole(item.workShift, item.roleInShift),
    workShift: {
      id: item.workShift.id,
      shiftName: item.workShift.shiftName,
      workDate: item.workShift.workDate,
      startTime: item.workShift.startTime,
      endTime: item.workShift.endTime,
      shiftStatus: item.workShift.shiftStatus,
    },
  };
};

const toEmployeeSalary = (employee, assignments) => {
  const shiftItems = assignments.map(toSalaryAssignment);
  const totalEarnedWage = shiftItems.reduce(
    (sum, item) => sum + Number(item.earnedWage || 0),
    0,
  );
  const completedShiftCount = shiftItems.filter(
    (item) => item.checkIn && item.checkOut,
  ).length;
  const averageCompletionRate = shiftItems.length
    ? Number(
        (
          shiftItems.reduce(
            (sum, item) => sum + Number(item.completionRate || 0),
            0,
          ) / shiftItems.length
        ).toFixed(4),
      )
    : 0;

  return {
    employeeId: employee.id,
    username: employee.username,
    email: employee.email,
    fullName: employee.profile?.fullName || null,
    phoneNumber: employee.profile?.phoneNumber || null,
    avatar: employee.profile?.avatar || null,
    shiftCount: shiftItems.length,
    completedShiftCount,
    totalEarnedWage,
    averageCompletionRate,
    assignments: shiftItems,
  };
};

const getManagerMonthlySalaryService = async (managerId, query = {}) => {
  const branchId = await getManagerBranchId(managerId);
  const range = buildMonthRange(query);

  const assignments = await WorkShiftEmployee.findAll({
    include: [
      {
        model: User,
        as: "employee",
        attributes: ["id", "username", "email"],
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["fullName", "phoneNumber", "avatar"],
          },
        ],
      },
      {
        model: WorkShift,
        as: "workShift",
        required: true,
        where: {
          branchId,
          workDate: {
            [Op.between]: [range.startDate, range.endDate],
          },
        },
        attributes: [
          "id",
          "shiftName",
          "workDate",
          "startTime",
          "endTime",
          "cashierShiftWage",
          "staffShiftWage",
          "shiftStatus",
        ],
      },
    ],
    order: [
      [{ model: WorkShift, as: "workShift" }, "workDate", "ASC"],
      [{ model: WorkShift, as: "workShift" }, "startTime", "ASC"],
    ],
  });

  const employeeMap = new Map();

  assignments.forEach((assignment) => {
    const item = assignment.get({ plain: true });
    if (!item.employee) return;

    if (!employeeMap.has(item.employeeId)) {
      employeeMap.set(item.employeeId, {
        employee: item.employee,
        assignments: [],
      });
    }

    employeeMap.get(item.employeeId).assignments.push(item);
  });

  const employees = Array.from(employeeMap.values()).map((item) =>
    toEmployeeSalary(item.employee, item.assignments),
  );
  const totalSalary = employees.reduce(
    (sum, item) => sum + item.totalEarnedWage,
    0,
  );
  const totalShiftCount = employees.reduce(
    (sum, item) => sum + item.shiftCount,
    0,
  );

  return {
    branchId,
    month: range.month,
    year: range.year,
    startDate: range.startDate,
    endDate: range.endDate,
    employeeCount: employees.length,
    totalShiftCount,
    totalSalary,
    employees,
  };
};

export default {
  getManagerMonthlySalaryService,
};
