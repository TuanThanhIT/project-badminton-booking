import { BranchEmployee, BranchManager, Notification } from "../models/index.js";
import {
  emitNotificationToRole,
  emitNotificationToUser,
} from "../socket/emitter.js";
import { ROLE_NAME } from "../constants/userConstant.js";

const buildNotificationPayload = (notify) => ({
  id: notify.id,
  type: notify.type,
  title: notify.title,
  message: notify.message,
  isRead: notify.isRead,
  createdAt: notify.createdAt,
});

const runAfterCommit = (transaction, callback) => {
  if (transaction?.afterCommit) {
    transaction.afterCommit(callback);
    return;
  }

  callback();
};

const emitSafely = (callback) => {
  try {
    callback();
  } catch (error) {
    console.error("Emit notification failed:", error.message);
  }
};

export const sendUserNotification = async (
  userId,
  type,
  title,
  message,
  options = {},
) => {
  const notify = await Notification.create(
    {
      userId,
      type,
      title,
      message,
    },
    { transaction: options.transaction },
  );

  const payload = buildNotificationPayload(notify);

  runAfterCommit(options.transaction, () =>
    emitSafely(() => emitNotificationToUser(userId, payload)),
  );

  return notify;
};

export const sendBranchEmployeesNotification = async (
  branchId,
  type,
  title,
  message,
  options = {},
) => {
  const branchEmployees = await BranchEmployee.findAll({
    where: { branchId },
    attributes: ["employeeId"],
    transaction: options.transaction,
  });

  const employeeIds = [
    ...new Set(branchEmployees.map((item) => item.employeeId).filter(Boolean)),
  ];

  if (!employeeIds.length) {
    return [];
  }

  return Promise.all(
    employeeIds.map((employeeId) =>
      sendUserNotification(employeeId, type, title, message, options),
    ),
  );
};

export const sendBranchManagersNotification = async (
  branchId,
  type,
  title,
  message,
  options = {},
) => {
  const branchManagers = await BranchManager.findAll({
    where: { branchId, isActive: true },
    attributes: ["managerId"],
    transaction: options.transaction,
  });

  const managerIds = [
    ...new Set(branchManagers.map((item) => item.managerId).filter(Boolean)),
  ];

  if (!managerIds.length) {
    return [];
  }

  return Promise.all(
    managerIds.map((managerId) =>
      sendUserNotification(managerId, type, title, message, options),
    ),
  );
};

export const sendBranchStaffNotification = async (
  branchId,
  type,
  title,
  message,
  options = {},
) => {
  const employees = await sendBranchEmployeesNotification(
    branchId,
    type,
    title,
    message,
    options,
  );
  const managers = await sendBranchManagersNotification(
    branchId,
    type,
    title,
    message,
    options,
  );

  return [...employees, ...managers];
};

export const sendEmployeesNotification = async (type, title, message) => {
  const notify = await Notification.create({
    role: ROLE_NAME.EMPLOYEE,
    type,
    title,
    message,
  });

  const payload = buildNotificationPayload(notify);

  emitSafely(() => emitNotificationToRole(ROLE_NAME.EMPLOYEE, payload));

  return notify;
};

export const sendAdminNotification = async (type, title, message) => {
  const notify = await Notification.create({
    role: ROLE_NAME.ADMIN,
    type,
    title,
    message,
  });

  const payload = buildNotificationPayload(notify);

  emitSafely(() => emitNotificationToRole(ROLE_NAME.ADMIN, payload));

  return notify;
};
