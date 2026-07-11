import { useCallback, useEffect, useState } from "react";
import {
  CalendarRange,
  CheckCircle,
  EyeOff,
  FileText,
  MessageCircle,
  MessagesSquare,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import PostsTab from "../../components/ui/admin/posts/PostsTab";
import CommentsTab from "../../components/ui/admin/posts/CommentsTab";
import ModerationTab from "../../components/ui/admin/posts/ModerationTab";
import ReportedCommentsTab from "../../components/ui/admin/posts/ReportedCommentsTab";
import PostAnalyticsTab from "../../components/ui/admin/posts/PostAnalyticsTab";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import adminPostService from "../../services/admin/postService";

type TabType = "posts" | "analytics" | "moderation" | "comments" | "commentReports";

type PostManagementStats = {
  totalPosts: number;
  activePosts: number;
  hiddenPosts: number;
  totalComments: number;
  replyComments: number;
  pendingModeration: number;
  reportedComments: number;
  pendingCommentReports: number;
  autoHiddenComments: number;
};

const toDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = () => toDateInput(new Date());

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - (days - 1));
  return toDateInput(date);
};

const firstDayOfMonth = () => {
  const date = new Date();
  return toDateInput(new Date(date.getFullYear(), date.getMonth(), 1));
};

const DATE_PRESETS = [
  { label: "7 ngày", getRange: () => ({ start: daysAgo(7), end: today() }) },
  { label: "30 ngày", getRange: () => ({ start: daysAgo(30), end: today() }) },
  {
    label: "Tháng này",
    getRange: () => ({ start: firstDayOfMonth(), end: today() }),
  },
];

