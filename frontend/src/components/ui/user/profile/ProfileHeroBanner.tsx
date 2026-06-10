import {
  FileText,
  GraduationCap,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
} from "lucide-react";
import type { ReactNode } from "react";

type ReactionKey = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY";

type ProfileStats = {
  likes: number;
  comments: number;
  shares: number;
  reactions?: Partial<Record<ReactionKey, number>>;
};

type ProfileHeroBannerProps = {
  displayName: string;
  username: string;
  postCount: number;
  stats?: ProfileStats;
  avatarUrl: string;
  avatarLetter: string;
  avatarLoadError: boolean;
  onAvatarImgError: () => void;
  avatarOverlay?: ReactNode;
  trailingActions?: ReactNode;
  avatarBusy?: boolean;
  levelLabel?: string;
  isCoach?: boolean;
  coachExperienceYears?: number;
};

const reactionMeta: Record<ReactionKey, { icon: string; label: string }> = {
  LIKE: { icon: "\u{1F44D}", label: "Thích" },
  LOVE: { icon: "\u2764\uFE0F", label: "Yêu thích" },
  HAHA: { icon: "\u{1F606}", label: "Haha" },
  WOW: { icon: "\u{1F62E}", label: "Wow" },
  SAD: { icon: "\u{1F622}", label: "Buồn" },
  ANGRY: { icon: "\u{1F621}", label: "Phẫn nộ" },
};

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
  isCoach = false,
  coachExperienceYears,
}: ProfileHeroBannerProps) => {
  const reactionEntries = Object.entries(stats?.reactions ?? {})
    .filter((entry): entry is [ReactionKey, number] => Number(entry[1]) > 0)
    .sort((a, b) => b[1] - a[1]);

  const statCards = [
    {
      label: "Bài đăng",
      value: postCount,
      icon: FileText,
      className: "border-sky-100 bg-sky-50 text-sky-700",
    },
    {
      label: "Lượt thích",
      value: stats?.likes ?? 0,
      icon: Heart,
      className: "border-rose-100 bg-rose-50 text-rose-700",
    },
    {
      label: "Bình luận",
      value: stats?.comments ?? 0,
      icon: MessageCircle,
      className: "border-cyan-100 bg-cyan-50 text-cyan-700",
    },
    {
      label: "Chia sẻ",
      value: stats?.shares ?? 0,
      icon: Share2,
      className: "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
      <div
        className={`relative h-36 overflow-hidden sm:h-44 ${
          isCoach ? "bg-slate-950" : "bg-sky-900"
        }`}
      >
        <div
          className={`absolute inset-0 ${
            isCoach
              ? "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.28),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.20),transparent_38%)]"
              : "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_36%)]"
          }`}
        />
        <div
          className={`absolute right-0 top-0 h-full w-1/3 translate-x-16 skew-x-12 ${
            isCoach ? "bg-cyan-800/25" : "bg-sky-800/30"
          }`}
        />

        <div className="absolute left-5 top-5 sm:left-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
            {isCoach ? (
              <>
                <GraduationCap size={15} className="text-cyan-200" />
                Hồ sơ dạy cầu lông · B-Hub
              </>
            ) : (
              <>
                <Trophy size={15} className="text-sky-200" />
                Hồ sơ B-Hub Player
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative px-4 pb-5 sm:px-7 sm:pb-7">
        <div className="-mt-12 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.10)] sm:-mt-14 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start">
            <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:items-start sm:text-left">
              <div className="relative shrink-0">
                <div
                  className={`h-28 w-28 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-sky-50 sm:h-32 sm:w-32 ${
                    avatarBusy ? "opacity-80 ring-2 ring-sky-200" : ""
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
                  {isCoach && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-800">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Dạy cầu lông · {coachExperienceYears ?? 0} năm kinh nghiệm
                    </span>
                  )}

                  {!isCoach && levelLabel && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-800">
                      🏸 {levelLabel}
                    </span>
                  )}
                </div>

                {reactionEntries.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 sm:justify-start">
                    <span className="font-semibold text-slate-700">{"C\u1EA3m x\u00FAc:"}</span>
                    {reactionEntries.slice(0, 6).map(([type, count]) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium"
                        title={reactionMeta[type].label}
                      >
                        <span>{reactionMeta[type].icon}</span>
                        <span className="tabular-nums">{count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-2 gap-2">
                {statCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`rounded-2xl border px-3 py-2.5 ${item.className}`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-medium">
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                        <span>{item.label}</span>
                      </div>
                      <div className="mt-1 text-lg font-semibold tabular-nums">
                        {item.value}
                      </div>
                    </div>
                  );
                })}
              </div>

              {trailingActions ? (
                <div className="mt-3 flex justify-start lg:justify-end">
                  {trailingActions}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeroBanner;
