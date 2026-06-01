import { useCallback, useEffect, useState } from "react";
import { Check, GraduationCap, Loader2, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import adminCoachApplicationService from "../../services/admin/coachApplicationService";
import type { CoachApplication, CoachApplicationStatus } from "../../types/coachApplication";
import UserAvatar from "../../components/ui/admin/UserAvatar";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import AdminSpinner from "../../components/ui/admin/AdminSpinner";
import AdminStatusBadge from "../../components/ui/admin/AdminStatusBadge";

const LIMIT = 10;

const STATUS_OPTIONS: { value: "" | CoachApplicationStatus; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
];

const STATUS_BADGE: Record<
  CoachApplicationStatus,
  { label: string; color: string }
> = {
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

const CoachApplicationManagementPage = () => {
  const [applications, setApplications] = useState<CoachApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("PENDING");
  const [search, setSearch] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<CoachApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [detailApp, setDetailApp] = useState<CoachApplication | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCoachApplicationService.getApplicationsService({
        page,
        limit: LIMIT,
        status: status || undefined,
        search: search || undefined,
      });
      const data = res.data.data;
      setApplications(data.applications || []);
      setTotal(data.pagination?.total || 0);
      setPendingCount(data.pendingCount || 0);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách yêu cầu dạy cầu lông");
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = async (app: CoachApplication) => {
    if (
      !window.confirm(
        `Duyệt yêu cầu dạy cầu lông của ${app.user?.fullName || app.user?.username}?`,
      )
    ) {
      return;
    }
    setActingId(app.id);
    try {
      await adminCoachApplicationService.approveApplicationService(app.id);
      toast.success("Đã duyệt yêu cầu dạy cầu lông");
      fetchApplications();
      setDetailApp(null);
    } catch (err: any) {
      toast.error(err?.message || "Không thể duyệt yêu cầu");
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
      toast.error(err?.message || "Không thể từ chối yêu cầu");
    } finally {
      setActingId(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <AdminPageHeader title="Yêu cầu đăng ký dạy cầu lông" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-medium text-amber-700">Chờ duyệt</p>
            <p className="mt-1 text-2xl font-bold text-amber-900">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-xs font-medium text-sky-700">Tổng (filter hiện tại)</p>
            <p className="mt-1 text-2xl font-bold text-sky-900">{total}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-medium text-emerald-700">Trang hiện tại</p>
            <p className="mt-1 text-2xl font-bold text-emerald-900">
              {applications.length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setPage(1);
                }}
                placeholder="Username, email..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setPage(1);
              fetchApplications();
            }}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Tìm kiếm
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200">
          {loading ? (
            <AdminSpinner />
          ) : applications.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-400">
              Không có yêu cầu nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    {["Người gửi", "Kinh nghiệm", "Trạng thái", "Ngày gửi", "Thao tác"].map(
                      (h) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-center font-semibold ${
                            h === "Thao tác" ? "min-w-[220px]" : ""
                          }`}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            src={app.user?.avatar}
                            name={app.user?.fullName || app.user?.username || "?"}
                            className="h-9 w-9 rounded-lg border border-gray-200"
                          />
                          <div className="min-w-0 text-left">
                            <p className="truncate font-semibold text-gray-800">
                              {app.user?.fullName || app.user?.username}
                            </p>
                            <p className="truncate text-xs text-gray-400">
                              {app.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {app.experienceYears} năm
                      </td>
                      <td className="px-4 py-3 text-center">
                        <AdminStatusBadge
                          color={STATUS_BADGE[app.status].color}
                          label={STATUS_BADGE[app.status].label}
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-gray-500">
                        {new Date(app.createdDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <div className="inline-flex flex-nowrap items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailApp(app)}
                            className="shrink-0 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
                          >
                            Chi tiết
                          </button>
                          {app.status === "PENDING" && (
                            <>
                              <button
                                type="button"
                                disabled={actingId === app.id}
                                onClick={() => handleApprove(app)}
                                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
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
                                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                              >
                                <X className="h-3 w-3" />
                                Từ chối
                              </button>
                            </>
                          )}
                        </div>
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
        </div>
      </div>

      {detailApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Chi tiết yêu cầu dạy cầu lông</h3>
                  <p className="text-xs text-gray-500">
                    {detailApp.user?.fullName || detailApp.user?.username}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailApp(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p>
                <span className="font-medium">Kinh nghiệm:</span>{" "}
                {detailApp.experienceYears} năm
              </p>
              <p>
                <span className="font-medium">Chứng chỉ:</span>{" "}
                {detailApp.certificate}
              </p>
              {detailApp.phoneContact && (
                <p>
                  <span className="font-medium">Liên hệ:</span>{" "}
                  {detailApp.phoneContact}
                </p>
              )}
              <div>
                <p className="font-medium">Giới thiệu:</p>
                <p className="mt-1 whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-gray-600">
                  {detailApp.introduction}
                </p>
              </div>
              {detailApp.certificateImages?.length > 0 && (
                <div>
                  <p className="mb-2 font-medium">Ảnh chứng chỉ:</p>
                  <div className="flex flex-wrap gap-2">
                    {detailApp.certificateImages.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block h-20 w-20 overflow-hidden rounded-lg border border-gray-200"
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {detailApp.rejectReason && (
                <p className="text-red-600">
                  <span className="font-medium">Lý do từ chối:</span>{" "}
                  {detailApp.rejectReason}
                </p>
              )}
            </div>

            {detailApp.status === "PENDING" && (
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  disabled={actingId === detailApp.id}
                  onClick={() => handleApprove(detailApp)}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Duyệt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectModal(detailApp);
                    setRejectReason("");
                  }}
                  className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                >
                  Từ chối
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="font-bold text-gray-900">Từ chối yêu cầu dạy cầu lông</h3>
            <p className="mt-1 text-sm text-gray-500">
              {rejectModal.user?.fullName || rejectModal.user?.username}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Nhập lý do từ chối..."
              className="mt-4 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={actingId === rejectModal.id}
                onClick={handleReject}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachApplicationManagementPage;
