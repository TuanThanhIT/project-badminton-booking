import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  UserRoundX,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import adminPostService from "../../../../services/admin/postService";
import type {
  AdminCommentReportItem,
  CommentReportReason,
  CommentReportStatus,
} from "../../../../types/admin";
import { showConfirmDialog } from "../../../../utils/confirmDialog";
import AdminPagination from "../AdminPagination";
import UserAvatar from "../UserAvatar";

const LIMIT = 10;
const AUTO_WARN_REPORT_THRESHOLD = 3;

const STATUS_LABEL: Record<CommentReportStatus, string> = {
  PENDING: "Chờ xử lý",
  RESOLVED: "Đã xử lý",
  REJECTED: "Từ chối",
};

const REASON_LABEL: Record<CommentReportReason, string> = {
  SPAM: "Spam",
  OFFENSIVE: "Ngôn từ xúc phạm",
  UNAUTHORIZED_AD: "Quảng cáo trái phép",
  HARASSMENT: "Quấy rối",
  OTHER: "Khác",
};

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ReportedCommentsTab = ({
  onStatsChange,
}: {
  onStatsChange?: () => void | Promise<void>;
}) => {
  const [items, setItems] = useState<AdminCommentReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<CommentReportStatus | "">("PENDING");
  const [reason, setReason] = useState<CommentReportReason | "">("");
  const [workingKey, setWorkingKey] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminPostService.getCommentReportsService({
        page,
        limit: LIMIT,
        status: status || undefined,
        reason: reason || undefined,
        search: appliedSearch || undefined,
      });
      const data = (res.data as any).data;
      setItems(data.commentReports || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setItems([]);
      setTotal(0);
      toast.error(
        err?.response?.data?.message || "Không thể tải báo cáo bình luận",
      );
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, status, reason]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const runAction = async (
    key: string,
    message: string,
    action: () => Promise<unknown>,
  ) => {
    setWorkingKey(key);
    try {
      await action();
      toast.success(message);
      await Promise.all([fetchReports(), onStatsChange?.()]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setWorkingKey(null);
    }
  };

  const handleRejectReport = async (item: AdminCommentReportItem) => {
    const reportId = item.latestReport?.id;
    if (!reportId) return;
    const confirmed = await showConfirmDialog(
      "Từ chối báo cáo?",
      "Báo cáo này sẽ được đánh dấu là không đủ cơ sở xử lý.",
      "Từ chối",
      "Hủy",
      "warning",
    );
    if (!confirmed) return;

    await runAction(`reject-${reportId}`, "Đã từ chối báo cáo", () =>
      adminPostService.rejectCommentReportService(reportId, {
        adminNote: "Báo cáo không đủ cơ sở xử lý.",
      }),
    );
  };

  const handleHide = async (item: AdminCommentReportItem) => {
    const confirmed = await showConfirmDialog(
      "Ẩn bình luận?",
      "Bình luận này sẽ bị ẩn khỏi người dùng.",
      "Ẩn",
      "Hủy",
      "warning",
    );
    if (!confirmed) return;

    await runAction(`hide-${item.id}`, "Đã ẩn bình luận", () =>
      adminPostService.hideCommentService(item.id, {
        reason: "Quản trị viên đã ẩn bình luận sau khi xem báo cáo.",
      }),
    );
  };

  const handleUnhide = async (item: AdminCommentReportItem) => {
    const confirmed = await showConfirmDialog(
      "Hiện bình luận?",
      "Bình luận này sẽ hiển thị trở lại cho người dùng.",
      "Hiện",
      "Hủy",
      "success",
    );
    if (!confirmed) return;

    await runAction(`unhide-${item.id}`, "Đã hiện lại bình luận", () =>
      adminPostService.unhideCommentService(item.id, {
        reason: "Quản trị viên đã xem xét và hiện lại bình luận.",
      }),
    );
  };

  const handleWarn = async (item: AdminCommentReportItem) => {
    const confirmed = await showConfirmDialog(
      "Cảnh báo tác giả?",
      "Tác giả bình luận sẽ nhận cảnh báo vi phạm quy định cộng đồng.",
      "Cảnh báo",
      "Hủy",
      "warning",
    );
    if (!confirmed) return;

    await runAction(`warn-${item.id}`, "Đã cảnh báo tác giả", () =>
      adminPostService.warnCommentAuthorService(item.id, {
        label: "offensive",
        reason: "Bình luận vi phạm quy định cộng đồng.",
      }),
    );
  };

  const handleDelete = async (item: AdminCommentReportItem) => {
    const confirmed = await showConfirmDialog(
      "Xóa bình luận?",
      "Bình luận sẽ bị xóa mềm và không hiển thị cho người dùng.",
      "Xóa",
      "Hủy",
      "danger",
    );
    if (!confirmed) return;
    await runAction(`delete-${item.id}`, "Đã xóa bình luận", () =>
      adminPostService.deleteCommentService(item.id),
    );
  };

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px_210px]">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Tìm kiếm nội dung
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Nội dung bình luận..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 text-[13px] outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Trạng thái
          </label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as CommentReportStatus | "");
              setPage(1);
            }}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
          >
            <option value="">Tất cả</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Lý do
          </label>
          <select
            value={reason}
            onChange={(event) => {
              setReason(event.target.value as CommentReportReason | "");
              setPage(1);
            }}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
          >
            <option value="">Tất cả</option>
            {Object.entries(REASON_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-400">
            Không có báo cáo bình luận
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  {[
                    "#",
                    "Bình luận",
                    "Tác giả",
                    "Báo cáo",
                    "Trạng thái",
                    "Bài đăng",
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
                {items.map((item, index) => {
                  const latest = item.latestReport;
                  const latestStatus = latest?.status || "PENDING";
                  const reportCount = Number(
                    item.reportCount || item.reports?.length || 0,
                  );
                  const canWarnAuthor =
                    item.isActive === false &&
                    reportCount >= AUTO_WARN_REPORT_THRESHOLD;
                  return (
                    <tr key={item.id} className="transition hover:bg-sky-50/40">
                      <td className="w-12 px-3 py-3 text-center text-slate-400">
                        {(page - 1) * LIMIT + index + 1}
                      </td>
                      <td className="max-w-[320px] px-3 py-3">
                        <p className="line-clamp-3 text-sm text-slate-700">
                          {stripHtml(item.content)}
                        </p>
                        {item.hiddenReason ? (
                          <p className="mt-1 text-xs text-amber-600">
                            {item.hiddenReason}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            src={item.authorAvatar}
                            name={item.authorName || item.authorUsername || "?"}
                            className="h-8 w-8 rounded-lg border border-slate-200"
                          />
                          <div>
                            <p className="text-xs font-medium text-slate-800">
                              {item.authorName ||
                                item.authorUsername ||
                                "Ẩn danh"}
                            </p>
                            <p className="text-xs text-slate-400">
                              @{item.authorUsername}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(item.reportSummary?.byReason || {})
                            .filter(([, count]) => Number(count) > 0)
                            .map(([reportReason, count]) => (
                              <span
                                key={reportReason}
                                className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
                              >
                                {REASON_LABEL[
                                  reportReason as CommentReportReason
                                ] || reportReason}
                                : {count}
                              </span>
                            ))}
                        </div>
                        {latest?.description ? (
                          <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                            {latest.description}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                              latestStatus === "PENDING"
                                ? "bg-amber-50 text-amber-700"
                                : latestStatus === "RESOLVED"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <ShieldAlert size={12} />
                            {STATUS_LABEL[latestStatus as CommentReportStatus]}
                          </span>
                          <p className="text-xs text-slate-500">
                            {item.reportCount || item.reports?.length || 0} báo
                            cáo
                          </p>
                          {item.autoHiddenByReports ? (
                            <p className="inline-flex items-center gap-1 text-xs text-red-500">
                              <AlertTriangle size={12} />
                              Tự động ẩn
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="max-w-[190px] px-3 py-3">
                        <p className="truncate text-xs text-slate-700">
                          {item.postTitle || `#${item.postId}`}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </td>
                      <td className="w-[210px] px-3 py-3">
                        <div className="grid grid-cols-2 gap-1.5">
                          {item.isActive === false ? (
                            <button
                              type="button"
                              onClick={() => handleUnhide(item)}
                              disabled={workingKey === `unhide-${item.id}`}
                              className="inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-100 disabled:opacity-60"
                            >
                              <Eye size={12} />
                              Hiện
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleHide(item)}
                              disabled={workingKey === `hide-${item.id}`}
                              className="inline-flex items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                            >
                              <EyeOff size={12} />
                              Ẩn
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRejectReport(item)}
                            disabled={
                              !latest?.id ||
                              workingKey === `reject-${latest?.id}`
                            }
                            className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                          >
                            <XCircle size={12} />
                            Từ chối
                          </button>
                          <button
                            type="button"
                            onClick={() => handleWarn(item)}
                            disabled={workingKey === `warn-${item.id}`}
                            className={`${canWarnAuthor ? "inline-flex" : "hidden"} items-center justify-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-100 disabled:opacity-60`}
                          >
                            <UserRoundX size={12} />
                            Cảnh báo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={workingKey === `delete-${item.id}`}
                            className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
                          >
                            <Trash2 size={12} />
                            Xóa
                          </button>
                          {latestStatus !== "PENDING" ? (
                            <span className="inline-flex items-center justify-center gap-1 px-1 py-1 text-xs text-slate-400">
                              <CheckCircle size={12} />
                              Đã xử lý
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1 px-1 py-1 text-xs text-slate-300">
                              <RotateCcw size={12} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

export default ReportedCommentsTab;
