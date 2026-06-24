import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import adminFinanceService from "../../../../services/admin/financeService";
import type { AdminWithdrawRequest } from "../../../../types/admin";
import {
  WITHDRAW_STATUS_CONFIG,
  fmtCurrency,
  fmtDate,
} from "../../../../utils/constants/adminConstant";
import AdminConfirmModal from "../AdminConfirmModal";
import AdminPagination from "../AdminPagination";
import AdminUserCell from "../AdminUserCell";

const LIMIT = 10;

const WithdrawTab = ({
  onProcessed,
}: {
  onProcessed?: () => void | Promise<void>;
}) => {
  const [requests, setRequests] = useState<AdminWithdrawRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("CONFIRMED");

  const [modal, setModal] = useState<{
    open: boolean;
    id: number;
    action: "approve" | "reject";
  }>({
    open: false,
    id: 0,
    action: "approve",
  });
  const [processing, setProcessing] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFinanceService.getWithdrawRequestsService({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
      });
      const data = (res.data as any).data;
      setRequests(data.requests || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setRequests([]);
      setTotal(0);
      toast.error(
        err?.response?.data?.message || "Không thể tải yêu cầu rút tiền",
      );
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const openModal = (id: number, action: "approve" | "reject") =>
    setModal({ open: true, id, action });

  const closeModal = () => setModal((prev) => ({ ...prev, open: false }));

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      if (modal.action === "approve") {
        await adminFinanceService.approveWithdrawRequestService(modal.id);
        toast.success("Đã duyệt, tiền đã được trừ khỏi ví người dùng");
      } else {
        await adminFinanceService.rejectWithdrawRequestService(modal.id);
        toast.success("Đã từ chối, tiền được hoàn lại vào số dư khả dụng");
      }
      closeModal();
      await Promise.all([fetchRequests(), onProcessed?.()]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xử lý thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);
  const selectedReq = requests.find((request) => request.id === modal.id);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <b>Quy trình:</b> Lọc theo <b>Đã xác nhận</b>, admin chuyển khoản thực
          tế ra ngân hàng người dùng, rồi nhấn <b>Duyệt</b> để trừ tiền trong hệ
          thống.
        </span>
      </div>

      <section>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
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
                placeholder="Tên, email, ngân hàng, số tài khoản..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 text-[13px] outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              />
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
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-[13px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              >
                <option value="">Tất cả</option>
                {Object.entries(WITHDRAW_STATUS_CONFIG).map(
                  ([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ),
                )}
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
        ) : requests.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-400">
            Không có yêu cầu rút tiền
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1024px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  {[
                    "#",
                    "Người dùng",
                    "Số tiền",
                    "Thông tin ngân hàng",
                    "Trạng thái",
                    "Ngày tạo",
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
                {requests.map((request, index) => {
                  const statusConf = WITHDRAW_STATUS_CONFIG[request.status] || {
                    label: request.status,
                    color: "bg-slate-50 text-slate-500 border-slate-200",
                  };
                  const canProcess = request.status === "CONFIRMED";
                  return (
                    <tr
                      key={request.id}
                      className="transition hover:bg-sky-50/40"
                    >
                      <td className="px-3 py-3 text-center text-slate-400">
                        {(page - 1) * LIMIT + index + 1}
                      </td>
                      <td className="px-3 py-3">
                        <AdminUserCell
                          avatar={request.avatar}
                          fullName={request.fullName}
                          username={request.username}
                          email={request.email}
                        />
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-red-600">
                        {fmtCurrency(request.amount)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <p className="text-xs font-semibold text-slate-800">
                          {request.bankName}
                        </p>
                        <p className="font-mono text-xs text-slate-500">
                          {request.bankAccount}
                        </p>
                        <p className="text-xs text-slate-400">
                          {request.accountHolder}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`rounded border px-2 py-0.5 text-xs font-semibold ${statusConf.color}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-slate-500">
                        {fmtDate(request.createdAt)}
                        {request.processedAt ? (
                          <p className="text-slate-400">
                            Xử lý: {fmtDate(request.processedAt)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {canProcess ? (
                          <div className="flex justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openModal(request.id, "approve")}
                              className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-green-600"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() => openModal(request.id, "reject")}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
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

      <AdminConfirmModal
        open={modal.open}
        title={
          modal.action === "approve"
            ? "Xác nhận duyệt rút tiền"
            : "Xác nhận từ chối rút tiền"
        }
        message={
          modal.action === "approve"
            ? `Bạn xác nhận đã chuyển khoản ${selectedReq ? fmtCurrency(selectedReq.amount) : ""} cho ${selectedReq?.accountHolder} (${selectedReq?.bankName} - ${selectedReq?.bankAccount}). Hệ thống sẽ trừ tiền khỏi ví người dùng.`
            : `Từ chối yêu cầu rút ${selectedReq ? fmtCurrency(selectedReq.amount) : ""}. Số tiền sẽ được hoàn lại vào số dư khả dụng của người dùng.`
        }
        confirmLabel={
          modal.action === "approve"
            ? "Đã chuyển khoản, duyệt"
            : "Từ chối yêu cầu"
        }
        confirmClass={
          modal.action === "approve"
            ? "bg-green-500 hover:bg-green-600"
            : "bg-red-500 hover:bg-red-600"
        }
        icon={
          modal.action === "approve" ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <XCircle className="h-6 w-6 text-red-500" />
          )
        }
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />
    </div>
  );
};

export default WithdrawTab;
