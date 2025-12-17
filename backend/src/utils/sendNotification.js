import { Notification } from "../models/index.js";
import { notifyAdmin, notifyEmployees, notifyUser } from "../socket/emitter.js";

export const sendUserNotification = async (userId, type, title, message) => {
  const notify = await Notification.create({
    userId,
    type,
    title,
    message,
  });

  notifyUser(userId, type, {
    id: notify.id,
    title: notify.title,
    message: notify.message,
    isRead: notify.isRead,
    createdDate: notify.createdDate,
  });
};

export const sendEmployeesNotification = async (title, message, role, type) => {
  const notify = await Notification.create({
    title,
    message,
    role,
    type,
  });

  notifyEmployees(type, {
    id: notify.id,
    title: notify.title,
    message: notify.message,
    isRead: notify.isRead,
    createdDate: notify.createdDate,
  });
};

export const sendAdminNotification = async (title, message, role, type) => {
  const notify = await Notification.create({
    title,
    message,
    role,
    type,
  });

  notifyAdmin(type, {
    id: notify.id,
    title: notify.title,
    message: notify.message,
    isRead: notify.isRead,
    createdDate: notify.createdDate,
  });
};
