import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { logoutLocal } from "../slices/user/authSlice";
import {
  forceLogoutUser,
  isAccountLockPayload,
} from "../../utils/forceLogout";

export const authMiddleware: Middleware =
  (store) => (next) => (action: any) => {
    const result = next(action);

    if (!isRejectedWithValue(action)) {
      return result;
    }

    const status = action.payload?.statusCode;
    const message = action.payload?.message || "Có lỗi xảy ra";
    const remainingTime = action.payload?.data?.remainingTime;
    const accountLockPayload = {
      forceLogout:
        action.payload?.forceLogout ?? action.payload?.data?.forceLogout,
      accountStatus:
        action.payload?.accountStatus ?? action.payload?.data?.accountStatus,
      suspendedUntil:
        action.payload?.suspendedUntil ?? action.payload?.data?.suspendedUntil,
      suspensionReason:
        action.payload?.suspensionReason ??
        action.payload?.data?.suspensionReason,
      violationCount: action.payload?.data?.violationCount,
      message,
    };

    if (
      [403, 423].includes(status) &&
      isAccountLockPayload(accountLockPayload)
    ) {
      forceLogoutUser(accountLockPayload);
      return result;
    }

    if (!remainingTime && status !== 401 && status !== 403) {
      toast.error(message, { toastId: message });
    }

    if (
      status === 401 &&
      action.type === "auth/refreshTokenThunk/rejected"
    ) {
      toast.error(
        "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        { toastId: "session-expired" },
      );
      store.dispatch(logoutLocal());
    }

    if (status === 403) {
      toast.error(message || "Không có quyền truy cập", {
        toastId: "forbidden",
      });
    }

    return result;
  };
