import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Lock, Search, Unlock } from "lucide-react";
import { toast } from "react-toastify";
import adminFinanceService from "../../../../services/admin/financeService";
import type { AdminUserWallet } from "../../../../types/admin";
import {
  fmtCurrency,
  fmtDate,
} from "../../../../utils/constants/adminConstant";
import { showConfirmDialog } from "../../../../utils/confirmDialog";
import AdminPagination from "../AdminPagination";
import AdminUserCell from "../AdminUserCell";

const LIMIT = 10;

const WalletsTab = () => {
  const [wallets, setWallets] = useState<AdminUserWallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [toggling, setToggling] = useState(false);

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFinanceService.getUserWalletsService({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
      });
      const data = (res.data as any).data;
      setWallets(data.wallets || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setWallets([]);
      setTotal(0);
      toast.error(err?.response?.data?.message || "Không thể tải danh sách ví");
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, statusFilter]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleToggle = async (wallet: AdminUserWallet) => {
    const newStatus = wallet.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    if (wallet.status === "ACTIVE") {
      const confirmed = await showConfirmDialog(
        "Khóa ví?",
        `Khóa ví của ${wallet.fullName || wallet.username}? Người dùng sẽ không thể nạp, rút hoặc thanh toán.`,
        "Khóa ví",
        "Hủy",
        "danger",
      );
      if (!confirmed) return;
    }

    setToggling(true);
    try {
      await adminFinanceService.toggleWalletStatusService(wallet.id, newStatus);
      toast.success(newStatus === "LOCKED" ? "Đã khóa ví" : "Đã mở khóa ví");
      fetchWallets();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setToggling(false);
    }
  };

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  return (
    <div className="space-y-5">
      <section>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Tìm kiếm người dùng
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tên, email..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 text-[13px] outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Trạng thái ví
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
                <option value="ACTIVE">Hoạt động</option>
                <option value="LOCKED">Đã khóa</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      {wallets.length > 0 ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-700">
          Tổng số dư đang hiển thị: <b>{fmtCurrency(totalBalance)}</b> ·{" "}
          {wallets.length} ví
        </div>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : wallets.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-400">
            Không có dữ liệu
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  {[
                    "#",
                    "Người dùng",
                    "Số dư",
                    "Trạng thái",
                    "Ngày tạo",
                    "Thao tác",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-center font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 [&_td]:align-top">
                {wallets.map((wallet, index) => (
                  <tr key={wallet.id} className="transition hover:bg-sky-50/40">
                    <td className="px-4 py-3 text-center text-slate-400">
                      {(page - 1) * LIMIT + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <AdminUserCell
                        avatar={wallet.avatar}
                        fullName={wallet.fullName}
                        username={wallet.username}
                        email={wallet.email}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-base font-bold ${wallet.balance > 0 ? "text-sky-700" : "text-slate-400"}`}
                      >
                        {fmtCurrency(wallet.balance)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded border px-2 py-0.5 text-xs font-semibold ${
                          wallet.status === "ACTIVE"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-600"
                        }`}
                      >
                        {wallet.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">
                      {fmtDate(wallet.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(wallet)}
                        disabled={toggling}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white transition ${
                          wallet.status === "ACTIVE"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {wallet.status === "ACTIVE" ? (
                          <>
                            <Lock className="h-3.5 w-3.5" /> Khóa
                          </>
                        ) : (
                          <>
                            <Unlock className="h-3.5 w-3.5" /> Mở khóa
                          </>
                        )}
                      </button>
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
      </section>
    </div>
  );
};

export default WalletsTab;
