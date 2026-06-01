import { useState, useCallback, useEffect } from "react";
import { Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminPostService from "../../../../services/admin/postService";
import type { AdminComment } from "../../../../types/admin";
import UserAvatar from "../UserAvatar";
import AdminPagination from "../AdminPagination";

const POST_TYPE_LABEL: Record<string, string> = {
  FIND_PLAYER: "Tìm người chơi", TOURNAMENT: "Giải đấu",
  GROUP: "Nhóm", FIND_COACH: "Tìm người dạy", CLASS: "Lớp học",
};

const POST_TYPE_COLOR: Record<string, string> = {
  FIND_PLAYER: "bg-blue-50 text-blue-700 border-blue-200",
  TOURNAMENT: "bg-purple-50 text-purple-700 border-purple-200",
  GROUP: "bg-green-50 text-green-700 border-green-200",
  FIND_COACH: "bg-orange-50 text-orange-700 border-orange-200",
  CLASS: "bg-pink-50 text-pink-700 border-pink-200",
};

const LIMIT = 10;
const stripHtml = (html = "") => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const CommentsTab = () => {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminPostService.getCommentsService({ page, limit: LIMIT, search: appliedSearch });
      const data = (res.data as any).data;
      setComments(data.comments || []);
      setTotal(data.pagination?.total || 0);
    } catch { toast.error("Không thể tải bình luận"); }
    finally { setLoading(false); }
  }, [page, appliedSearch]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleDelete = async (commentId: number) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    setDeletingId(commentId);
    try {
      await adminPostService.deleteCommentService(commentId);
      toast.success("Đã xóa bình luận");
      fetchComments();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Có lỗi xảy ra"); }
    finally { setDeletingId(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Tìm kiếm nội dung</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setAppliedSearch(searchInput); setPage(1); } }}
              placeholder="Nội dung bình luận..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 transition" />
          </div>
        </div>
        <button onClick={() => { setAppliedSearch(searchInput); setPage(1); }}
          className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition">
          Tìm kiếm
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : comments.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-sm">Không có bình luận</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                {["#", "Người bình luận", "Nội dung", "Loại", "Bài đăng", "Ngày đăng", "Thao tác"].map((h) => (
                  <th key={h} className="text-center px-3 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 [&_td]:align-top">
              {comments.map((c, idx) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-center text-gray-400">{(page - 1) * LIMIT + idx + 1}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <UserAvatar src={c.authorAvatar} name={c.authorName || c.authorUsername || "?"} className="w-7 h-7 rounded-lg border border-gray-200" />
                      <div>
                        <p className="font-medium text-gray-800 text-xs">{c.authorName || c.authorUsername}</p>
                        <p className="text-xs text-gray-400">@{c.authorUsername}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 max-w-[200px]">
                    <p className="text-xs text-gray-700 line-clamp-2">{stripHtml(c.content)}</p>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${c.type === "REPLY" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                      {c.type === "REPLY" ? "Trả lời" : "Bình luận"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center max-w-[150px]">
                    <p className="text-xs text-gray-600 truncate">{c.postTitle || `#${c.postId}`}</p>
                    {c.postType && <span className={`px-1.5 py-0.5 rounded border text-xs ${POST_TYPE_COLOR[c.postType] || ""}`}>{POST_TYPE_LABEL[c.postType] || c.postType}</span>}
                  </td>
                  <td className="px-3 py-3 text-center text-xs text-gray-500">{new Date(c.createdDate).toLocaleDateString("vi-VN")}</td>
                  <td className="px-3 py-3 text-center">
                    <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition disabled:opacity-60">
                      {deletingId === c.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><Trash2 size={11} /> Xóa</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <AdminPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
      </div>
    </div>
  );
};

export default CommentsTab;
