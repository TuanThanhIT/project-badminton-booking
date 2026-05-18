import { Notification } from "../models/index.js";
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
  createdDate: notify.createdDate,
});

export const sendUserNotification = async (userId, type, title, message) => {
  const notify = await Notification.create({
    userId,
    type,
    title,
    message,
  });

  const payload = buildNotificationPayload(notify);

  emitNotificationToUser(userId, payload);

  return notify;
};

export const sendEmployeesNotification = async (type, title, message) => {
  const notify = await Notification.create({
    role: ROLE_NAME.EMPLOYEE,
    type,
    title,
    message,
  });

  const payload = buildNotificationPayload(notify);

  emitNotificationToRole(ROLE_NAME.EMPLOYEE, payload);

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

  emitNotificationToRole(ROLE_NAME.ADMIN, payload);

  return notify;
};
