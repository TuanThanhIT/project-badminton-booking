import { Heart, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

type ProfileHeroBannerProps = {
  displayName: string;
  username: string;
  postCount: number;
  /** Tổng like / comment trên các bài (tính từ danh sách bài client) */
  stats?: { likes: number; comments: number };
  avatarUrl: string;
  avatarLetter: string;
  avatarLoadError: boolean;
  onAvatarImgError: () => void;
  /** Nút máy ảnh / đổi ảnh (chỉ trang profile riêng) */
  avatarOverlay?: ReactNode;
  /** Ví dụ nút Nhắn tin (trang public) */
  trailingActions?: ReactNode;
  /** Vòng quanh ảnh khi đang upload */
  avatarBusy?: boolean;
};

/**
 * Banner + avatar đồng bộ giữa ProfilePage và PublicProfilePage.
 */
const ProfileHeroBanner = ({
  displayName,
  username,
  postCount,
  stats,
  avatarUrl,
  avatarLetter,
  avatarLoadError,
  onAvatarImgError,
  avatarOverlay,
  trailingActions,
  avatarBusy,
}: ProfileHeroBannerProps) => {
  return (
    <div className="relative">
      <div
        className="h-28 sm:h-36 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-emerald-600 shadow-md"
        aria-hidden
      />
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 px-2 sm:px-2 -mt-8 sm:-mt-6 relative z-10">
        <div className="flex justify-center sm:justify-start sm:pl-2">
          <div className="relative shrink-0">
            <div
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl ring-4 ring-white shadow-xl overflow-hidden bg-gradient-to-br from-sky-100 to-emerald-50 ${
                avatarBusy ? "opacity-80 ring-sky-300" : ""
              }`}
            >
              {avatarUrl.trim() && !avatarLoadError ? (
                <img
                  src={avatarUrl.trim()}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={onAvatarImgError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sky-700 font-bold text-4xl">
                  {avatarLetter}
                </div>
              )}
            </div>
            {avatarOverlay}
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left pb-1 sm:pb-3 min-w-0 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
              {displayName}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              @{username}
              <span className="mx-2 text-gray-300">·</span>
              <span className="text-sky-700 font-medium">{postCount} bài đăng</span>
            </p>
            {stats != null && (
              <p className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />
                  <span className="tabular-nums font-medium">{stats.likes}</span> lượt thích
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-sky-600" strokeWidth={2} />
                  <span className="tabular-nums font-medium">{stats.comments}</span> bình luận
                </span>
              </p>
            )}
          </div>
          {trailingActions ? (
            <div className="flex justify-center sm:justify-end shrink-0">{trailingActions}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeroBanner;
