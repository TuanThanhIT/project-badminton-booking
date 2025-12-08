import notificationService from "../../services/customer/notificationService.js";

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await notificationService.getNotificationsService(
      userId
    );
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
    const userId = req.user.id;
    await notificationService.updateAllNotificationService(userId);
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
