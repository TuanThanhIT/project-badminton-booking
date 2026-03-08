import { Notification } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";

const getNotificationsService = async () => {
  const notifications = await Notification.findAll({
    where: { role: "EMPLOYEE" },
    attributes: ["id", "title", "message", "isRead", "type", "createdDate"],
    order: [["createdDate", "DESC"]],
  });
  return notifications;
};

const updateNotificationService = async (data) => {
  const { notificationId } = data;
  const notification = await Notification.findByPk(notificationId);
  if (!notification) {
    throw new NotFoundError("Thông báo không tồn tại");
  }
  if (notification.isRead === true) {
    throw new BadRequestError("Thông báo này đã đánh dấu đã đọc");
  }
  await notification.update({
    isRead: true,
  });
  return notification;
};

const updateAllNotificationService = async () => {
  const notifications = await Notification.findAll({
    where: { role: "EMPLOYEE", isRead: false },
  });
  if (notifications.length === 0) {
    throw new BadRequestError(
      "Không có thông báo mới. Tất cả thông báo đã được đánh dấu là đã đọc.",
    );
  }
  await Notification.update(
    { isRead: true },
    { where: { role: "EMPLOYEE", isRead: false } },
  );
};

const notificationService = {
  getNotificationsService,
  updateNotificationService,
  updateAllNotificationService,
};
export default notificationService;
