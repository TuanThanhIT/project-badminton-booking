import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import { logout } from "../slices/user/authSlice";
import { toast } from "react-toastify";

export const authMiddleware: Middleware =
  (store) => (next) => (action: any) => {
    if (isRejectedWithValue(action)) {
      // bắt tất cả action bị reject từ createAsyncThunk
      const status = action.payload.statusCode;

      const message = action.payload.message || "Something went wrong";

      toast.error(message, { toastId: message });
      console.log("error>>", action.payload);

      // xử lý global
      if (status === 401) {
        console.log("Token hết hạn -> logout");
        store.dispatch(logout());
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    }

    return next(action);
  };
