import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import { logout, logoutLocal } from "../slices/user/authSlice";
import { toast } from "react-toastify";
import type { AppDispatch } from "../store";

export const authMiddleware: Middleware =
  (store) => (next) => (action: any) => {
    const result = next(action);
    const dispatch = store.dispatch as AppDispatch;

    if (isRejectedWithValue(action)) {
      const status = action.payload?.statusCode;
      const message = action.payload?.message || "Something went wrong";
      const remainingTime = action.payload?.data?.remainingTime;

      if (!remainingTime && status !== 401) {
        toast.error(message, { toastId: message });
      }

      if (status === 401 && action.type === "auth/refreshTokenThunk/rejected") {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        dispatch(logoutLocal());
        dispatch(logout());
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }

    return result;
  };
