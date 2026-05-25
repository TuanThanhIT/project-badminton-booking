import { useState, useCallback, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "react-toastify";
import adminFinanceService from "../../../../services/admin/financeService";
import type { AdminWalletTransaction } from "../../../../types/admin";
import { TX_TYPE_CONFIG, TX_STATUS_CONFIG, fmtCurrency, fmtDate } from "../../../../utils/constants/adminConstant";
import AdminPagination from "../AdminPagination";
import AdminUserCell from "../AdminUserCell";

const LIMIT = 15;

const TransactionsTab = () => {
  const [transactions, setTransactions] = useState<AdminWalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFinanceService.getWalletTransactionsService({
        page, limit: LIMIT,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      const data = (res.data as any).data;
      setTransactions(data.transactions || []);
      setTotal(data.pagination?.total || 0);
    } catch { toast.error("Không thể tải giao dịch"); }
    finally { setLoading(false); }
  }, [page, typeFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const totalPages = Math.ceil(total / LIMIT);

  const resetFilters = () => {
    setTypeFilter(""); setStatusFilter(""); setDateFrom(""); setDateTo(""); setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Loại giao dịch</label>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition">
            <option value="">Tất cả</option>
            {Object.entries(TX_TYPE_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition">
            <option value="">Tất cả</option>
            {Object.entries(TX_STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Từ ngày</label>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Đến ngày</label>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition" />
        </div>
        {(typeFilter || statusFilter || dateFrom || dateTo) && (
          <button onClick={resetFilters}
            className="py-2 px-3 rounded-lg border border-gray-300 text-sm text-gray-500 hover:bg-gray-50 transition self-end">
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-sm">Không có giao dịch</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                {["#", "Người dùng", "Loại", "Số tiền", "Mô tả", "Trạng thái", "Ngày tạo"].map((h) => (
                  <th key={h} className="text-center px-3 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 [&_td]:align-top">
              {transactions.map((t, idx) => {
                const typeConf = TX_TYPE_CONFIG[t.type] || { label: t.type, color: "bg-gray-50 text-gray-600 border-gray-200", icon: CreditCard };
                const statusConf = TX_STATUS_CONFIG[t.status] || { label: t.status, color: "bg-gray-50 text-gray-500 border-gray-200" };
                const TypeIcon = typeConf.icon;
                return (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-center text-gray-400">{(page - 1) * LIMIT + idx + 1}</td>
                    <td className="px-3 py-3"><AdminUserCell avatar={t.avatar} fullName={t.fullName} username={t.username} email={t.email} /></td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${typeConf.color}`}>
                        <TypeIcon className="w-3 h-3" />{typeConf.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-gray-800">{fmtCurrency(t.amount)}</td>
                    <td className="px-3 py-3 text-center max-w-[180px]">
                      <p className="text-xs text-gray-600 truncate">{t.description || "—"}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${statusConf.color}`}>{statusConf.label}</span>
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-gray-500">{fmtDate(t.createdDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <AdminPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
      </div>
    </div>
  );
};

export default TransactionsTab;
