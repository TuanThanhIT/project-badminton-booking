import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Notification } from "../../models/index.js";

const getNotificationsService = async (userId) => {
  try {
    const notifications = await Notification.findAll({
      where: { role: "EMPLOYEE" },
      attributes: ["id", "title", "message", "isRead", "type", "createdDate"],
      order: [["createdDate", "DESC"]],
    });
    return notifications;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateNotificationService = async (notificationId) => {
  try {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Thông báo không tồn tại");
    }
    if (notification.isRead === true) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Thông báo này đã đánh dấu đã đọc!"
      );
    }
    await notification.update({
      isRead: true,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateAllNotificationService = async (userId) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId, isRead: false },
    });
    if (notifications.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Không có thông báo mới. Tất cả thông báo đã được đánh dấu là đã đọc!"
      );
    } else {
      await Notification.update(
        { isRead: true },
        { where: { role: "EMPLOYEE", isRead: false } }
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const notificationService = {
  getNotificationsService,
  updateNotificationService,
  updateAllNotificationService,
};
export default notificationService;
