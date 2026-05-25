import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import {
  Branch,
  CashRegister,
  User,
  WorkShift,
  WorkShiftEmployee,
} from "../../models/index.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ForbiddenError from "../../errors/ForbiddenError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { sendAdminNotification } from "../../helpers/notification.js";
import {
  assertEmployeeCanAccessBranch,
  getEmployeeBranchIds,
} from "./branchAccessService.js";
import {
  ROLE_IN_SHIFT,
  WORK_SHIFT_STATUS,
} from "../../constants/workShiftConstant.js";

const normalizeTime = (time) => {
  if (!time || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) return null;

  const [hour, minute, second = "00"] = time.split(":");
  return `${hour.padStart(2, "0")}:${minute}:${second}`;
};

const buildDateTime = (date, time) =>
  new Date(`${date}T${normalizeTime(time)}`);

const markShiftInProgress = async (workShiftId, transaction) => {
  await WorkShift.update(
    { shiftStatus: WORK_SHIFT_STATUS.INPROGRESS },
    {
      where: {
        id: workShiftId,
        shiftStatus: WORK_SHIFT_STATUS.SCHEDULED,
      },
      transaction,
    },
  );
};

const getShiftWageByRole = (workShift, roleInShift) =>
  roleInShift === ROLE_IN_SHIFT.CASHIER
    ? Number(workShift.cashierShiftWage || 0)
    : Number(workShift.staffShiftWage || 0);

const calculateWageByShiftProgress = (
  checkIn,
  checkOut,
  workShift,
  roleInShift,
) => {
  if (!checkIn || !checkOut || !workShift) {
    return { completionRate: 0, earnedWage: 0 };
  }

  const shiftStartDate = buildDateTime(workShift.workDate, workShift.startTime);
  const shiftEndDate = buildDateTime(workShift.workDate, workShift.endTime);
  const shiftDuration = shiftEndDate - shiftStartDate;

  if (shiftDuration <= 0) {
    return { completionRate: 0, earnedWage: 0 };
  }

  const workedDuration = new Date(checkOut) - new Date(checkIn);
  const completionRate = Math.min(
    1,
    Math.max(0, workedDuration / shiftDuration),
  );
  const normalizedCompletionRate = Number(completionRate.toFixed(4));
  const earnedWage = Math.round(
    getShiftWageByRole(workShift, roleInShift) * normalizedCompletionRate,
  );

  return { completionRate: normalizedCompletionRate, earnedWage };
};

const toPlainShift = (assignment) => {
  const plain = assignment.get({ plain: true });
  const workShift = plain.workShift;

  return {
    assignmentId: plain.id,
    workShiftId: plain.workShiftId,
    employeeId: plain.employeeId,
    roleInShift: plain.roleInShift,
    checkIn: plain.checkIn,
    checkOut: plain.checkOut,
    completionRate: Number(plain.completionRate || 0),
    earnedWage: Number(plain.earnedWage || 0),
    cashRegister: plain.cashRegister || null,
    workShift: {
      id: workShift.id,
      shiftName: workShift.shiftName,
      workDate: workShift.workDate,
      startTime: workShift.startTime,
      endTime: workShift.endTime,
      cashierShiftWage: Number(workShift.cashierShiftWage || 0),
      staffShiftWage: Number(workShift.staffShiftWage || 0),
      shiftStatus: workShift.shiftStatus,
      branch: workShift.branch || null,
    },
  };
};

const workShiftInclude = [
  {
    model: WorkShift,
    as: "workShift",
    attributes: [
      "id",
      "shiftName",
      "workDate",
      "startTime",
      "endTime",
      "cashierShiftWage",
      "staffShiftWage",
      "shiftStatus",
      "branchId",
    ],
    include: [
      {
        model: Branch,
        as: "branch",
        attributes: ["id", "branchName", "address"],
      },
    ],
  },
  {
    model: CashRegister,
    as: "cashRegister",
    attributes: [
      "id",
      "openingCash",
      "closingCash",
      "expectedCash",
      "difference",
      "createdDate",
      "updatedDate",
    ],
  },
];

const rosterInclude = [
  {
    model: User,
    as: "employee",
    attributes: ["id", "username", "email"],
  },
  {
    model: WorkShift,
    as: "workShift",
    attributes: [
      "id",
      "shiftName",
      "workDate",
      "startTime",
      "endTime",
      "cashierShiftWage",
      "staffShiftWage",
      "shiftStatus",
      "branchId",
    ],
    include: [
      {
        model: Branch,
        as: "branch",
        attributes: ["id", "branchName", "address"],
      },
    ],
  },
];

