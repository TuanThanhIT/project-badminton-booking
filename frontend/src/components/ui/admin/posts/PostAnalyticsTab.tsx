import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarRange,
  Eye,
  FileText,
  MessageCircle,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import adminPostService, {
  type AdminPostAnalytics,
  type AdminPostAnalyticsFeaturedPost,
} from "../../../../services/admin/postService";
import AdminPagination from "../AdminPagination";

const FEATURED_POSTS_PAGE_SIZE = 10;

const toDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = () => toDateInput(new Date());

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - (days - 1));
  return toDateInput(date);
};

const firstDayOfMonth = () => {
  const date = new Date();
  return toDateInput(new Date(date.getFullYear(), date.getMonth(), 1));
};

const DATE_PRESETS = [
  { label: "7 ngày", getRange: () => ({ start: daysAgo(7), end: today() }) },
  { label: "30 ngày", getRange: () => ({ start: daysAgo(30), end: today() }) },
  {
    label: "Tháng này",
    getRange: () => ({ start: firstDayOfMonth(), end: today() }),
  },
];

const formatPeriodVi = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const POST_TYPE_LABEL: Record<string, string> = {
  FIND_PLAYER: "Tìm người chơi",
  TOURNAMENT: "Giải đấu",
  GROUP: "Nhóm",
  FIND_COACH: "Tìm HLV",
  CLASS: "Lớp học",
};

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString("vi-VN") : "—";

const formatDateOnly = (value?: string) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—";

const statusLabel = (post: AdminPostAnalyticsFeaturedPost) => {
  if (!post.isActive) return "Đang ẩn";
  if (post.moderationStatus === "REVIEW_REQUIRED") return "Chờ kiểm duyệt";
  if (post.moderationStatus === "REJECTED") return "Từ chối";
  return "Đang hiển thị";
};

const statusClass = (post: AdminPostAnalyticsFeaturedPost) => {
  if (!post.isActive) return "bg-slate-100 text-slate-700";
  if (post.moderationStatus === "REVIEW_REQUIRED")
    return "bg-amber-100 text-amber-700";
  if (post.moderationStatus === "REJECTED") return "bg-rose-100 text-rose-700";
  return "bg-emerald-100 text-emerald-700";
};

const featuredReason = (post: AdminPostAnalyticsFeaturedPost) => {
  const reasons = [];
  if (post.commentCount > 0) reasons.push(`${post.commentCount} bình luận`);
  if (post.reportCount > 0) reasons.push(`${post.reportCount} báo cáo`);
  if (post.moderationStatus === "REVIEW_REQUIRED") reasons.push("chờ duyệt");
  if (!post.isActive) reasons.push("đang ẩn");
  return reasons.length ? reasons.join(" · ") : "Bài mới trong khoảng chọn";
};

