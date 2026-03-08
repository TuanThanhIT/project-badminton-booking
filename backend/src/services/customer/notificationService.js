import { Notification } from "../../models/index.js";
import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";

const getNotificationsService = async (data) => {
  const { userId } = data;
  const notifications = await Notification.findAll({
    where: { userId },
    attributes: ["id", "title", "message", "isRead", "type", "createdDate"],
    order: [["createdDate", "DESC"]],
  });
  return notifications;
};

const updateNotificationService = async (data) => {
  const { notificationId } = data;
  return sequelize.transaction(async (t) => {
    const notification = await Notification.findByPk(notificationId, {
      transaction: t,
    });
    if (!notification) {
      throw new NotFoundError("Thông báo không tồn tại");
    }
    if (notification.isRead === true) {
      throw new BadRequestError("Thông báo này đã đánh dấu đã đọc");
    }

    await notification.update(
      {
        isRead: true,
      },
      { transaction: t },
    );
    return notification;
  });
};

const updateAllNotificationService = async (data) => {
  const { userId } = data;

  const notifications = await Notification.findAll({
    where: { userId, isRead: false },
  });

  if (notifications.length === 0) {
    throw new BadRequestError(
      "Không có thông báo mới. Tất cả thông báo đã được đánh dấu là đã đọc",
    );
  }

  await Notification.update(
    { isRead: true },
    {
      where: {
        userId,
        isRead: false,
      },
    },
  );
};

const notificationService = {
  getNotificationsService,
  updateNotificationService,
  updateAllNotificationService,
};
export default notificationService;
