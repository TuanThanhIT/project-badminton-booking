export type NotificationResponse = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdDate: string;
};

export type NotificationListResponse = NotificationResponse[];

export type UpdateNotificationRequest = {
  notificationId: number;
};

export type UpdateNotificationResponse = {
  message: string;
};
