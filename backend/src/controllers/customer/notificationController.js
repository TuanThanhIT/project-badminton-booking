import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import notificationService from "../../services/customer/notificationService.js";

const getNotifications = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  const notifications = await notificationService.getNotificationsService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy danh sách thông báo thành công", notifications),
    );
});

const updateNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const data = { notificationId };
  const notification =
    await notificationService.updateNotificationService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Thông báo này đánh dấu đã đọc", notification));
});

const updateAllNotification = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  await notificationService.updateAllNotificationService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Đã xác nhận đọc tất cả thông báo"));
});

const notificationController = {
  getNotifications,
  updateNotification,
  updateAllNotification,
};
export default notificationController;
