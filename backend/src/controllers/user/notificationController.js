import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import notificationService from "../../services/notificationService.js";

const getMyNotificationsController = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotificationsService({
    ...req.query,
    userId: req.user.id,
    role: req.user.role,
  });

  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách thông báo thành công", result));
});

const markNotificationReadController = asyncHandler(async (req, res) => {
  const result = await notificationService.markNotificationReadService({
    notificationId: Number(req.params.notificationId),
    userId: req.user.id,
    role: req.user.role,
  });

  return res
    .status(200)
    .json(new SuccessResponse("Đã đánh dấu thông báo là đã đọc", result));
});

const markAllNotificationsReadController = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsReadService({
    userId: req.user.id,
    role: req.user.role,
  });

  return res
    .status(200)
    .json(new SuccessResponse("Đã đánh dấu tất cả thông báo là đã đọc", result));
});

const notificationController = {
  getMyNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
};

export default notificationController;
