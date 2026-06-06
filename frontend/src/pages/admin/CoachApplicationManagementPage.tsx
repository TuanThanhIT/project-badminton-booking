import { useCallback, useEffect, useState } from "react";
import { Check, CheckCircle, ChevronDown, Clock3, FileText, GraduationCap, Loader2, Search, X, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminSpinner from "../../components/ui/admin/AdminSpinner";
import AdminStatusBadge from "../../components/ui/admin/AdminStatusBadge";
import UserAvatar from "../../components/ui/admin/UserAvatar";
import adminCoachApplicationService from "../../services/admin/coachApplicationService";
import type { CoachApplication, CoachApplicationStatus } from "../../types/coachApplication";
import { showConfirmDialog } from "../../utils/confirmDialog";

const LIMIT = 10;

const STATUS_OPTIONS: { value: "" | CoachApplicationStatus; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
];

const STATUS_BADGE: Record<CoachApplicationStatus, { label: string; color: string }> = {
  PENDING: {
    label: "Chờ duyệt",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  APPROVED: {
    label: "Đã duyệt",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Từ chối",
    color: "bg-red-50 text-red-600 border-red-200",
  },
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
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

const CoachApplicationManagementPage = () => {
  const [applications, setApplications] = useState<CoachApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("PENDING");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<CoachApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [detailApp, setDetailApp] = useState<CoachApplication | null>(null);

  const fetchApplications = useCallback(
    async (overrides?: { page?: number; status?: string; search?: string }) => {
      const p = overrides?.page ?? page;
      const s = overrides?.status ?? status;
      const search = overrides?.search ?? appliedSearch;

      setLoading(true);
      try {
        const res = await adminCoachApplicationService.getApplicationsService({
          page: p,
          limit: LIMIT,
          status: s || undefined,
          search: search || undefined,
        });
        const data = res.data.data;
        setApplications(data.applications || []);
        setTotal(data.pagination?.total || 0);
        setPendingCount(data.pendingCount || 0);
      } catch (err: any) {
        setApplications([]);
        setTotal(0);
        toast.error(err?.response?.data?.message || "Không thể tải danh sách yêu cầu dạy cầu lông");
      } finally {
        setLoading(false);
      }
    },
    [page, status, appliedSearch],
  );

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleApprove = async (app: CoachApplication) => {
    const confirmed = await showConfirmDialog(
      "Duyệt yêu cầu dạy cầu lông?",
      `Duyệt yêu cầu của ${app.user?.fullName || app.user?.username}?`,
      "Duyệt",
      "Hủy",
      "question",
    );
    if (!confirmed) return;

    setActingId(app.id);
    try {
      await adminCoachApplicationService.approveApplicationService(app.id);
      toast.success("Đã duyệt yêu cầu dạy cầu lông");
      setDetailApp(null);
      // switch filter to "APPROVED" so admin sees approved items immediately
      setStatus("APPROVED");
      setPage(1);
      fetchApplications({ page: 1, status: "APPROVED" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể duyệt yêu cầu");
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    if (rejectReason.trim().length < 5) {
      toast.error("Lý do từ chối cần ít nhất 5 ký tự");
      return;
    }

    setActingId(rejectModal.id);
    try {
      await adminCoachApplicationService.rejectApplicationService(
        rejectModal.id,
        rejectReason.trim(),
      );
      toast.success("Đã từ chối yêu cầu dạy cầu lông");
      setRejectModal(null);
      setRejectReason("");
      setDetailApp(null);
      fetchApplications();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể từ chối yêu cầu");
    } finally {
      setActingId(null);
    }
  };

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);
  const approvedInPage = applications.filter((app) => app.status === "APPROVED").length;
  const rejectedInPage = applications.filter((app) => app.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Yêu cầu dạy cầu lông"
        subtitle="Xem xét hồ sơ đăng ký huấn luyện, duyệt hoặc từ chối yêu cầu nâng quyền dạy cầu lông."
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Tổng theo bộ lọc" value={total} icon={FileText} color="bg-sky-50 border-sky-200 text-sky-700" />
        <StatCard label="Chờ duyệt" value={pendingCount} icon={Clock3} color="bg-amber-50 border-amber-200 text-amber-700" />
        <StatCard label="Đã duyệt đang hiển thị" value={approvedInPage} icon={CheckCircle} color="bg-emerald-50 border-emerald-200 text-emerald-700" />
        <StatCard label="Đã từ chối đang hiển thị" value={rejectedInPage} icon={XCircle} color="bg-red-50 border-red-200 text-red-700" />
      </div>

      <section>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setAppliedSearch(searchInput.trim());
                    setPage(1);
                  }
                }}
                placeholder="Tên đăng nhập, email..."
                className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Trạng thái</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="h-11 appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <AdminSpinner />
        ) : applications.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-400">Không có yêu cầu nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  {["#", "Người gửi", "Kinh nghiệm", "Trạng thái", "Ngày gửi", "Thao tác"].map((header) => (
                    <th key={header} className="px-4 py-3 text-center font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app, index) => (
                  <tr key={app.id} className="transition hover:bg-sky-50/40">
                    <td className="px-4 py-3 text-center text-slate-400">{(page - 1) * LIMIT + index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={app.user?.avatar}
                          name={app.user?.fullName || app.user?.username || "?"}
                          className="h-9 w-9 rounded-lg border border-slate-200"
                        />
                        <div className="min-w-0 text-left">
                          <p className="truncate font-semibold text-slate-800">
                            {app.user?.fullName || app.user?.username}
                          </p>
                          <p className="truncate text-xs text-slate-400">{app.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {app.experienceYears} năm
                    </td>
                    <td className="px-4 py-3 text-center">
                      <AdminStatusBadge
                        color={STATUS_BADGE[app.status].color}
                        label={STATUS_BADGE[app.status].label}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailApp(app)}
                          className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-100"
                        >
                          Chi tiết
                        </button>
                        {app.status === "PENDING" ? (
                          <>
                            <button
                              type="button"
                              disabled={actingId === app.id}
                              onClick={() => handleApprove(app)}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                            >
                              {actingId === app.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              Duyệt
                            </button>
                            <button
                              type="button"
                              disabled={actingId === app.id}
                              onClick={() => {
                                setRejectModal(app);
                                setRejectReason("");
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              <X className="h-3 w-3" />
                              Từ chối
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
      </section>

      {detailApp ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Chi tiết yêu cầu</h3>
                  <p className="text-xs text-slate-500">
                    {detailApp.user?.fullName || detailApp.user?.username}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailApp(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p>
                <span className="font-medium">Kinh nghiệm:</span> {detailApp.experienceYears} năm
              </p>
              <p>
                <span className="font-medium">Chứng chỉ:</span> {detailApp.certificate}
              </p>
              {detailApp.phoneContact ? (
                <p>
                  <span className="font-medium">Liên hệ:</span> {detailApp.phoneContact}
                </p>
              ) : null}
              <div>
                <p className="font-medium">Giới thiệu:</p>
                <p className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-slate-600">
                  {detailApp.introduction}
                </p>
              </div>
              {detailApp.certificateImages?.length > 0 ? (
                <div>
                  <p className="mb-2 font-medium">Ảnh chứng chỉ:</p>
                  <div className="flex flex-wrap gap-2">
                    {detailApp.certificateImages.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block h-20 w-20 overflow-hidden rounded-lg border border-slate-200"
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
              {detailApp.rejectReason ? (
                <p className="text-red-600">
                  <span className="font-medium">Lý do từ chối:</span> {detailApp.rejectReason}
                </p>
              ) : null}
            </div>

            {detailApp.status === "PENDING" ? (
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  disabled={actingId === detailApp.id}
                  onClick={() => handleApprove(detailApp)}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  Duyệt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectModal(detailApp);
                    setRejectReason("");
                  }}
                  className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Từ chối
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {rejectModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="font-bold text-slate-900">Từ chối yêu cầu dạy cầu lông</h3>
            <p className="mt-1 text-sm text-slate-500">
              {rejectModal.user?.fullName || rejectModal.user?.username}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Nhập lý do từ chối..."
              className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={actingId === rejectModal.id}
                onClick={handleReject}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CoachApplicationManagementPage;