const toRosterAssignment = (assignment) => {
  const plain = assignment.get ? assignment.get({ plain: true }) : assignment;

  return {
    assignmentId: plain.id,
    workShiftId: plain.workShiftId,
    employeeId: plain.employeeId,
    roleInShift: plain.roleInShift,
    checkIn: plain.checkIn,
    checkOut: plain.checkOut,
    completionRate: Number(plain.completionRate || 0),
    earnedWage: Number(plain.earnedWage || 0),
    employee: plain.employee || null,
    workShift: plain.workShift
      ? {
          id: plain.workShift.id,
          shiftName: plain.workShift.shiftName,
          workDate: plain.workShift.workDate,
          startTime: plain.workShift.startTime,
          endTime: plain.workShift.endTime,
          cashierShiftWage: Number(plain.workShift.cashierShiftWage || 0),
          staffShiftWage: Number(plain.workShift.staffShiftWage || 0),
          shiftStatus: plain.workShift.shiftStatus,
          branch: plain.workShift.branch || null,
        }
      : null,
  };
};

const assertCashierCanManageShift = async ({
  employeeId,
  workShiftId,
  transaction,
}) => {
  const cashierAssignment = await WorkShiftEmployee.findOne({
    where: { employeeId, workShiftId },
    include: [
      {
        model: WorkShift,
        as: "workShift",
        include: [{ model: Branch, as: "branch" }],
      },
    ],
    transaction,
    lock: transaction?.LOCK?.UPDATE,
  });

  if (!cashierAssignment) {
    throw new NotFoundError(
      "Ca làm không tồn tại hoặc chưa được phân cho nhân viên này!",
    );
  }

  await assertEmployeeCanAccessBranch({
    employeeId,
    branchId: cashierAssignment.workShift.branchId,
    transaction,
  });

  if (cashierAssignment.roleInShift !== ROLE_IN_SHIFT.CASHIER) {
    throw new ForbiddenError(
      "Chỉ nhân viên thu ngân của ca mới được quản lý giờ làm!",
    );
  }

  if (!cashierAssignment.checkIn) {
    throw new BadRequestError(
      "Thu ngân cần check-in và nhập tiền đầu ca trước khi quản lý ca!",
    );
  }

  return cashierAssignment;
};

const findEmployeeAssignment = async (workShiftId, employeeId, transaction) => {
  const assignment = await WorkShiftEmployee.findOne({
    where: { workShiftId, employeeId },
    include: workShiftInclude,
    transaction,
    lock: transaction?.LOCK?.UPDATE,
  });

  if (!assignment) {
    throw new NotFoundError(
      "Ca làm không tồn tại hoặc chưa được phân cho nhân viên này!",
    );
  }

  await assertEmployeeCanAccessBranch({
    employeeId,
    branchId: assignment.workShift.branchId,
    transaction,
  });

  return assignment;
};

const getWorkShiftByDateService = async (data) => {
  const { employeeId, workDate } = data;
  const branchIds = await getEmployeeBranchIds(employeeId);

  if (branchIds.length === 0) return [];

  const assignments = await WorkShiftEmployee.findAll({
    where: { employeeId },
    include: [
      {
        ...workShiftInclude[0],
        where: {
          workDate,
          branchId: { [Op.in]: branchIds },
        },
        required: true,
      },
      workShiftInclude[1],
    ],
    order: [[{ model: WorkShift, as: "workShift" }, "startTime", "ASC"]],
  });

  return assignments.map(toPlainShift);
};

const getCurrentWorkShiftService = async (data) => {
  const { employeeId, workDate, currentTime } = data;
  const branchIds = await getEmployeeBranchIds(employeeId);

  if (branchIds.length === 0) return null;

  const nowTime = normalizeTime(currentTime);

  if (!nowTime) {
    throw new BadRequestError(
      "Giờ hiện tại không hợp lệ! (HH:MM hoặc HH:MM:SS)",
    );
  }

  const assignment = await WorkShiftEmployee.findOne({
    where: { employeeId },
    include: [
      {
        ...workShiftInclude[0],
        where: {
          workDate,
          branchId: { [Op.in]: branchIds },
          startTime: { [Op.lte]: nowTime },
          endTime: { [Op.gte]: nowTime },
        },
        required: true,
      },
      workShiftInclude[1],
    ],
    order: [[{ model: WorkShift, as: "workShift" }, "startTime", "ASC"]],
  });

  return assignment ? toPlainShift(assignment) : null;
};

