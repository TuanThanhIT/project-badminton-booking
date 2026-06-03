import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  FileText,
  MessageCircle,
  MessagesSquare,
  Type,
  type LucideIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import PostsTab from "../../components/ui/admin/posts/PostsTab";
import CommentsTab from "../../components/ui/admin/posts/CommentsTab";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import adminPostService from "../../services/admin/postService";

type TabType = "posts" | "comments";

type PostManagementStats = {
  totalPosts: number;
  activePosts: number;
  totalComments: number;
  replyComments: number;
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
  const [stats, setStats] = useState<PostManagementStats>({
    totalPosts: 0,
    activePosts: 0,
    totalComments: 0,
    replyComments: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const [postsRes, activePostsRes, commentsRes, repliesRes] =
        await Promise.all([
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
          adminPostService.getCommentsService({ page: 1, limit: 1 }),
          adminPostService.getCommentsService({
            page: 1,
            limit: 1,
            commentType: "REPLY",
          }),
        ]);

      setStats({
        totalPosts: (postsRes.data as any).data?.pagination?.total || 0,
        activePosts: (activePostsRes.data as any).data?.pagination?.total || 0,
        totalComments: (commentsRes.data as any).data?.pagination?.total || 0,
        replyComments: (repliesRes.data as any).data?.pagination?.total || 0,
      });
    } catch {
      toast.error("Không thể tải thống kê bài đăng");
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const tabs: { key: TabType; label: string; icon: typeof FileText }[] = [
    { key: "posts", label: "Bài đăng", icon: FileText },
    { key: "comments", label: "Bình luận", icon: MessageCircle },
  ];

  const statCards = [
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
      label: "Tổng bình luận",
      value: stats.totalComments,
      icon: MessagesSquare,
      color: "bg-indigo-50 border-indigo-200 text-indigo-700",
    },
    {
      label: "Trả lời bình luận",
      value: stats.replyComments,
      icon: Type,
      color: "bg-amber-50 border-amber-200 text-amber-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        <AdminPageHeader
          title="Quản lý bài đăng và bình luận"
          subtitle="Duyệt nội dung cộng đồng, bình luận và trạng thái hiển thị."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
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
          <PostsTab onStatsChange={fetchStats} />
        ) : (
          <CommentsTab onStatsChange={fetchStats} />
        )}
      </div>
    </div>
  );
};

export default PostManagementPage;
