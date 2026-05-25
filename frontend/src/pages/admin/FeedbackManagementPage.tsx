import { useState, useEffect, useCallback } from "react";
import { Trash2, Star, Store, Package } from "lucide-react";
import { toast } from "react-toastify";
import adminFeedbackService from "../../services/admin/feedbackService";
import adminBranchService from "../../services/admin/branchService";
import type { AdminFeedback } from "../../types/admin";
import UserAvatar from "../../components/ui/admin/UserAvatar";
import AdminPagination from "../../components/ui/admin/AdminPagination";

interface Branch { id: number; branchName: string; }

const LIMIT = 10;
const stripHtml = (html = "") => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
    ))}
    <span className="ml-1 text-xs font-semibold text-gray-700">{rating}/5</span>
  </div>
);

const FeedbackManagementPage = () => {
  const [feedbacks,   setFeedbacks]   = useState<AdminFeedback[]>([]);
  const [branches,    setBranches]    = useState<Branch[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [branchFilter, setBranchFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [deletingId,   setDeletingId]   = useState<number | null>(null);

  useEffect(() => {
    adminBranchService.getAdminBranchesService({ limit: 100 }).then((res: any) => {
      setBranches((res.data as any).data?.branches || []);
    }).catch(() => {});
  }, []);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFeedbackService.getFeedbacksService({
        page, limit: LIMIT,
        branchId: branchFilter || undefined,
        rating: ratingFilter || undefined,
        feedbackType: typeFilter || undefined,
      });
      const data = (res.data as any).data;
      setFeedbacks(data.feedbacks || []);
      setTotal(data.pagination?.total || 0);
    } catch { toast.error("Không thể tải danh sách đánh giá"); }
    finally { setLoading(false); }
  }, [page, branchFilter, ratingFilter, typeFilter]);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  const handleDelete = async (feedbackId: number) => {
    if (!window.confirm("Xóa đánh giá này?")) return;
    setDeletingId(feedbackId);
    try {
      await adminFeedbackService.deleteFeedbackService(feedbackId);
      toast.success("Đã xóa đánh giá");
      fetchFeedbacks();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Có lỗi xảy ra"); }
    finally { setDeletingId(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : "—";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-sky-700 relative inline-block">
            Quản lý Feedback
            <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm" />
          </h1>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Tổng feedback", value: total, color: "bg-sky-50 border-sky-200 text-sky-700" },
            { label: "Về chi nhánh", value: feedbacks.filter((f) => f.feedbackType === "BRANCH").length, icon: Store, color: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "Về sản phẩm", value: feedbacks.filter((f) => f.feedbackType === "PRODUCT").length, icon: Package, color: "bg-purple-50 border-purple-200 text-purple-700" },
            { label: "Đánh giá TB", value: avgRating, color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
              <p className="text-xs font-medium opacity-70">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Loại feedback</label>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition">
              <option value="">Tất cả</option>
              <option value="BRANCH">Chi nhánh</option>
              <option value="PRODUCT">Sản phẩm</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Chi nhánh</label>
            <select value={branchFilter} onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
              className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition">
              <option value="">Tất cả chi nhánh</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.branchName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Đánh giá</label>
            <select value={ratingFilter} onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
              className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition">
              <option value="">Tất cả</option>
              {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} sao</option>)}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-14"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-14 text-gray-400 text-sm">Không có feedback</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  {["#", "Người dùng", "Nội dung", "Đánh giá", "Đối tượng", "Loại", "Ngày", "Thao tác"].map((h) => (
                    <th key={h} className="text-center px-3 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 [&_td]:align-top">
                {feedbacks.map((f, idx) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-center text-gray-400">{(page - 1) * LIMIT + idx + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar src={f.userAvatar} name={f.userName || "?"} className="w-8 h-8 rounded-lg border border-gray-200" />
                        <p className="text-xs font-medium text-gray-800">{f.userName || `User #${f.userId}`}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 max-w-[200px]">
                      <p className="text-xs text-gray-700 line-clamp-2">{stripHtml(f.content)}</p>
                    </td>
                    <td className="px-3 py-3 text-center"><StarRating rating={f.rating} /></td>
                    <td className="px-3 py-3 text-center">
                      {f.feedbackType === "BRANCH" ? (
                        <span className="text-xs text-blue-700 font-medium">{f.branchName || `Chi nhánh #${f.branchId}`}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {f.productThumbnail && (
                            <img src={f.productThumbnail} alt="" className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
                          )}
                          <div>
                            <p className="text-xs font-medium text-gray-800 truncate max-w-[100px]">{f.productName}</p>
                            {f.variantInfo && <p className="text-xs text-gray-400">{f.variantInfo}</p>}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {f.feedbackType === "BRANCH"
                        ? <span className="px-2 py-0.5 rounded border text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">Chi nhánh</span>
                        : <span className="px-2 py-0.5 rounded border text-xs font-medium bg-purple-50 text-purple-700 border-purple-200">Sản phẩm</span>}
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-gray-500">{new Date(f.createdDate).toLocaleDateString("vi-VN")}</td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => handleDelete(f.id)} disabled={deletingId === f.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition disabled:opacity-60">
                        {deletingId === f.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><Trash2 size={11} /> Xóa</>}
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
    </div>
  );
};

export default FeedbackManagementPage;
