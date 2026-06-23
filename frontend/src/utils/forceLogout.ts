import { toast } from "react-toastify";
import { logoutLocal } from "../redux/slices/user/authSlice";
import { getStore } from "../redux/storeRef";
import { disconnectSocket } from "../socket";

export type AccountLockPayload = {
  forceLogout?: boolean;
  accountStatus?: string | null;
  suspendedUntil?: string | null;
  suspensionReason?: string | null;
  violationCount?: number | null;
  message?: string;
};

const LOCKED_STATUSES = ["SUSPENDED", "BANNED"];
const FORCE_LOGOUT_STORAGE_KEY = "accountForceLogout";
let logoutInProgress = false;

export const isAccountLockPayload = (payload?: AccountLockPayload | null) =>
  Boolean(
    payload?.forceLogout ||
      (payload?.accountStatus &&
        LOCKED_STATUSES.includes(payload.accountStatus)),
  );

export const forceLogoutUser = (
  payload: AccountLockPayload = {},
  options: { broadcast?: boolean; message?: string } = {},
) => {
  if (logoutInProgress) return;
  logoutInProgress = true;

  const message =
    options.message ||
    payload.message ||
    "Phiên đăng nhập đã kết thúc vì tài khoản bị khóa do vi phạm quy định cộng đồng.";

  toast.error(message, {
    toastId: "account-force-logout",
    autoClose: 4000,
  });

  try {
    getStore().dispatch(logoutLocal());
  } catch {
    localStorage.removeItem("accessToken");
  }

  disconnectSocket();
  sessionStorage.clear();

  if (options.broadcast !== false) {
    localStorage.setItem(
      FORCE_LOGOUT_STORAGE_KEY,
      JSON.stringify({ ...payload, message, timestamp: Date.now() }),
    );
  }

  window.setTimeout(() => {
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    } else {
      logoutInProgress = false;
    }
  }, 350);
};

export const getForceLogoutStorageKey = () => FORCE_LOGOUT_STORAGE_KEY;
