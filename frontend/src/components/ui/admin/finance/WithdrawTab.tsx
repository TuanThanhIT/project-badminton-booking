import { useState, useCallback, useEffect } from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import adminFinanceService from "../../../../services/admin/financeService";
import type { AdminWithdrawRequest } from "../../../../types/admin";
import { WITHDRAW_STATUS_CONFIG, fmtCurrency, fmtDate } from "../../../../utils/constants/adminConstant";
import AdminPagination from "../AdminPagination";
import AdminUserCell from "../AdminUserCell";
import AdminConfirmModal from "../AdminConfirmModal";

const LIMIT = 10;

const WithdrawTab = () => {
  const [requests, setRequests] = useState<AdminWithdrawRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("CONFIRMED");

  const [modal, setModal] = useState<{ open: boolean; id: number; action: "approve" | "reject" }>({
    open: false, id: 0, action: "approve",
  });
  const [processing, setProcessing] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFinanceService.getWithdrawRequestsService({
        page, limit: LIMIT, status: statusFilter || undefined,
      });
      const data = (res.data as any).data;
      setRequests(data.requests || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      setRequests([]);
      setTotal(0);
    }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openModal = (id: number, action: "approve" | "reject") =>
    setModal({ open: true, id, action });

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      if (modal.action === "approve") {
        await adminFinanceService.approveWithdrawRequestService(modal.id);
        toast.success("Đã duyệt — tiền đã được trừ khỏi ví người dùng");
      } else {
        await adminFinanceService.rejectWithdrawRequestService(modal.id);
        toast.success("Đã từ chối — tiền được hoàn lại vào số dư khả dụng");
      }
      closeModal();
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xử lý thất bại");
    } finally { setProcessing(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const selectedReq = requests.find((r) => r.id === modal.id);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex gap-2 items-start">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          <b>Quy trình:</b> Lọc theo <b>Đã xác nhận</b> → Admin chuyển khoản thực tế ra ngân hàng người dùng → Nhấn <b>Duyệt</b> để trừ tiền trong hệ thống. Nhấn <b>Từ chối</b> nếu không thể thực hiện.
        </span>
      </div>

      <div className="flex gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition">
            <option value="">Tất cả</option>
            {Object.entries(WITHDRAW_STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-sm">Không có yêu cầu rút tiền</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                {["#", "Người dùng", "Số tiền", "Thông tin ngân hàng", "Trạng thái", "Ngày tạo", "Thao tác"].map((h) => (
                  <th key={h} className="text-center px-3 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 [&_td]:align-top">
              {requests.map((r, idx) => {
                const statusConf = WITHDRAW_STATUS_CONFIG[r.status] || { label: r.status, color: "bg-gray-50 text-gray-500 border-gray-200" };
                const canProcess = r.status === "CONFIRMED";
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-center text-gray-400">{(page - 1) * LIMIT + idx + 1}</td>
                    <td className="px-3 py-3"><AdminUserCell avatar={r.avatar} fullName={r.fullName} username={r.username} email={r.email} /></td>
                    <td className="px-3 py-3 text-center font-bold text-red-600">{fmtCurrency(r.amount)}</td>
                    <td className="px-3 py-3 text-center">
                      <p className="text-xs font-semibold text-gray-800">{r.bankName}</p>
                      <p className="text-xs text-gray-500 font-mono">{r.bankAccount}</p>
                      <p className="text-xs text-gray-400">{r.accountHolder}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${statusConf.color}`}>{statusConf.label}</span>
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-gray-500">
                      {fmtDate(r.createdAt)}
                      {r.processedAt && <p className="text-gray-400">Xử lý: {fmtDate(r.processedAt)}</p>}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {canProcess ? (
                        <div className="flex gap-1.5 justify-center">
                          <button onClick={() => openModal(r.id, "approve")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition">
                            <CheckCircle className="w-3.5 h-3.5" /> Duyệt
                          </button>
                          <button onClick={() => openModal(r.id, "reject")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition">
                            <XCircle className="w-3.5 h-3.5" /> Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <AdminPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
      </div>

      <AdminConfirmModal
        open={modal.open}
        title={modal.action === "approve" ? "Xác nhận duyệt rút tiền" : "Xác nhận từ chối rút tiền"}
        message={
          modal.action === "approve"
            ? `Bạn xác nhận đã chuyển khoản ${selectedReq ? fmtCurrency(selectedReq.amount) : ""} cho ${selectedReq?.accountHolder} (${selectedReq?.bankName} - ${selectedReq?.bankAccount}). Hệ thống sẽ trừ tiền khỏi ví người dùng.`
            : `Từ chối yêu cầu rút ${selectedReq ? fmtCurrency(selectedReq.amount) : ""}. Số tiền sẽ được hoàn lại vào số dư khả dụng của người dùng.`
        }
        confirmLabel={modal.action === "approve" ? "Đã chuyển khoản, Duyệt" : "Từ chối yêu cầu"}
        confirmClass={modal.action === "approve" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
        icon={
          modal.action === "approve"
            ? <CheckCircle className="w-6 h-6 text-green-500" />
            : <XCircle className="w-6 h-6 text-red-500" />
        }
        loading={processing}
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />
    </div>
  );
};

export default WithdrawTab;
