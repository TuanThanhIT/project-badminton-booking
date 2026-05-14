import instance from "../../utils/axiosCustomize";
import type {
  GetNotificationsRequest,
  GetNotificationsResponse,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
} from "../../types/notification";

const getNotificationsService = (data: GetNotificationsRequest) =>
  instance.get<GetNotificationsResponse>("/user/notifications", {
    params: data,
  });

const markNotificationReadService = (notificationId: number) =>
  instance.patch<MarkNotificationReadResponse>(
    `/user/notifications/${notificationId}/read`,
  );

const markAllNotificationsReadService = () =>
  instance.patch<MarkAllNotificationsReadResponse>(
    "/user/notifications/read-all",
  );

const notificationService = {
  getNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService,
};

export default notificationService;
