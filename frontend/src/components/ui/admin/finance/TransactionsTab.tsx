import { useCallback, useEffect, useState } from "react";
import { CreditCard, Search, X } from "lucide-react";
import adminFinanceService from "../../../../services/admin/financeService";
import type { AdminWalletTransaction } from "../../../../types/admin";
import {
  TX_STATUS_CONFIG,
  TX_TYPE_CONFIG,
  fmtCurrency,
  fmtDate,
} from "../../../../utils/constants/adminConstant";
import AdminPagination from "../AdminPagination";
import AdminUserCell from "../AdminUserCell";

const LIMIT = 10;

const TransactionsTab = () => {
  const [transactions, setTransactions] = useState<AdminWalletTransaction[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFinanceService.getWalletTransactionsService({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      const data = (res.data as any).data;
      setTransactions(data.transactions || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      setTransactions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, typeFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);
  const hasFilters =
    searchInput || typeFilter || statusFilter || dateFrom || dateTo;

  const resetFilters = () => {
    setSearchInput("");
    setAppliedSearch("");
    setTypeFilter("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <section>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px_180px_160px_160px_auto]">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tên, email, mô tả giao dịch..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 text-[13px] outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Loại giao dịch
            </label>
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
            >
              <option value="">Tất cả</option>
              {Object.entries(TX_TYPE_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
            >
              <option value="">Tất cả</option>
              {Object.entries(TX_STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
            />
          </div>

          {hasFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex h-11 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" /> Xóa lọc
            </button>
          ) : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-400">
            Không có giao dịch
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  {[
                    "#",
                    "Người dùng",
                    "Loại",
                    "Số tiền",
                    "Mô tả",
                    "Trạng thái",
                    "Ngày tạo",
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
                {transactions.map((transaction, index) => {
                  const typeConf = TX_TYPE_CONFIG[transaction.type] || {
                    label: transaction.type,
                    color: "bg-slate-50 text-slate-600 border-slate-200",
                    icon: CreditCard,
                  };
                  const statusConf = TX_STATUS_CONFIG[transaction.status] || {
                    label: transaction.status,
                    color: "bg-slate-50 text-slate-500 border-slate-200",
                  };
                  const TypeIcon = typeConf.icon;
                  return (
                    <tr
                      key={transaction.id}
                      className="transition hover:bg-sky-50/40"
                    >
                      <td className="px-3 py-3 text-center text-slate-400">
                        {(page - 1) * LIMIT + index + 1}
                      </td>
                      <td className="px-3 py-3">
                        <AdminUserCell
                          avatar={transaction.avatar}
                          fullName={transaction.fullName}
                          username={transaction.username}
                          email={transaction.email}
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${typeConf.color}`}
                        >
                          <TypeIcon className="h-3 w-3" /> {typeConf.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-slate-800">
                        {fmtCurrency(transaction.amount)}
                      </td>
                      <td className="max-w-[220px] px-3 py-3 text-center">
                        <p className="truncate text-xs text-slate-600">
                          {transaction.description || "-"}
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
                        {fmtDate(transaction.createdAt)}
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

export default TransactionsTab;