const formatPeriodVi = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}) => (
  <div className={`rounded-xl border p-4 ${color}`}>
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold opacity-75">{label}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const PostManagementPage = () => {
  const initialRange = DATE_PRESETS[1].getRange();
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [applied, setApplied] = useState(initialRange);
  const [activePreset, setActivePreset] = useState(DATE_PRESETS[1].label);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<PostManagementStats>({
    totalPosts: 0,
    activePosts: 0,
    hiddenPosts: 0,
    totalComments: 0,
    replyComments: 0,
    pendingModeration: 0,
    reportedComments: 0,
    pendingCommentReports: 0,
    autoHiddenComments: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const rangeParams = {
        startDate: applied.start,
        endDate: applied.end,
      };
      const [
        postsRes,
        activePostsRes,
        hiddenPostsRes,
        commentsRes,
        repliesRes,
        pendingRes,
        reportedCommentsRes,
        commentReportsRes,
        autoHiddenCommentsRes,
      ] = await Promise.all([
          adminPostService.getPostsService({
            page: 1,
            limit: 1,
            isDeleted: "false",
            ...rangeParams,
          }),
          adminPostService.getPostsService({
            page: 1,
            limit: 1,
            isActive: "true",
            isDeleted: "false",
            ...rangeParams,
          }),
          adminPostService.getPostsService({
            page: 1,
            limit: 1,
            isActive: "false",
            isDeleted: "false",
            ...rangeParams,
          }),
          adminPostService.getCommentsService({ page: 1, limit: 1, ...rangeParams }),
          adminPostService.getCommentsService({
            page: 1,
            limit: 1,
            commentType: "REPLY",
            ...rangeParams,
          }),
          adminPostService.getPendingModerationPostsService({
            page: 1,
            limit: 1,
            ...rangeParams,
          }),
          adminPostService.getCommentReportsService({
            page: 1,
            limit: 1,
            ...rangeParams,
          }),
          adminPostService.getCommentReportsService({
            page: 1,
            limit: 1,
            status: "PENDING",
            ...rangeParams,
          }),
          adminPostService.getCommentReportsService({
            page: 1,
            limit: 1,
            autoHidden: "true",
            ...rangeParams,
          }),
        ]);

      setStats({
        totalPosts: (postsRes.data as any).data?.pagination?.total || 0,
        activePosts: (activePostsRes.data as any).data?.pagination?.total || 0,
        hiddenPosts: (hiddenPostsRes.data as any).data?.pagination?.total || 0,
        totalComments: (commentsRes.data as any).data?.pagination?.total || 0,
        replyComments: (repliesRes.data as any).data?.pagination?.total || 0,
        pendingModeration:
          (pendingRes.data as any).data?.pagination?.total || 0,
        reportedComments:
          (reportedCommentsRes.data as any).data?.pagination?.total || 0,
        pendingCommentReports:
          (commentReportsRes.data as any).data?.pagination?.total || 0,
        autoHiddenComments:
          (autoHiddenCommentsRes.data as any).data?.pagination?.total || 0,
      });
    } catch {
      toast.error("Không thể tải thống kê bài đăng");
    }
  }, [applied]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStats();
      setRefreshVersion((value) => value + 1);
    } finally {
      setRefreshing(false);
    }
  };

  const applyPreset = (preset: (typeof DATE_PRESETS)[number]) => {
    const range = preset.getRange();
    setStartDate(range.start);
    setEndDate(range.end);
    setActivePreset(preset.label);
    setApplied(range);
  };

  const applyCustomRange = () => {
    if (!startDate || !endDate) {
      toast.error("Vui lòng chọn đủ ngày bắt đầu và ngày kết thúc");
      return;
    }
    if (startDate > endDate) {
      toast.error("Ngày bắt đầu không được sau ngày kết thúc");
      return;
    }
    setActivePreset("Tùy chỉnh");
    setApplied({ start: startDate, end: endDate });
  };

  const tabs: { key: TabType; label: string; icon: typeof FileText }[] = [
    { key: "posts", label: "Bài đăng", icon: FileText },
    { key: "analytics", label: "Phân tích", icon: TrendingUp },
    {
      key: "moderation",
      label: `Chờ kiểm duyệt (${stats.pendingModeration})`,
      icon: ShieldAlert,
    },
    { key: "comments", label: "Bình luận", icon: MessageCircle },
    {
      key: "commentReports",
      label: `Báo cáo bình luận (${stats.pendingCommentReports})`,
      icon: ShieldAlert,
    },
  ];

  const postStatCards = [
    {
      label: "Tổng bài đăng",
      value: stats.totalPosts,
      icon: FileText,
      color: "bg-sky-50 border-sky-200 text-sky-700",
    },
    {
      label: "Bài đăng hoạt động",
      value: stats.activePosts,
      icon: CheckCircle,
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    {
      label: "Chờ kiểm duyệt",
      value: stats.pendingModeration,
      icon: ShieldAlert,
      color: "bg-amber-50 border-amber-200 text-amber-700",
    },
    {
      label: "Bài bị ẩn",
      value: stats.hiddenPosts,
      icon: EyeOff,
      color: "bg-slate-50 border-slate-200 text-slate-700",
    },
  ];

  const commentStatCards = [
    {
      label: "Tổng bình luận",
      value: stats.totalComments,
      icon: MessagesSquare,
      color: "bg-indigo-50 border-indigo-200 text-indigo-700",
    },
    {
      label: "Có báo cáo",
      value: stats.reportedComments,
      icon: ShieldAlert,
      color: "bg-orange-50 border-orange-200 text-orange-700",
    },
    {
      label: "Chờ xử lý báo cáo",
      value: stats.pendingCommentReports,
      icon: ShieldAlert,
      color: "bg-red-50 border-red-200 text-red-700",
    },
    {
      label: "Tự động ẩn",
      value: stats.autoHiddenComments,
      icon: MessageCircle,
      color: "bg-slate-50 border-slate-200 text-slate-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        <AdminPageHeader
          title="Quản lý bài đăng và bình luận"
          subtitle="Duyệt nội dung cộng đồng, bình luận và trạng thái hiển thị."
          action={
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Làm mới
            </button>
          }
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <CalendarRange className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Khoảng thời gian thống kê
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Đang xem từ {formatPeriodVi(applied.start)} đến{" "}
                  {formatPeriodVi(applied.end)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`h-10 rounded-lg px-4 text-sm font-semibold transition ${
                    activePreset === preset.label
                      ? "bg-sky-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <input
                type="date"
                value={startDate}
                max={today()}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setActivePreset("Tùy chỉnh");
                }}
                className="h-10 rounded-lg border border-slate-200 px-2.5 text-[13px] outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              />
              <span className="text-sm text-slate-400">đến</span>
              <input
                type="date"
                value={endDate}
                max={today()}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setActivePreset("Tùy chỉnh");
                }}
                className="h-10 rounded-lg border border-slate-200 px-2.5 text-[13px] outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={applyCustomRange}
                className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Thống kê bài đăng
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {postStatCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Thống kê bình luận
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {commentStatCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>
          </section>
        </div>

        <div className="flex gap-1 border-b border-gray-200 pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-t-xl border-b-2 px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "posts" ? (
          <PostsTab key={`posts-${refreshVersion}`} onStatsChange={fetchStats} />
        ) : activeTab === "analytics" ? (
          <PostAnalyticsTab
            key={`analytics-${refreshVersion}-${applied.start}-${applied.end}`}
            startDate={applied.start}
            endDate={applied.end}
            refreshVersion={refreshVersion}
          />
        ) : activeTab === "moderation" ? (
          <ModerationTab
            key={`moderation-${refreshVersion}`}
            onStatsChange={fetchStats}
          />
        ) : activeTab === "comments" ? (
          <CommentsTab
            key={`comments-${refreshVersion}`}
            onStatsChange={fetchStats}
          />
        ) : (
          <ReportedCommentsTab
            key={`commentReports-${refreshVersion}`}
            onStatsChange={fetchStats}
          />
        )}
      </div>
    </div>
  );
};

export default PostManagementPage;
