import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  FileText,
  MessageCircle,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import adminPostService from "../../../../services/admin/postService";
import type { AdminComment } from "../../../../types/admin";
import { showConfirmDialog } from "../../../../utils/confirmDialog";
import AdminPagination from "../AdminPagination";
import UserAvatar from "../UserAvatar";

const POST_TYPE_LABEL: Record<string, string> = {
  FIND_PLAYER: "Tìm người chơi",
  TOURNAMENT: "Giải đấu",
  GROUP: "Nhóm",
  FIND_COACH: "Tìm người dạy",
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

const CommentsTab = ({ onStatsChange }: { onStatsChange?: () => void }) => {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [commentTypeFilter, setCommentTypeFilter] = useState("");
  const [postTypeFilter, setPostTypeFilter] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminPostService.getCommentsService({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
        commentType: commentTypeFilter || undefined,
        postType: postTypeFilter || undefined,
      });
      const data = (res.data as any).data;
      setComments(data.comments || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setComments([]);
      setTotal(0);
      toast.error(
        err?.response?.data?.message || "Không thể tải danh sách bình luận",
      );
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, commentTypeFilter, postTypeFilter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = async (commentId: number) => {
    const confirmed = await showConfirmDialog(
      "Xóa bình luận?",
      "Bình luận này sẽ bị xóa khỏi hệ thống.",
      "Xóa",
      "Hủy",
      "danger",
    );
    if (!confirmed) return;

    setDeletingId(commentId);
    try {
      await adminPostService.deleteCommentService(commentId);
      toast.success("Đã xóa bình luận");
      fetchComments();
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
              Tìm kiếm nội dung
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
                placeholder="Nội dung bình luận..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Loại bình luận
            </label>
            <div className="relative">
              <MessageCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={commentTypeFilter}
                onChange={(event) => {
                  setCommentTypeFilter(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Tất cả</option>
                <option value="COMMENT">Bình luận</option>
                <option value="REPLY">Trả lời</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Loại bài đăng
            </label>
            <div className="relative">
              <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={postTypeFilter}
                onChange={(event) => {
                  setPostTypeFilter(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
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
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : comments.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-400">
            Không có bình luận
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  {[
                    "#",
                    "Người bình luận",
                    "Nội dung",
                    "Loại",
                    "Bài đăng",
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
                {comments.map((comment, index) => (
                  <tr
                    key={comment.id}
                    className="transition hover:bg-sky-50/40"
                  >
                    <td className="px-3 py-3 text-center text-slate-400">
                      {(page - 1) * LIMIT + index + 1}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={comment.authorAvatar}
                          name={
                            comment.authorName ||
                            comment.authorUsername ||
                            "?"
                          }
                          className="h-7 w-7 rounded-lg border border-slate-200"
                        />
                        <div>
                          <p className="text-xs font-medium text-slate-800">
                            {comment.authorName || comment.authorUsername}
                          </p>
                          <p className="text-xs text-slate-400">
                            @{comment.authorUsername}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[240px] px-3 py-3">
                      <p className="line-clamp-2 text-xs text-slate-700">
                        {stripHtml(comment.content)}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`rounded border px-2 py-0.5 text-xs font-medium ${
                          comment.type === "REPLY"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {comment.type === "REPLY" ? "Trả lời" : "Bình luận"}
                      </span>
                    </td>
                    <td className="max-w-[170px] px-3 py-3 text-center">
                      <p className="truncate text-xs text-slate-600">
                        {comment.postTitle || `#${comment.postId}`}
                      </p>
                      {comment.postType ? (
                        <span
                          className={`rounded border px-1.5 py-0.5 text-xs ${
                            POST_TYPE_COLOR[comment.postType] ||
                            "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {POST_TYPE_LABEL[comment.postType] || comment.postType}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-slate-500">
                      {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        {deletingId === comment.id ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <>
                            <Trash2 size={11} /> Xóa
                          </>
                        )}
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
          totalPages={totalPages}
          total={total}
          onPage={setPage}
        />
      </section>
    </div>
  );
};

export default CommentsTab;
