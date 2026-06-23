import { useCallback, useEffect, useState } from "react";
import { Eye, ShieldAlert } from "lucide-react";
import { toast } from "react-toastify";
import adminPostService from "../../../../services/admin/postService";
import type { AdminModerationPost } from "../../../../types/admin";
import AdminPagination from "../AdminPagination";
import UserAvatar from "../UserAvatar";
import ModerationReviewModal from "./ModerationReviewModal";

const LIMIT = 10;
const LABEL_TEXT: Record<string, string> = {
  normal: "Bình thường",
  spam: "Spam",
  unauthorized_ad: "Quảng cáo trái phép",
  offensive: "Công kích / xúc phạm",
};

const ModerationTab = ({ onStatsChange }: { onStatsChange?: () => void }) => {
  const [posts, setPosts] = useState<AdminModerationPost[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response =
        await adminPostService.getPendingModerationPostsService({
          page,
          limit: LIMIT,
        });
      const data = (response.data as any).data;
      setPosts(data.posts || []);
      setTotal(data.pagination?.total || 0);
    } catch (error: any) {
      setPosts([]);
      setTotal(0);
      toast.error(error?.message || "Không thể tải hàng chờ kiểm duyệt");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const refresh = () => {
    fetchPosts();
    onStatsChange?.();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Các bài trong danh sách này đang bị ẩn và cần quản trị viên quyết định.
        Từ chối bài sẽ ghi nhận một vi phạm cho tác giả.
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <ShieldAlert className="mb-2 h-10 w-10" />
            <p className="text-sm">Không có bài viết chờ kiểm duyệt</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {[
                    "#",
                    "Tác giả",
                    "Bài viết",
                    "Nhãn AI",
                    "Độ tin cậy",
                    "Ngày gửi",
                    "Thao tác",
                  ].map((header) => (
                    <th key={header} className="px-4 py-3 text-center">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post, index) => (
                  <tr key={post.id} className="hover:bg-amber-50/30">
                    <td className="px-4 py-3 text-center text-slate-400">
                      {(page - 1) * LIMIT + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={post.author?.profile?.avatar}
                          name={
                            post.author?.profile?.fullName ||
                            post.author?.username ||
                            "?"
                          }
                          className="h-9 w-9 rounded-lg"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">
                            {post.author?.profile?.fullName ||
                              post.author?.username}
                          </p>
                          <p className="text-xs text-slate-400">
                            {post.author?.violationCount || 0} vi phạm
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[300px] px-4 py-3">
                      <p className="truncate font-semibold text-slate-800">
                        {post.title}
                      </p>
                      <p className="line-clamp-2 text-xs text-slate-500">
                        {post.content || "Không có mô tả"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        {LABEL_TEXT[post.moderationLabel || ""] ||
                          "Không xác định"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {post.moderationConfidence != null
                        ? `${(post.moderationConfidence * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">
                      {new Date(post.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedId(post.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700"
                      >
                        <Eye className="h-3.5 w-3.5" /> Xem và duyệt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination
          page={page}
          totalPages={Math.max(Math.ceil(total / LIMIT), 1)}
          total={total}
          onPage={setPage}
          unit="bài chờ duyệt"
        />
      </section>

      {selectedId !== null ? (
        <ModerationReviewModal
          postId={selectedId}
          onClose={() => setSelectedId(null)}
          onResolved={refresh}
        />
      ) : null}
    </div>
  );
};

export default ModerationTab;
