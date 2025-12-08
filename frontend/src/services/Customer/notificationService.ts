import {
  type NotificationListResponse,
  type UpdateNotificationRequest,
  type UpdateNotificationResponse,
} from "../../types/notification";
import instance from "../../utils/axiosCustomize";

const getNotificationsService = () =>
  instance.get<NotificationListResponse>("/user/notification/list");

const updateNotificationService = (data: UpdateNotificationRequest) => {
  const { notificationId } = data;
  return instance.patch<UpdateNotificationResponse>(
    `/user/notification/update/${notificationId}`
  );
};

const updateAllNotificationService = () =>
  instance.patch<UpdateNotificationResponse>("/user/notification/update/all");

const notificationService = {
  getNotificationsService,
  updateNotificationService,
  updateAllNotificationService,
};

export default notificationService;
