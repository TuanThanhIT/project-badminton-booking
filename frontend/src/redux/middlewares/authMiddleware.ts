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

      // không spam toast khi token sắp refresh
      if (!remainingTime && status !== 401 && status !== 403) {
        toast.error(message, {
          toastId: message,
        });
      }

      // =========================
      // 401 - TOKEN HẾT HẠN
      // =========================
      if (status === 401) {
        // chỉ logout khi refresh token fail
        if (action.type === "auth/refreshTokenThunk/rejected") {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.", {
            toastId: "session-expired",
          });

          dispatch(logoutLocal());
          dispatch(logout());
        }
      }

      // =========================
      // 403 - KHÔNG CÓ QUYỀN
      // =========================
      if (status === 403) {
        toast.error(message || "Không có quyền truy cập", {
          toastId: "forbidden",
        });

        // clear local auth
        dispatch(logoutLocal());

        // optional call api logout
        dispatch(logout());
      }
    }

    return result;
  };
