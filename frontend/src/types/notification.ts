export type NotificationResponse = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
};

export type NotificationListResponse = NotificationResponse[];

export type NotificationPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetNotificationsRequest = {
  page?: number;
  limit?: number;
};

export type GetNotificationsResponse = {
  success: boolean;
  message: string;
  data: {
    items: NotificationResponse[];
    unreadCount: number;
    pagination: NotificationPagination;
  };
};

export type UpdateNotificationRequest = {
  notificationId: number;
};

export type UpdateNotificationResponse = {
  message: string;
};

export type MarkNotificationReadResponse = {
  success: boolean;
  message: string;
  data: NotificationResponse | null;
};

export type MarkAllNotificationsReadResponse = {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
};
