import { useState, useCallback, useEffect } from "react";
import { Search, Lock, Unlock, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminPostService from "../../../../services/admin/postService";
import type { AdminPost } from "../../../../types/admin";
import UserAvatar from "../UserAvatar";
import AdminPagination from "../AdminPagination";

const POST_TYPE_LABEL: Record<string, string> = {
  FIND_PLAYER: "Tìm người chơi", TOURNAMENT: "Giải đấu",
  GROUP: "Nhóm", FIND_COACH: "Tìm HLV", CLASS: "Lớp học",
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

const PostsTab = () => {
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
        page, limit: LIMIT, search: appliedSearch, type: typeFilter || undefined,
        isActive: statusFilter === "active" ? "true" : statusFilter === "locked" ? "true" : undefined,
        isDeleted: statusFilter === "deleted" ? "true" : "false",
      });
      const data = (res.data as any).data;
      setPosts(data.posts || []);
      setTotal(data.pagination?.total || 0);
    } catch { toast.error("Không thể tải bài đăng"); }
    finally { setLoading(false); }
  }, [page, appliedSearch, typeFilter, statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleToggle = async (post: AdminPost) => {
    setTogglingId(post.id);
    try {
      await adminPostService.togglePostActiveService(post.id);
      toast.success(post.isActive ? "Đã khóa bài đăng" : "Đã mở khóa bài đăng");
      fetchPosts();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Có lỗi xảy ra"); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (postId: number) => {
    if (!window.confirm("Xóa bài đăng này?")) return;
    setDeletingId(postId);
    try {
      await adminPostService.deletePostService(postId);
      toast.success("Đã xóa bài đăng");
      fetchPosts();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Có lỗi xảy ra"); }
    finally { setDeletingId(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setAppliedSearch(searchInput); setPage(1); } }}
              placeholder="Tiêu đề, nội dung..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 transition" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Loại bài</label>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition">
            <option value="">Tất cả</option>
            {Object.entries(POST_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition">
            <option value="">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="locked">Đã khóa</option>
            <option value="deleted">Đã xóa</option>
          </select>
        </div>
        <button onClick={() => { setAppliedSearch(searchInput); setPage(1); }}
          className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition">
          Tìm kiếm
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-sm">Không có bài đăng</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                {["#", "Tác giả", "Tiêu đề / Nội dung", "Loại", "Bình luận", "Trạng thái", "Ngày đăng", "Thao tác"].map((h) => (
                  <th key={h} className="text-center px-3 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 [&_td]:align-top">
              {posts.map((p, idx) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-center text-gray-400">{(page - 1) * LIMIT + idx + 1}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <UserAvatar src={p.authorAvatar} name={p.authorName || p.authorUsername || "?"} className="w-8 h-8 rounded-lg border border-gray-200" />
                      <div>
                        <p className="font-medium text-gray-800 text-xs">{p.authorName || p.authorUsername}</p>
                        <p className="text-xs text-gray-400">@{p.authorUsername}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 max-w-[200px]">
                    <p className="font-semibold text-gray-800 truncate text-xs">{p.title}</p>
                    {p.content && <p className="text-xs text-gray-400 truncate">{stripHtml(p.content)}</p>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${POST_TYPE_COLOR[p.type] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {POST_TYPE_LABEL[p.type] || p.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center text-gray-600">{p.commentCount}</td>
                  <td className="px-3 py-3 text-center">
                    {p.isDeleted
                      ? <span className="px-2 py-0.5 rounded border text-xs font-semibold bg-gray-100 text-gray-500 border-gray-200">Đã xóa</span>
                      : p.isActive
                        ? <span className="px-2 py-0.5 rounded border text-xs font-semibold bg-green-50 text-green-700 border-green-200">Hoạt động</span>
                        : <span className="px-2 py-0.5 rounded border text-xs font-semibold bg-red-50 text-red-600 border-red-200">Đã khóa</span>}
                  </td>
                  <td className="px-3 py-3 text-center text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-3 py-3 text-center">
                    {!p.isDeleted && (
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleToggle(p)} disabled={togglingId === p.id}
                          className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition disabled:opacity-60 ${
                            p.isActive ? "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200" : "bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                          }`}>
                          {togglingId === p.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : p.isActive ? <><Lock size={11} /> Khóa</> : <><Unlock size={11} /> Mở</>}
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition disabled:opacity-60">
                          {deletingId === p.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><Trash2 size={11} /> Xóa</>}
                        </button>
                      </div>
                    )}
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

export default PostsTab;
