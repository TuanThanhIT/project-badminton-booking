import { toast } from "react-toastify";
import type { CreatePostModeration, CreatePostViolation } from "../types/post";
import { getCreatePostModerationToast } from "./moderationLabels";
import {
  forceLogoutUser,
  isAccountLockPayload,
} from "./forceLogout";

const showAccountViolationToast = (
  violation?: CreatePostViolation | null,
) => {
  if (!violation?.accountStatus) return;

  if (violation.accountStatus === "WARNING") {
    toast.warning(
      `Tài khoản của bạn đã có ${violation.violationCount || 0} lần vi phạm. Nếu tiếp tục vi phạm, tài khoản có thể bị khóa.`,
      { toastId: "account-violation-warning" },
    );
    return;
  }

  if (isAccountLockPayload(violation)) {
    forceLogoutUser(violation, {
      message:
        "Tài khoản của bạn đã bị khóa do vi phạm quy định cộng đồng. Bạn sẽ được đăng xuất. Vui lòng kiểm tra email để biết thêm chi tiết.",
    });
  }
};

export const showCreatePostModerationToast = (
  moderation?: CreatePostModeration | null,
  violation?: CreatePostViolation | null,
) => {
  const result = getCreatePostModerationToast(moderation);
  toast[result.type](result.message);
  showAccountViolationToast(violation);
};

export const showCreatePostErrorToast = (error: unknown) => {
  const apiError = error as any;
  const responseData = apiError?.response?.data || apiError;
  const data = responseData?.data || responseData;
  const moderation = data?.moderation as CreatePostModeration | undefined;
  const violation = data?.violation as CreatePostViolation | undefined;

  if (moderation) {
    showCreatePostModerationToast(moderation, violation);
    return;
  }

  if (isAccountLockPayload(data)) {
    forceLogoutUser({
      ...data,
      message: responseData?.message,
    });
    return;
  }

  toast.error(
    responseData?.message ||
      "Đăng bài thất bại. Vui lòng thử lại.",
  );
};