const PostDetailModal = ({
  post,
  onClose,
}: {
  post: AdminPostAnalyticsFeaturedPost;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            {POST_TYPE_LABEL[post.type] || post.type}
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">
            {post.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {post.authorName || post.authorUsername || "Không rõ tác giả"} ·{" "}
            {formatDate(post.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(post)}`}
          >
            {statusLabel(post)}
          </span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
            {post.commentCount} bình luận
          </span>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
            {post.reportCount} báo cáo
          </span>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
            Điểm nổi bật {post.hotScore}
          </span>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {stripHtml(post.content || "") || "Bài đăng không có nội dung mô tả."}
        </div>

        {post.moderationReason ? (
          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-bold">Ghi chú kiểm duyệt</p>
            <p className="mt-1">{post.moderationReason}</p>
          </div>
        ) : null}
      </div>
    </div>
  </div>
);

const PostAnalyticsTab = ({ refreshVersion }: { refreshVersion: number }) => {
  const initialRange = DATE_PRESETS[0].getRange();
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [applied, setApplied] = useState(initialRange);
  const [activePreset, setActivePreset] = useState(DATE_PRESETS[0].label);
  const [data, setData] = useState<AdminPostAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [featuredPage, setFeaturedPage] = useState(1);
  const [selectedPost, setSelectedPost] =
    useState<AdminPostAnalyticsFeaturedPost | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminPostService.getPostAnalyticsService({
        startDate: applied.start,
        endDate: applied.end,
      });
      setData(res.data.data);
    } catch (error: any) {
      setData(null);
      toast.error(
        error?.response?.data?.message || "Không thể tải phân tích bài đăng",
      );
    } finally {
      setLoading(false);
    }
  }, [applied]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics, refreshVersion]);

  useEffect(() => {
    setFeaturedPage(1);
  }, [applied, refreshVersion]);

  const applyPreset = (preset: (typeof DATE_PRESETS)[number]) => {
    const range = preset.getRange();
    setStartDate(range.start);
    setEndDate(range.end);
    setActivePreset(preset.label);
    setApplied(range);
  };

  const applyCustomRange = (nextStartDate: string, nextEndDate: string) => {
    if (!nextStartDate || !nextEndDate) return;
    if (nextStartDate > nextEndDate) {
      toast.error("Ngày bắt đầu không được sau ngày kết thúc");
      return;
    }
    setActivePreset("Tùy chỉnh");
    setApplied({ start: nextStartDate, end: nextEndDate });
  };

  const maxPostCount = useMemo(
    () =>
      Math.max(
        1,
        ...(data?.typeBreakdown || []).map(
          (row) => Number(row.totalPosts) || 0,
        ),
      ),
    [data?.typeBreakdown],
  );

  const periodLabel = useMemo(
    () => `${formatDateOnly(applied.start)} - ${formatDateOnly(applied.end)}`,
    [applied],
  );

  const featuredPosts = data?.featuredPosts || [];
  const featuredTotalPages = Math.max(
    Math.ceil(featuredPosts.length / FEATURED_POSTS_PAGE_SIZE),
    1,
  );
  const visibleFeaturedPosts = useMemo(() => {
    const safePage = Math.min(featuredPage, featuredTotalPages);
    const start = (safePage - 1) * FEATURED_POSTS_PAGE_SIZE;
    return featuredPosts.slice(start, start + FEATURED_POSTS_PAGE_SIZE);
  }, [featuredPage, featuredPosts, featuredTotalPages]);

  useEffect(() => {
    if (featuredPage > featuredTotalPages) {
      setFeaturedPage(featuredTotalPages);
    }
  }, [featuredPage, featuredTotalPages]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <CalendarRange className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Khoảng thời gian phân tích
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Đang xem từ {formatPeriodVi(applied.start)} đến{" "}
                {formatPeriodVi(applied.end)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`h-10 rounded-lg px-4 text-sm font-semibold transition ${
                  activePreset === preset.label
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
            <input
              type="date"
              value={startDate}
              max={today()}
              onChange={(event) => {
                const nextStartDate = event.target.value;
                setStartDate(nextStartDate);
                applyCustomRange(nextStartDate, endDate);
              }}
              className="h-10 rounded-lg border border-slate-200 px-2.5 text-[13px] outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
            />
            <span className="text-sm text-slate-400">đến</span>
            <input
              type="date"
              value={endDate}
              max={today()}
              onChange={(event) => {
                const nextEndDate = event.target.value;
                setEndDate(nextEndDate);
                applyCustomRange(startDate, nextEndDate);
              }}
              className="h-10 rounded-lg border border-slate-200 px-2.5 text-[13px] outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
            />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
          Đang tải phân tích bài đăng...
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Phân bố bài đăng theo loại
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Số bài được tạo trong khoảng chọn {periodLabel}, kèm bình luận
                  và báo cáo phát sinh.
                </p>
              </div>
              <BarChart3 className="h-5 w-5 text-sky-500" />
            </div>

            {data?.typeBreakdown?.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {data.typeBreakdown.map((row) => (
                  <div
                    key={row.type}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <p className="text-xs font-semibold text-slate-500">
                      {POST_TYPE_LABEL[row.type] || row.type}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {row.totalPosts}
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{
                          width: `${Math.max(8, (row.totalPosts / maxPostCount) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-3 space-y-1 text-[11px] text-slate-500">
                      <p>{row.commentCount} bình luận trong khoảng</p>
                      <p>{row.reportCount} báo cáo trong khoảng</p>
                      <p>{row.reviewRequiredPosts} bài chờ duyệt</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                Không có bài đăng nào trong khoảng ngày này.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Bài đăng nổi bật trong khoảng chọn
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Dựa trên khoảng {periodLabel}; ưu tiên bài có nhiều bình luận,
                  nhiều báo cáo, đang chờ kiểm duyệt hoặc đang bị ẩn.
                </p>
              </div>
              <FileText className="h-5 w-5 text-sky-500" />
            </div>

            {featuredPosts.length ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Bài đăng</th>
                      <th className="px-4 py-3">Loại</th>
                      <th className="px-4 py-3">Tương tác</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {visibleFeaturedPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">
                            {post.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {post.authorName ||
                              post.authorUsername ||
                              "Không rõ tác giả"}{" "}
                            · {formatDate(post.createdAt)}
                          </p>
                          <p className="mt-1 text-xs text-sky-600">
                            {featuredReason(post)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {POST_TYPE_LABEL[post.type] || post.type}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">
                              <MessageCircle className="h-3 w-3" />
                              {post.commentCount}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                              <AlertTriangle className="h-3 w-3" />
                              {post.reportCount}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(post)}`}
                          >
                            {statusLabel(post)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedPost(post)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <AdminPagination
                  page={featuredPage}
                  totalPages={featuredTotalPages}
                  total={featuredPosts.length}
                  onPage={setFeaturedPage}
                  unit="bài"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                Chưa có bài nổi bật trong khoảng ngày này.
              </div>
            )}
          </section>
        </>
      )}

      {selectedPost ? (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      ) : null}
    </div>
  );
};

export default PostAnalyticsTab;
