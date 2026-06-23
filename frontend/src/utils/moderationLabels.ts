import type {
  AccountStatus,
  ModerationAction,
  ModerationLabel,
  ModerationStatus,
} from "../types/admin";

export const MODERATION_STATUS_LABEL: Record<ModerationStatus, string> = {
  PENDING: "Đang chờ xử lý",
  APPROVED: "Đã duyệt",
  REVIEW_REQUIRED: "Chờ kiểm duyệt",
  REJECTED: "Đã từ chối",
};

export const MODERATION_LABEL_TEXT: Record<ModerationLabel, string> = {
  normal: "Bình thường",
  spam: "Spam",
  unauthorized_ad: "Quảng cáo trái phép",
  offensive: "Xúc phạm/công kích",
};

export const MODERATION_ACTION_LABEL: Record<ModerationAction, string> = {
  ALLOW: "Cho phép",
  REVIEW: "Cần duyệt",
  BLOCK: "Chặn",
};

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  ACTIVE: "Hoạt động",
  WARNING: "Cảnh báo",
  SUSPENDED: "Tạm khóa",
  BANNED: "Đã khóa",
};

export const MODERATION_STATUS_BADGE_CLASS: Record<ModerationStatus, string> = {
  PENDING: "border-sky-200 bg-sky-50 text-sky-700",
  APPROVED: "border-green-200 bg-green-50 text-green-700",
  REVIEW_REQUIRED: "border-amber-200 bg-amber-50 text-amber-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
};

export const MODERATION_LABEL_BADGE_CLASS: Record<ModerationLabel, string> = {
  normal: "border-green-200 bg-green-50 text-green-700",
  spam: "border-red-200 bg-red-50 text-red-700",
  unauthorized_ad: "border-orange-200 bg-orange-50 text-orange-700",
  offensive: "border-rose-300 bg-rose-50 text-rose-800",
};

export const ACCOUNT_STATUS_BADGE_CLASS: Record<AccountStatus, string> = {
  ACTIVE: "border-green-200 bg-green-50 text-green-700",
  WARNING: "border-amber-200 bg-amber-50 text-amber-700",
  SUSPENDED: "border-red-200 bg-red-50 text-red-700",
  BANNED: "border-rose-300 bg-rose-50 text-rose-800",
};

export const formatModerationConfidence = (value?: number | null) =>
  value == null ? "Không có" : `${(Number(value) * 100).toFixed(1)}%`;

export const getCreatePostModerationToast = (
  moderation?: {
    status?: ModerationStatus;
    reason?: string | null;
  } | null,
) => {
  if (moderation?.status === "REVIEW_REQUIRED") {
    return {
      type: "warning" as const,
      message:
        "Bài viết đã được ghi nhận và đang chờ quản trị viên duyệt. Bài sẽ hiển thị sau khi được duyệt.",
    };
  }

  if (moderation?.status === "REJECTED") {
    return {
      type: "warning" as const,
      message: `Bài viết đã được ghi nhận nhưng bị từ chối do vi phạm quy định cộng đồng: ${
        moderation.reason || "Nội dung vi phạm quy định cộng đồng."
      }`,
    };
  }

  return {
    type: "success" as const,
    message: "Tạo bài viết thành công.",
  };
};
