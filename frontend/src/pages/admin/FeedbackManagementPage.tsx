import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  MessageSquare,
  Package,
  Search,
  Star,
  Store,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import UserAvatar from "../../components/ui/admin/UserAvatar";
import adminBranchService from "../../services/admin/branchService";
import adminFeedbackService from "../../services/admin/feedbackService";
import type { AdminBranchOption, AdminFeedback } from "../../types/admin";
import { showConfirmDialog } from "../../utils/confirmDialog";

const LIMIT = 10;

const stripHtml = (html = "") => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
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

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center justify-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-3.5 w-3.5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
      />
    ))}
    <span className="ml-1 text-xs font-semibold text-slate-700">{rating}/5</span>
  </div>
);

const FeedbackManagementPage = () => {
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([]);
  const [branches, setBranches] = useState<AdminBranchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    adminBranchService
      .getAdminBranchOptionsService()
      .then((res) => {
        setBranches((res.data as any).data || []);
      })
      .catch(() => setBranches([]));
  }, []);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFeedbackService.getFeedbacksService({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
        branchId: branchFilter || undefined,
        rating: ratingFilter || undefined,
        feedbackType: typeFilter || undefined,
      });
      const data = (res.data as any).data;
      setFeedbacks(data.feedbacks || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setFeedbacks([]);
      setTotal(0);
      toast.error(err?.response?.data?.message || "Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, branchFilter, ratingFilter, typeFilter]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = async (feedbackId: number) => {
    const confirmed = await showConfirmDialog(
      "Xóa đánh giá?",
      "Đánh giá này sẽ bị xóa khỏi hệ thống.",
      "Xóa",
      "Hủy",
      "danger",
    );
    if (!confirmed) return;

    setDeletingId(feedbackId);
    try {
      await adminFeedbackService.deleteFeedbackService(feedbackId);
      toast.success("Đã xóa đánh giá");
      fetchFeedbacks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);
  const branchCount = feedbacks.filter((feedback) => feedback.feedbackType === "BRANCH").length;
  const productCount = feedbacks.filter((feedback) => feedback.feedbackType === "PRODUCT").length;
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        <AdminPageHeader
          title="Quản lý đánh giá"
          subtitle="Theo dõi đánh giá chi nhánh, sản phẩm và chất lượng trải nghiệm."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Tổng đánh giá" value={total} icon={MessageSquare} color="bg-sky-50 border-sky-200 text-sky-700" />
          <StatCard label="Về chi nhánh đang hiển thị" value={branchCount} icon={Store} color="bg-emerald-50 border-emerald-200 text-emerald-700" />
          <StatCard label="Về sản phẩm đang hiển thị" value={productCount} icon={Package} color="bg-purple-50 border-purple-200 text-purple-700" />
          <StatCard label="Đánh giá trung bình" value={avgRating} icon={Star} color="bg-yellow-50 border-yellow-200 text-yellow-700" />
        </div>

        <section>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_190px_220px_160px]">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Tìm kiếm</label>
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
                  placeholder="Nội dung, người dùng, chi nhánh, sản phẩm..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Loại đánh giá</label>
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
                  <option value="BRANCH">Chi nhánh</option>
                  <option value="PRODUCT">Sản phẩm</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Chi nhánh</label>
              <div className="relative">
                <select
                  value={branchFilter}
                  onChange={(event) => {
                    setBranchFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">Tất cả chi nhánh</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.branchName}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Đánh giá</label>
              <div className="relative">
                <select
                  value={ratingFilter}
                  onChange={(event) => {
                    setRatingFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">Tất cả</option>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>{rating} sao</option>
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
          ) : feedbacks.length === 0 ? (
            <div className="py-14 text-center text-sm text-slate-400">Không có đánh giá</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    {["#", "Người dùng", "Nội dung", "Đánh giá", "Đối tượng", "Loại", "Ngày", "Thao tác"].map((header) => (
                      <th key={header} className="px-3 py-3 text-center font-semibold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&_td]:align-top">
                  {feedbacks.map((feedback, index) => (
                    <tr key={feedback.id} className="transition hover:bg-sky-50/40">
                      <td className="px-3 py-3 text-center text-slate-400">{(page - 1) * LIMIT + index + 1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <UserAvatar src={feedback.userAvatar} name={feedback.userName || "?"} className="h-8 w-8 rounded-lg border border-slate-200" />
                          <p className="text-xs font-medium text-slate-800">{feedback.userName || `User #${feedback.userId}`}</p>
                        </div>
                      </td>
                      <td className="max-w-[220px] px-3 py-3">
                        <p className="line-clamp-2 text-xs text-slate-700">{stripHtml(feedback.content)}</p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <StarRating rating={feedback.rating} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        {feedback.feedbackType === "BRANCH" ? (
                          <span className="text-xs font-medium text-blue-700">{feedback.branchName || `Chi nhánh #${feedback.branchId}`}</span>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {feedback.productThumbnail ? (
                              <img
                                src={feedback.productThumbnail}
                                alt=""
                                className="h-8 w-8 shrink-0 rounded border border-slate-200 object-cover"
                              />
                            ) : null}
                            <div className="min-w-0 text-left">
                              <p className="max-w-[120px] truncate text-xs font-medium text-slate-800">{feedback.productName}</p>
                              {feedback.variantInfo ? <p className="text-xs text-slate-400">{feedback.variantInfo}</p> : null}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {feedback.feedbackType === "BRANCH" ? (
                          <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">Chi nhánh</span>
                        ) : (
                          <span className="rounded border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">Sản phẩm</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-slate-500">{new Date(feedback.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(feedback.id)}
                          disabled={deletingId === feedback.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100 disabled:opacity-60"
                        >
                          {deletingId === feedback.id ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <><Trash2 size={11} /> Xóa</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <AdminPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
        </section>
      </div>
    </div>
  );
};

export default FeedbackManagementPage;
