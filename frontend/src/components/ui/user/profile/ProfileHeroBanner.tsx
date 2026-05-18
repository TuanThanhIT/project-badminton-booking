import { Heart, MessageCircle, FileText, Trophy } from "lucide-react";
import type { ReactNode } from "react";

type ProfileHeroBannerProps = {
  displayName: string;
  username: string;
  postCount: number;
  /** Tổng like / comment trên các bài */
  stats?: { likes: number; comments: number };
  avatarUrl: string;
  avatarLetter: string;
  avatarLoadError: boolean;
  onAvatarImgError: () => void;
  /** Nút máy ảnh / đổi ảnh */
  avatarOverlay?: ReactNode;
  /** Ví dụ nút Nhắn tin */
  trailingActions?: ReactNode;
  /** Vòng quanh ảnh khi đang upload */
  avatarBusy?: boolean;
  /** Trình độ cầu lông */
  levelLabel?: string;
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
  levelLabel,
}: ProfileHeroBannerProps) => {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
      {/* COVER */}
      <div className="relative h-36 overflow-hidden bg-sky-900 sm:h-44">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_36%)]" />
        <div className="absolute right-0 top-0 h-full w-1/3 translate-x-16 skew-x-12 bg-sky-800/30" />

        <div className="absolute left-5 top-5 sm:left-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
            <Trophy size={15} className="text-sky-200" />
            Hồ sơ B-Hub Player
          </div>
        </div>
      </div>

      {/* INFO CARD */}
      <div className="relative px-4 pb-5 sm:px-7 sm:pb-7">
        <div className="-mt-12 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.10)] sm:-mt-14 sm:p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:text-left">
              {/* AVATAR */}
              <div className="relative shrink-0">
                <div
                  className={`h-28 w-28 overflow-hidden rounded-[1.5rem] border-4 border-white bg-sky-50 shadow-[0_10px_28px_rgba(15,23,42,0.16)] sm:h-32 sm:w-32 ${
                    avatarBusy ? "opacity-80 ring-4 ring-sky-200" : ""
                  }`}
                >
                  {avatarUrl.trim() && !avatarLoadError ? (
                    <img
                      src={avatarUrl.trim()}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={onAvatarImgError}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-sky-700">
                      {avatarLetter}
                    </div>
                  )}
                </div>

                {avatarOverlay}
              </div>

              {/* TEXT */}
              <div className="min-w-0 text-center sm:text-left">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  {displayName}
                </h1>

                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600 sm:justify-start">
                  <span className="font-medium">@{username}</span>

                  <span className="h-1 w-1 rounded-full bg-slate-300" />

                  <span className="inline-flex items-center gap-1 font-medium text-sky-700">
                    <FileText size={14} />
                    {postCount} bài đăng
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {levelLabel && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-800">
                      🏸 {levelLabel}
                    </span>
                  )}

                  {stats != null && (
                    <>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700">
                        <Heart className="h-3.5 w-3.5" strokeWidth={2} />
                        <span className="tabular-nums">{stats.likes}</span>
                        lượt thích
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-800">
                        <MessageCircle
                          className="h-3.5 w-3.5"
                          strokeWidth={2}
                        />
                        <span className="tabular-nums">{stats.comments}</span>
                        bình luận
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {trailingActions ? (
              <div className="flex justify-center sm:justify-end">
                {trailingActions}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeroBanner;
