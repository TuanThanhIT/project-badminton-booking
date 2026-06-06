import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  Lock,
  Search,
  Trash2,
  Unlock,
} from "lucide-react";
import { toast } from "react-toastify";
import adminPostService from "../../../../services/admin/postService";
import type { AdminPost } from "../../../../types/admin";
import { showConfirmDialog } from "../../../../utils/confirmDialog";
import AdminPagination from "../AdminPagination";
import UserAvatar from "../UserAvatar";

const POST_TYPE_LABEL: Record<string, string> = {
  FIND_PLAYER: "Tìm người chơi",
  TOURNAMENT: "Giải đấu",
  GROUP: "Nhóm",
  FIND_COACH: "Tìm người giảng dạy",
  CLASS: "Lớp học",
};

const POST_TYPE_COLOR: Record<string, string> = {
  FIND_PLAYER: "bg-blue-50 text-blue-700 border-blue-200",
  TOURNAMENT: "bg-purple-50 text-purple-700 border-purple-200",
  GROUP: "bg-green-50 text-green-700 border-green-200",
  FIND_COACH: "bg-orange-50 text-orange-700 border-orange-200",
  CLASS: "bg-pink-50 text-pink-700 border-pink-200",
};

const LIMIT = 10;
const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const PostsTab = ({ onStatsChange }: { onStatsChange?: () => void }) => {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminPostService.getPostsService({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
        type: typeFilter || undefined,
        isActive:
          statusFilter === "active"
            ? "true"
            : statusFilter === "locked"
              ? "false"
              : undefined,
        isDeleted: statusFilter === "deleted" ? "true" : "false",
      });
      const data = (res.data as any).data;
      setPosts(data.posts || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setPosts([]);
      setTotal(0);
      toast.error(
        err?.response?.data?.message || "Không thể tải danh sách bài đăng",
      );
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, typeFilter, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleToggle = async (post: AdminPost) => {
    if (post.isActive) {
      const confirmed = await showConfirmDialog(
        "Khóa bài đăng?",
        `Bài đăng "${post.title}" sẽ bị ẩn khỏi các luồng hiển thị công khai.`,
        "Khóa bài",
        "Hủy",
        "danger",
      );
      if (!confirmed) return;
    }

    setTogglingId(post.id);
    try {
      await adminPostService.togglePostActiveService(post.id);
      toast.success(post.isActive ? "Đã khóa bài đăng" : "Đã mở khóa bài đăng");
      fetchPosts();
      onStatsChange?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (postId: number) => {
    const post = posts.find((item) => item.id === postId);
    const confirmed = await showConfirmDialog(
      "Xóa bài đăng?",
      post
        ? `Bài đăng "${post.title}" sẽ bị xóa khỏi hệ thống.`
        : "Bài đăng này sẽ bị xóa khỏi hệ thống.",
      "Xóa",
      "Hủy",
      "danger",
    );
    if (!confirmed) return;

    setDeletingId(postId);
    try {
      await adminPostService.deletePostService(postId);
      toast.success("Đã xóa bài đăng");
      fetchPosts();
      onStatsChange?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);

  return (
    <div className="space-y-5">
      <section>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setAppliedSearch(searchInput.trim());
                    setPage(1);
                  }
                }}
                placeholder="Tiêu đề, nội dung..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Loại bài
            </label>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Tất cả</option>
                {Object.entries(POST_TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Trạng thái
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="locked">Đã khóa</option>
                <option value="deleted">Đã xóa</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-400">
            Không có bài đăng
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1024px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  {[
                    "#",
                    "Tác giả",
                    "Tiêu đề / Nội dung",
                    "Loại",
                    "Bình luận",
                    "Trạng thái",
                    "Ngày đăng",
                    "Thao tác",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-3 py-3 text-center font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 [&_td]:align-top">
                {posts.map((post, index) => (
                  <tr key={post.id} className="transition hover:bg-sky-50/40">
                    <td className="px-3 py-3 text-center text-slate-400">
                      {(page - 1) * LIMIT + index + 1}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={post.authorAvatar}
                          name={post.authorName || post.authorUsername || "?"}
                          className="h-8 w-8 rounded-lg border border-slate-200"
                        />
                        <div>
                          <p className="text-xs font-medium text-slate-800">
                            {post.authorName || post.authorUsername}
                          </p>
                          <p className="text-xs text-slate-400">
                            @{post.authorUsername}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[220px] px-3 py-3">
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {post.title}
                      </p>
                      {post.content ? (
                        <p className="truncate text-xs text-slate-400">
                          {stripHtml(post.content)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`rounded border px-2 py-0.5 text-xs font-medium ${
                          POST_TYPE_COLOR[post.type] ||
                          "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {POST_TYPE_LABEL[post.type] || post.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-slate-600">
                      {post.commentCount}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {post.isDeleted ? (
                        <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                          Đã xóa
                        </span>
                      ) : post.isActive ? (
                        <span className="rounded border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                          Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {!post.isDeleted ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggle(post)}
                            disabled={togglingId === post.id}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                              post.isActive
                                ? "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100"
                                : "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                          >
                            {togglingId === post.id ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : post.isActive ? (
                              <>
                                <Lock size={11} /> Khóa
                              </>
                            ) : (
                              <>
                                <Unlock size={11} /> Mở
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
                            disabled={deletingId === post.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100 disabled:opacity-60"
                          >
                            {deletingId === post.id ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <>
                                <Trash2 size={11} /> Xóa
                              </>
                            )}
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPage={setPage}
        />
      </section>
    </div>
  );
};

export default PostsTab;
