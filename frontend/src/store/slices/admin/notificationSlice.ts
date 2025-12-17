import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  NotificationListResponse,
  NotificationResponse,
  UpdateNotificationRequest,
  UpdateNotificationResponse,
} from "../../../types/notification";
import _ from "lodash";
import notificationService from "../../../services/admin/notificationService";

interface NotificationState {
  notifications: NotificationListResponse;
  message: string | undefined;
  loading: boolean;
  error: string | undefined;
}

const initialState: NotificationState = {
  notifications: [],
  message: undefined,
  loading: false,
  error: undefined,
};

export const getNotifications = createAsyncThunk<
  NotificationListResponse,
  void,
  { rejectValue: ApiErrorType }
>("notification/getNotifications", async (_, { rejectWithValue }) => {
  try {
    const res = await notificationService.getNotificationsService();
    return res.data as NotificationListResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateNotification = createAsyncThunk<
  UpdateNotificationResponse,
  { data: UpdateNotificationRequest },
  { rejectValue: ApiErrorType }
>("notification/updateNotification", async ({ data }, { rejectWithValue }) => {
  try {
    const res = await notificationService.updateNotificationService(data);
    return res.data as UpdateNotificationResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateAllNotification = createAsyncThunk<
  UpdateNotificationResponse,
  void,
  { rejectValue: ApiErrorType }
>("notification/updateAllNotification", async (_, { rejectWithValue }) => {
  try {
    const res = await notificationService.updateAllNotificationService();
    return res.data as UpdateNotificationResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearNotificationError(state) {
      state.error = undefined;
    },
    addLocalNotification(
      state,
      action: PayloadAction<{ notification: NotificationResponse }>
    ) {
      const notifications = state.notifications;
      const notification = action.payload.notification;
      notifications.unshift(notification);
    },
    updateLocalNotification(
      state,
      action: PayloadAction<{ notificationId: number }>
    ) {
      const { notificationId } = action.payload;

      const index = state.notifications.findIndex(
        (n) => n.id === notificationId
      );
      if (index !== -1) {
        state.notifications[index].isRead = true;
      }
    },
    resetUpdateLocalNotification(
      state,
      action: PayloadAction<{ notificationId: number }>
    ) {
      const { notificationId } = action.payload;

      const index = state.notifications.findIndex(
        (n) => n.id === notificationId
      );
      if (index !== -1) {
        state.notifications[index].isRead = false;
      }
    },
    updateAllLocalNotification(state) {
      state.notifications = state.notifications.map((n) => {
        return {
          ...n,
          isRead: true,
        };
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // getNotifications
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.loading = false;
      })

      // updateNotification
      .addCase(updateNotification.fulfilled, (state, action) => {
        state.message = action.payload.message;
      })
      .addCase(updateNotification.rejected, (state, action) => {
        state.error = action.payload?.userMessage;
      })

      // updateAllNotification
      .addCase(updateAllNotification.fulfilled, (state, action) => {
        state.message = action.payload.message;
      })
      .addCase(updateAllNotification.rejected, (state, action) => {
        state.error = action.payload?.userMessage;
      });
  },
});
export const {
  clearNotificationError,
  addLocalNotification,
  updateLocalNotification,
  resetUpdateLocalNotification,
  updateAllLocalNotification,
} = notificationSlice.actions;
export default notificationSlice.reducer;
