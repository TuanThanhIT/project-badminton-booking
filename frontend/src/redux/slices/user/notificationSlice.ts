import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  GetNotificationsRequest,
  GetNotificationsResponse,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  NotificationPagination,
  NotificationResponse,
} from "../../../types/notification";
import type { ApiErrorType } from "../../../types/error";
import notificationService from "../../../services/user/notificationService";

interface NotificationState {
  notifications: NotificationResponse[];
  pagination?: NotificationPagination;
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  pagination: undefined,
  unreadCount: 0,
  loading: false,
};

export const getNotifications = createAsyncThunk<
  GetNotificationsResponse,
  { data: GetNotificationsRequest },
  { rejectValue: ApiErrorType }
>("notification/getNotifications", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await notificationService.getNotificationsService(data);
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const markNotificationRead = createAsyncThunk<
  MarkNotificationReadResponse,
  { notificationId: number },
  { rejectValue: ApiErrorType }
>(
  "notification/markNotificationRead",
  async ({ notificationId }, { rejectWithValue }) => {
    try {
      const res =
        await notificationService.markNotificationReadService(notificationId);
      return res.data;
    } catch (error) {
      return rejectWithValue(error as ApiErrorType);
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk<
  MarkAllNotificationsReadResponse,
  void,
  { rejectValue: ApiErrorType }
>("notification/markAllNotificationsRead", async (_, { rejectWithValue }) => {
  try {
    const res = await notificationService.markAllNotificationsReadService();
    return res.data;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addLocalNotification(
      state,
      action: PayloadAction<{ notification: NotificationResponse }>,
    ) {
      const notification = action.payload.notification;
      const existed = state.notifications.some((n) => n.id === notification.id);

      if (!existed) {
        state.notifications.unshift(notification);
        if (!notification.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    markLocalNotificationRead(state, action: PayloadAction<number>) {
      const notification = state.notifications.find(
        (item) => item.id === action.payload,
      );

      if (notification) {
        if (!notification.isRead && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
        notification.isRead = true;
      }
    },
    markAllLocalNotificationsRead(state) {
      state.notifications = state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));
      state.unreadCount = 0;
    },
    clearLocalNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
      state.pagination = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data.items;
        state.pagination = action.payload.data.pagination;
        state.unreadCount = action.payload.data.unreadCount;
      })
      .addCase(getNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notificationId = action.meta.arg.notificationId;
        const notification = state.notifications.find(
          (item) => item.id === notificationId,
        );

        if (notification && !notification.isRead && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }

        if (notification) {
          notification.isRead = true;
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }));
        state.unreadCount = 0;
      });
  },
});

export const {
  addLocalNotification,
  markLocalNotificationRead,
  markAllLocalNotificationsRead,
  clearLocalNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
