import { Op } from "sequelize";
import {
  BranchEmployee,
  BranchManager,
  Profile,
  User,
  WorkShift,
  WorkShiftEmployee,
} from "../../models/index.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ConflictError from "../../errors/ConflictError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { ROLE_IN_SHIFT, WORK_SHIFT_STATUS } from "../../constants/workShiftConstant.js";

const getManagerBranchId = async (managerId) => {
  const branchManager = await BranchManager.findOne({
    attributes: ["branchId"],
    where: { managerId, isActive: true },
    raw: true,
  });

  if (!branchManager) {
    throw new NotFoundError("Manager has no active branch");
  }

  return branchManager.branchId;
};

const normalizeTime = (time) => {
  if (!time || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) return null;

  const [hour, minute, second = "00"] = time.split(":");
  return `${hour.padStart(2, "0")}:${minute}:${second}`;
};

const assertValidTimeRange = (startTime, endTime) => {
  const normalizedStart = normalizeTime(startTime);
  const normalizedEnd = normalizeTime(endTime);

  if (!normalizedStart || !normalizedEnd) {
    throw new BadRequestError("Invalid shift time");
  }

  if (normalizedEnd <= normalizedStart) {
    throw new BadRequestError("End time must be greater than start time");
  }

  return { startTime: normalizedStart, endTime: normalizedEnd };
};

const employeeInclude = {
  model: User,
  as: "employee",
  attributes: ["id", "username", "email", "isActive"],
  include: [
    {
      model: Profile,
      as: "profile",
      attributes: ["fullName", "phoneNumber", "avatar"],
    },
  ],
};

const assignmentInclude = [employeeInclude];

const toAssignment = (assignment) => {
  const item = assignment.get ? assignment.get({ plain: true }) : assignment;
  const employee = item.employee;

  return {
    assignmentId: item.id,
    workShiftId: item.workShiftId,
    employeeId: item.employeeId,
    roleInShift: item.roleInShift,
    checkIn: item.checkIn,
    checkOut: item.checkOut,
    completionRate: Number(item.completionRate || 0),
    earnedWage: Number(item.earnedWage || 0),
    employee: employee
      ? {
          id: employee.id,
          username: employee.username,
          email: employee.email,
          isActive: employee.isActive,
          fullName: employee.profile?.fullName || null,
          phoneNumber: employee.profile?.phoneNumber || null,
          avatar: employee.profile?.avatar || null,
        }
      : null,
  };
};

const shiftInclude = [
  {
    model: WorkShiftEmployee,
    as: "workShiftEmployees",
    include: assignmentInclude,
  },
];

