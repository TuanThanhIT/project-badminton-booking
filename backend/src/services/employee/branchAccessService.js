import ForbiddenError from "../../errors/ForbiddenError.js";
import { ROLE_IN_SHIFT } from "../../constants/workShiftConstant.js";
import {
  BranchEmployee,
  WorkShift,
  WorkShiftEmployee,
} from "../../models/index.js";

export const getEmployeeBranchIds = async (employeeId, transaction) => {
  const branchEmployees = await BranchEmployee.findAll({
    where: { employeeId },
    attributes: ["branchId"],
    transaction,
  });

  const assignedShiftBranches = await WorkShiftEmployee.findAll({
    where: { employeeId },
    attributes: [],
    include: [
      {
        model: WorkShift,
        as: "workShift",
        attributes: ["branchId"],
        required: true,
      },
    ],
    transaction,
  });

  return [
    ...new Set([
      ...branchEmployees.map((item) => item.branchId),
      ...assignedShiftBranches.map((item) => item.workShift.branchId),
    ]),
  ];
};

export const assertEmployeeCanAccessBranch = async ({
  employeeId,
  branchId,
  transaction,
}) => {
  const branchIds = await getEmployeeBranchIds(employeeId, transaction);

  if (!branchIds.includes(Number(branchId))) {
    throw new ForbiddenError("Nhân viên không thuộc chi nhánh này.");
  }

  return branchIds;
};

export const getActiveCashierBranchIds = async (employeeId, transaction) => {
  const activeAssignments = await WorkShiftEmployee.findAll({
    where: {
      employeeId,
      roleInShift: ROLE_IN_SHIFT.CASHIER,
      checkOut: null,
    },
    attributes: ["checkIn"],
    include: [
      {
        model: WorkShift,
        as: "workShift",
        attributes: ["branchId"],
        required: true,
      },
    ],
    transaction,
  });

  return [
    ...new Set(
      activeAssignments
        .filter((item) => item.checkIn)
        .map((item) => Number(item.workShift.branchId)),
    ),
  ];
};

export const assertEmployeeActiveCashierForBranch = async ({
  employeeId,
  branchId,
  transaction,
}) => {
  const branchIds = await getActiveCashierBranchIds(employeeId, transaction);

  if (!branchIds.includes(Number(branchId))) {
    throw new ForbiddenError(
      "Nhân viên cần check-in đúng ca thu ngân của chi nhánh này trước khi thao tác.",
    );
  }

  return branchIds;
};
