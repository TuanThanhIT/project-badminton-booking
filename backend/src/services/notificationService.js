export {
  sendAdminNotification,
  sendBranchEmployeesNotification,
  sendBranchManagersNotification,
  sendBranchStaffNotification,
  sendEmployeesNotification,
  sendUserNotification,
} from "../helpers/notification.js";

import { Op } from "sequelize";
import { Notification } from "../models/index.js";

const normalizeNotificationTitle = (title) => {
  if (title === "Thong bao demo B-Hub") return "Thông báo demo B-Hub";
  return title || "";
};

const normalizeNotificationMessage = (message) => {
  if (!message) return "";
  if (/Thong bao ve booking, order, chat hoac lop hoc/i.test(message)) {
    return "Thông báo demo về đặt sân, đơn hàng, tin nhắn hoặc lớp học.";
  }
  return message;
};

const formatNotification = (notify) => ({
  id: notify.id,
<<<<<<< HEAD
  title: notify.title,
  message: notify.message,
=======
  title: normalizeNotificationTitle(notify.title),
  message: normalizeNotificationMessage(notify.message),
>>>>>>> Branch_Nam_ML
  isRead: notify.isRead,
  type: notify.type,
  createdAt: notify.createdAt,
});

const getUserNotificationsService = async ({
  userId,
  role,
  page = 1,
  limit = 10,
}) => {
  const offset = (Number(page) - 1) * Number(limit);

  const where = {
    [Op.or]: [{ userId }],
  };

  if (role) {
    where[Op.or].push({ role });
  }

  const { rows, count } = await Notification.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: Number(limit),
    offset,
    distinct: true,
  });

  const unreadCount = await Notification.count({
    where: {
      ...where,
      isRead: false,
    },
  });

  return {
    items: rows.map(formatNotification),
    unreadCount,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / Number(limit)),
    },
  };
};

const markNotificationReadService = async ({ notificationId, userId, role }) => {
  const notification = await Notification.findOne({
    where: {
      id: notificationId,
      [Op.or]: role ? [{ userId }, { role }] : [{ userId }],
    },
  });

  if (!notification) {
    return null;
  }

  await notification.update({ isRead: true });

  return formatNotification(notification);
};

const markAllNotificationsReadService = async ({ userId, role }) => {
  const where = {
    [Op.or]: [{ userId }],
    isRead: false,
  };

  if (role) {
    where[Op.or].push({ role });
  }

  await Notification.update({ isRead: true }, { where });

  return {
    message: "Đã đánh dấu tất cả thông báo là đã đọc",
  };
};

const notificationService = {
  getUserNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService,
};

export default notificationService;
