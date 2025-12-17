import notificationService from "../../services/admin/notificationService.js";

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotificationsService();
    return res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

const updateNotification = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    await notificationService.updateNotificationService(notificationId);
    return res.status(200).json({ message: "Thông báo này đã đọc!" });
  } catch (error) {
    next(error);
  }
};

const updateAllNotification = async (req, res, next) => {
  try {
    await notificationService.updateAllNotificationService();
    return res
      .status(200)
      .json({ message: "Đã xác nhận đọc tất cả thông báo!" });
  } catch (error) {
    next(error);
  }
};

const notificationController = {
  getNotifications,
  updateNotification,
  updateAllNotification,
};
export default notificationController;