const toWorkShift = (shift) => {
  const item = shift.get ? shift.get({ plain: true }) : shift;
  const assignments = item.workShiftEmployees || [];

  return {
    id: item.id,
    shiftName: item.shiftName,
    workDate: item.workDate,
    startTime: item.startTime,
    endTime: item.endTime,
    cashierShiftWage: Number(item.cashierShiftWage || 0),
    staffShiftWage: Number(item.staffShiftWage || 0),
    branchId: item.branchId,
    shiftStatus: item.shiftStatus,
    assignments: assignments.map(toAssignment),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const findManagerShift = async ({ managerId, workShiftId, transaction }) => {
  const branchId = await getManagerBranchId(managerId);
  const shift = await WorkShift.findOne({
    where: { id: workShiftId, branchId },
    include: shiftInclude,
    transaction,
  });

  if (!shift) {
    throw new NotFoundError("Work shift not found in manager branch");
  }

  return { branchId, shift };
};

const assertEmployeeInBranch = async ({ employeeId, branchId, transaction }) => {
  const branchEmployee = await BranchEmployee.findOne({
    where: { employeeId, branchId },
    transaction,
  });

  if (!branchEmployee) {
    throw new BadRequestError("Employee does not belong to manager branch");
  }
};

const getManagerWorkShiftsService = async (managerId, query = {}) => {
  const branchId = await getManagerBranchId(managerId);
  const { workDate } = query;
  const where = { branchId };

  if (workDate) {
    where.workDate = workDate;
  }

  const shifts = await WorkShift.findAll({
    where,
    include: shiftInclude,
    order: [
      ["workDate", "DESC"],
      ["startTime", "ASC"],
    ],
  });

  return {
    branchId,
    workShifts: shifts.map(toWorkShift),
  };
};

const createManagerWorkShiftService = async (managerId, data) => {
  const branchId = await getManagerBranchId(managerId);
  const { startTime, endTime } = assertValidTimeRange(data.startTime, data.endTime);

  const overlapping = await WorkShift.findOne({
    where: {
      branchId,
      workDate: data.workDate,
      [Op.and]: [
        { startTime: { [Op.lt]: endTime } },
        { endTime: { [Op.gt]: startTime } },
      ],
      shiftStatus: { [Op.ne]: WORK_SHIFT_STATUS.CANCELLED },
    },
  });

  if (overlapping) {
    throw new ConflictError("Work shift time overlaps another shift");
  }

  const shift = await WorkShift.create({
    shiftName: data.shiftName,
    workDate: data.workDate,
    startTime,
    endTime,
    cashierShiftWage: Number(data.cashierShiftWage || 0),
    staffShiftWage: Number(data.staffShiftWage || 0),
    branchId,
    shiftStatus: WORK_SHIFT_STATUS.SCHEDULED,
  });

  const created = await WorkShift.findByPk(shift.id, { include: shiftInclude });

  return toWorkShift(created);
};

const assignEmployeeToShiftService = async (managerId, data) => {
  const { branchId, shift } = await findManagerShift({
    managerId,
    workShiftId: data.workShiftId,
  });

  if (shift.shiftStatus !== WORK_SHIFT_STATUS.SCHEDULED) {
    throw new BadRequestError("Only scheduled shifts can be assigned");
  }

  await assertEmployeeInBranch({
    employeeId: data.employeeId,
    branchId,
  });

  const existed = await WorkShiftEmployee.findOne({
    where: {
      workShiftId: data.workShiftId,
      employeeId: data.employeeId,
    },
  });

  if (existed) {
    throw new ConflictError("Employee already assigned to this shift");
  }

  if (data.roleInShift === ROLE_IN_SHIFT.CASHIER) {
    const cashier = await WorkShiftEmployee.findOne({
      where: {
        workShiftId: data.workShiftId,
        roleInShift: ROLE_IN_SHIFT.CASHIER,
      },
    });

    if (cashier) {
      throw new ConflictError("This shift already has a cashier");
    }
  }

  const overlapping = await WorkShiftEmployee.findOne({
    where: { employeeId: data.employeeId },
    include: [
      {
        model: WorkShift,
        as: "workShift",
        required: true,
        where: {
          workDate: shift.workDate,
          branchId,
          id: { [Op.ne]: shift.id },
          startTime: { [Op.lt]: shift.endTime },
          endTime: { [Op.gt]: shift.startTime },
          shiftStatus: { [Op.ne]: WORK_SHIFT_STATUS.CANCELLED },
        },
      },
    ],
  });

  if (overlapping) {
    throw new ConflictError("Employee already has an overlapping shift");
  }

  const assignment = await WorkShiftEmployee.create({
    workShiftId: data.workShiftId,
    employeeId: data.employeeId,
    roleInShift: data.roleInShift,
  });

  const created = await WorkShiftEmployee.findByPk(assignment.id, {
    include: assignmentInclude,
  });

  return toAssignment(created);
};

const updateShiftAssignmentService = async (managerId, assignmentId, data) => {
  const assignment = await WorkShiftEmployee.findByPk(assignmentId, {
    include: [
      {
        model: WorkShift,
        as: "workShift",
      },
      employeeInclude,
    ],
  });

  if (!assignment) {
    throw new NotFoundError("Shift assignment not found");
  }

  await findManagerShift({
    managerId,
    workShiftId: assignment.workShiftId,
  });

  if (assignment.workShift.shiftStatus !== WORK_SHIFT_STATUS.SCHEDULED) {
    throw new BadRequestError("Only scheduled shift assignments can be updated");
  }

  if (data.roleInShift === ROLE_IN_SHIFT.CASHIER) {
    const cashier = await WorkShiftEmployee.findOne({
      where: {
        workShiftId: assignment.workShiftId,
        roleInShift: ROLE_IN_SHIFT.CASHIER,
        id: { [Op.ne]: assignment.id },
      },
    });

    if (cashier) {
      throw new ConflictError("This shift already has a cashier");
    }
  }

  await assignment.update({ roleInShift: data.roleInShift });

  const updated = await WorkShiftEmployee.findByPk(assignment.id, {
    include: assignmentInclude,
  });

  return toAssignment(updated);
};

const removeShiftAssignmentService = async (managerId, assignmentId) => {
  const assignment = await WorkShiftEmployee.findByPk(assignmentId, {
    include: [{ model: WorkShift, as: "workShift" }],
  });

  if (!assignment) {
    throw new NotFoundError("Shift assignment not found");
  }

  await findManagerShift({
    managerId,
    workShiftId: assignment.workShiftId,
  });

  if (assignment.workShift.shiftStatus !== WORK_SHIFT_STATUS.SCHEDULED) {
    throw new BadRequestError("Only scheduled shift assignments can be removed");
  }

  await assignment.destroy();

  return { assignmentId: Number(assignmentId), workShiftId: assignment.workShiftId };
};

export default {
  getManagerWorkShiftsService,
  createManagerWorkShiftService,
  assignEmployeeToShiftService,
  updateShiftAssignmentService,
  removeShiftAssignmentService,
};