const updateCheckInAndCashRegisterService = async (data) => {
  const { employeeId, workShiftId, checkInTime, openingCash } = data;
  const normalizedCheckInTime = normalizeTime(checkInTime);

  if (!normalizedCheckInTime) {
    throw new BadRequestError(
      "Giờ check-in không hợp lệ! (HH:MM hoặc HH:MM:SS)",
    );
  }

  if (Number(openingCash) < 0) {
    throw new BadRequestError("Số tiền đầu ca không hợp lệ!");
  }

  const updatedAssignment = await sequelize.transaction(async (t) => {
    const assignment = await findEmployeeAssignment(workShiftId, employeeId, t);
    const { workShift } = assignment;

    if (assignment.checkIn) {
      throw new BadRequestError("Mỗi ca chỉ được check-in một lần!");
    }

    if (assignment.cashRegister) {
      throw new BadRequestError("Ca làm này đã có phiên quầy tiền mặt!");
    }

    const checkInDate = buildDateTime(
      workShift.workDate,
      normalizedCheckInTime,
    );
    const shiftStartDate = buildDateTime(
      workShift.workDate,
      workShift.startTime,
    );
    const shiftEndDate = buildDateTime(workShift.workDate, workShift.endTime);

    if (checkInDate < shiftStartDate || checkInDate > shiftEndDate) {
      throw new BadRequestError(
        "Chỉ được check-in trong khung giờ của ca làm!",
      );
    }

    await assignment.update({ checkIn: checkInDate }, { transaction: t });
    await markShiftInProgress(workShift.id, t);

    await CashRegister.create(
      {
        workShiftEmployeeId: assignment.id,
        openingCash: Number(openingCash),
        expectedCash: Number(openingCash),
        closingCash: 0,
        difference: null,
      },
      { transaction: t },
    );

    return WorkShiftEmployee.findByPk(assignment.id, {
      include: workShiftInclude,
      transaction: t,
    });
  });

  await sendAdminNotification(
    "adm-check-in",
    "Check-in ca làm",
    `Nhân viên có id là ${employeeId} vừa check-in vào ${updatedAssignment.workShift.shiftName} ` +
      `ngày ${updatedAssignment.workShift.workDate}`,
  );

  return toPlainShift(updatedAssignment);
};

