import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import notificationService from "../../services/admin/notificationService.js";

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
    .json(
      new SuccessResponse("Thông báo này đã đánh dấu đã đọc", notification),
    );
});

const updateAllNotification = asyncHandler(async (req, res) => {
  await notificationService.updateAllNotificationService();
  return res
    .status(200)
    .json(
      new SuccessResponse("Đã xác nhận đọc tất cả thông báo", notifications),
    );
});

const notificationController = {
  getNotifications,
  updateNotification,
  updateAllNotification,
};
export default notificationController;
