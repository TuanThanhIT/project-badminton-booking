import {
  type NotificationListResponse,
  type UpdateNotificationRequest,
  type UpdateNotificationResponse,
} from "../../types/notification";
import instance from "../../utils/axiosCustomize";

const getNotificationsService = () =>
  instance.get<NotificationListResponse>("/employee/notification/list");

const updateNotificationService = (data: UpdateNotificationRequest) => {
  const { notificationId } = data;
  return instance.patch<UpdateNotificationResponse>(
    `/employee/notification/update/${notificationId}`
  );
};

const updateAllNotificationService = () =>
  instance.patch<UpdateNotificationResponse>(
    "/employee/notification/update/all"
  );

const notificationService = {
  getNotificationsService,
  updateNotificationService,
  updateAllNotificationService,
};

export default notificationService;
