import { useState } from "react";
import { FileText, MessageCircle } from "lucide-react";
import PostsTab from "../../components/ui/admin/posts/PostsTab";
import CommentsTab from "../../components/ui/admin/posts/CommentsTab";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";

type TabType = "posts" | "comments";

const PostManagementPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("posts");

  const tabs: { key: TabType; label: string; icon: typeof FileText }[] = [
    { key: "posts",    label: "Bài đăng",   icon: FileText },
    { key: "comments", label: "Bình luận",   icon: MessageCircle },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <AdminPageHeader
          title="Quản lý Bài đăng & Bình luận"
          subtitle="Duyệt nội dung cộng đồng, bình luận và trạng thái hiển thị."
        />
        <div className="hidden">
          <h1 className="text-2xl font-bold text-sky-700 relative inline-block">
            Quản lý Bài đăng & Bình luận
            <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm" />
          </h1>
        </div>

        <div className="flex gap-1 border-b border-gray-200 pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-semibold border-b-2 transition ${
                  activeTab === tab.key
                    ? "border-sky-500 text-sky-700 bg-sky-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "posts" ? <PostsTab /> : <CommentsTab />}
      </div>
    </div>
  );
};

export default PostManagementPage;