const updateCheckoutAndCashRegisterService = async ({
  employeeId,
  workShiftId,
  checkOutTime,
  closingCash,
}) => {
  const normalizedCheckOutTime = normalizeTime(checkOutTime);

  if (!normalizedCheckOutTime) {
    throw new BadRequestError(
      "Giờ check-out không hợp lệ! (HH:MM hoặc HH:MM:SS)",
    );
  }

  if (Number(closingCash) < 0) {
    throw new BadRequestError("Số tiền cuối ca không hợp lệ!");
  }

  const updatedAssignment = await sequelize.transaction(async (t) => {
    const assignment = await findEmployeeAssignment(workShiftId, employeeId, t);
    const { workShift } = assignment;

    if (!assignment.checkIn) {
      throw new BadRequestError("Chưa có thời gian check-in!");
    }

    if (assignment.checkOut) {
      throw new BadRequestError("Mỗi ca chỉ được check-out một lần!");
    }

    const cashRegister = await CashRegister.findOne({
      where: { workShiftEmployeeId: assignment.id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!cashRegister) {
      throw new BadRequestError("Chưa đăng ký tiền mặt đầu ca!");
    }

    const checkOutDate = buildDateTime(
      workShift.workDate,
      normalizedCheckOutTime,
    );
    const checkInDate = new Date(assignment.checkIn);

    if (checkOutDate <= checkInDate) {
      throw new BadRequestError("Thời gian check-out phải lớn hơn check-in!");
    }

    const { completionRate, earnedWage } = calculateWageByShiftProgress(
      checkInDate,
      checkOutDate,
      workShift,
      assignment.roleInShift,
    );
    const expectedCash = Number(cashRegister.expectedCash || 0);
    const difference = Number(closingCash) - expectedCash;

    if (assignment.roleInShift === ROLE_IN_SHIFT.CASHIER) {
      const openStaffCount = await WorkShiftEmployee.count({
        where: {
          workShiftId,
          id: { [Op.ne]: assignment.id },
          checkIn: { [Op.ne]: null },
          checkOut: null,
        },
        transaction: t,
      });

      if (openStaffCount > 0) {
        throw new BadRequestError(
          "Vui lòng nhập checkout cho tất cả nhân viên trong ca trước khi chốt tiền cuối ca!",
        );
      }
    }

    await assignment.update(
      {
        checkOut: checkOutDate,
        completionRate,
        earnedWage,
      },
      { transaction: t },
    );

    await cashRegister.update(
      {
        closingCash: Number(closingCash),
        difference,
      },
      { transaction: t },
    );

    const remainingOpenAssignments = await WorkShiftEmployee.count({
      where: {
        workShiftId,
        checkIn: { [Op.ne]: null },
        checkOut: null,
      },
      transaction: t,
    });

    if (remainingOpenAssignments === 0) {
      await workShift.update(
        { shiftStatus: WORK_SHIFT_STATUS.COMPLETED },
        { transaction: t },
      );
    }

    return WorkShiftEmployee.findByPk(assignment.id, {
      include: workShiftInclude,
      transaction: t,
    });
  });

  await sendAdminNotification(
    "adm-check-out",
    "Check-out ca làm",
    `Nhân viên có id là ${employeeId} vừa check-out khỏi ${updatedAssignment.workShift.shiftName} ` +
      `ngày ${updatedAssignment.workShift.workDate}`,
  );

  return toPlainShift(updatedAssignment);
};

const getShiftAssignmentsService = async ({ employeeId, workShiftId }) => {
  await assertCashierCanManageShift({ employeeId, workShiftId });

  const assignments = await WorkShiftEmployee.findAll({
    where: { workShiftId },
    include: rosterInclude,
    order: [
      ["roleInShift", "ASC"],
      [{ model: User, as: "employee" }, "username", "ASC"],
    ],
  });

  return assignments.map(toRosterAssignment);
};

const updateShiftAssignmentTimeService = async ({
  employeeId,
  workShiftId,
  assignmentId,
  checkInTime,
  checkOutTime,
}) => {
  const normalizedCheckInTime = checkInTime ? normalizeTime(checkInTime) : null;
  const normalizedCheckOutTime = checkOutTime
    ? normalizeTime(checkOutTime)
    : null;

  if (checkInTime && !normalizedCheckInTime) {
    throw new BadRequestError(
      "Giờ check-in không hợp lệ! (HH:MM hoặc HH:MM:SS)",
    );
  }

  if (checkOutTime && !normalizedCheckOutTime) {
    throw new BadRequestError(
      "Giờ check-out không hợp lệ! (HH:MM hoặc HH:MM:SS)",
    );
  }

  const updatedAssignment = await sequelize.transaction(async (t) => {
    const cashierAssignment = await assertCashierCanManageShift({
      employeeId,
      workShiftId,
      transaction: t,
    });

    const assignment = await WorkShiftEmployee.findOne({
      where: { id: assignmentId, workShiftId },
      include: rosterInclude,
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!assignment) {
      throw new NotFoundError("Nhân viên trong ca không tồn tại!");
    }

    const { workShift } = cashierAssignment;
    const updatePayload = {};

    if (normalizedCheckInTime) {
      const checkInDate = buildDateTime(
        workShift.workDate,
        normalizedCheckInTime,
      );
      const shiftStartDate = buildDateTime(
        workShift.workDate,
        workShift.startTime,
      );
      const shiftEndDate = buildDateTime(workShift.workDate, workShift.endTime);

      if (checkInDate < shiftStartDate || checkInDate > shiftEndDate) {
        throw new BadRequestError(
          "Chỉ được nhập check-in trong khung giờ của ca làm!",
        );
      }

      updatePayload.checkIn = checkInDate;
    }

    if (normalizedCheckOutTime) {
      const checkOutDate = buildDateTime(
        workShift.workDate,
        normalizedCheckOutTime,
      );
      const checkInDate = updatePayload.checkIn || assignment.checkIn;

      if (!checkInDate) {
        throw new BadRequestError(
          "Cần nhập check-in trước khi nhập check-out!",
        );
      }

      if (checkOutDate <= new Date(checkInDate)) {
        throw new BadRequestError(
          "Thời gian check-out phải lớn hơn check-in!",
        );
      }

      updatePayload.checkOut = checkOutDate;
    }

    const finalCheckIn =
      updatePayload.checkIn !== undefined
        ? updatePayload.checkIn
        : assignment.checkIn;
    const finalCheckOut =
      updatePayload.checkOut !== undefined
        ? updatePayload.checkOut
        : assignment.checkOut;

    const wageResult = calculateWageByShiftProgress(
      finalCheckIn,
      finalCheckOut,
      workShift,
      assignment.roleInShift,
    );
    updatePayload.completionRate = wageResult.completionRate;
    updatePayload.earnedWage = wageResult.earnedWage;

    await assignment.update(updatePayload, { transaction: t });

    if (updatePayload.checkIn) {
      await markShiftInProgress(workShiftId, t);
    }

    const openAssignments = await WorkShiftEmployee.count({
      where: {
        workShiftId,
        checkIn: { [Op.ne]: null },
        checkOut: null,
      },
      transaction: t,
    });

    if (openAssignments === 0) {
      await cashierAssignment.workShift.update(
        { shiftStatus: WORK_SHIFT_STATUS.COMPLETED },
        { transaction: t },
      );
    }

    return WorkShiftEmployee.findByPk(assignmentId, {
      include: rosterInclude,
      transaction: t,
    });
  });

  return toRosterAssignment(updatedAssignment);
};

const workShiftService = {
  getWorkShiftByDateService,
  getCurrentWorkShiftService,
  updateCheckInAndCashRegisterService,
  updateCheckoutAndCashRegisterService,
  getShiftAssignmentsService,
  updateShiftAssignmentTimeService,
};

export default workShiftService;
