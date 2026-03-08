import notificationService from "../../services/employee/notificationService.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getNotificationsService();
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy tất cả thông báo thành công", notifications),
    );
});

const updateNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const data = { notificationId };
  const notification =
    await notificationService.updateNotificationService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Đánh dấu thông báo đã đọc", notification));
});

const updateAllNotification = asyncHandler(async (req, res) => {
  await notificationService.updateAllNotificationService();
  return res
    .status(200)
    .json(new SuccessResponse("Đánh dấu đã đọc tất cả thông báo"));
});

const notificationController = {
  getNotifications,
  updateNotification,
  updateAllNotification,
};
export default notificationController;
