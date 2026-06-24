import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  EyeOff,
  FileText,
  MessageCircle,
  MessagesSquare,
  RefreshCw,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import PostsTab from "../../components/ui/admin/posts/PostsTab";
import CommentsTab from "../../components/ui/admin/posts/CommentsTab";
import ModerationTab from "../../components/ui/admin/posts/ModerationTab";
import ReportedCommentsTab from "../../components/ui/admin/posts/ReportedCommentsTab";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import adminPostService from "../../services/admin/postService";

type TabType = "posts" | "moderation" | "comments" | "commentReports";

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
          }),
          adminPostService.getPostsService({
            page: 1,
            limit: 1,
            isActive: "true",
            isDeleted: "false",
          }),
          adminPostService.getPostsService({
            page: 1,
            limit: 1,
            isActive: "false",
            isDeleted: "false",
          }),
          adminPostService.getCommentsService({ page: 1, limit: 1 }),
          adminPostService.getCommentsService({
            page: 1,
            limit: 1,
            commentType: "REPLY",
          }),
          adminPostService.getPendingModerationPostsService({
            page: 1,
            limit: 1,
          }),
          adminPostService.getCommentReportsService({
            page: 1,
            limit: 1,
          }),
          adminPostService.getCommentReportsService({
            page: 1,
            limit: 1,
            status: "PENDING",
          }),
          adminPostService.getCommentReportsService({
            page: 1,
            limit: 1,
            autoHidden: "true",
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
  }, []);

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

  const tabs: { key: TabType; label: string; icon: typeof FileText }[] = [
    { key: "posts", label: "Bài đăng", icon: FileText },
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
