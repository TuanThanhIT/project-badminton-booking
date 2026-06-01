import { useState, useCallback, useEffect } from "react";
import { Search, Lock, Unlock } from "lucide-react";
import { toast } from "react-toastify";
import adminFinanceService from "../../../../services/admin/financeService";
import type { AdminUserWallet } from "../../../../types/admin";
import { fmtCurrency, fmtDate } from "../../../../utils/constants/adminConstant";
import AdminPagination from "../AdminPagination";
import AdminUserCell from "../AdminUserCell";
import AdminConfirmModal from "../AdminConfirmModal";

const LIMIT = 15;

const WalletsTab = () => {
  const [wallets, setWallets] = useState<AdminUserWallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [toggleModal, setToggleModal] = useState<{ open: boolean; wallet: AdminUserWallet | null }>({
    open: false, wallet: null,
  });
  const [toggling, setToggling] = useState(false);

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFinanceService.getUserWalletsService({
        page, limit: LIMIT, search: appliedSearch || undefined,
      });
      const data = (res.data as any).data;
      setWallets(data.wallets || []);
      setTotal(data.pagination?.total || 0);
    } catch { toast.error("Không thể tải danh sách ví"); }
    finally { setLoading(false); }
  }, [page, appliedSearch]);

  useEffect(() => { fetchWallets(); }, [fetchWallets]);

  const handleToggle = async () => {
    if (!toggleModal.wallet) return;
    const newStatus = toggleModal.wallet.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    setToggling(true);
    try {
      await adminFinanceService.toggleWalletStatusService(toggleModal.wallet.id, newStatus);
      toast.success(newStatus === "LOCKED" ? "Đã khóa ví" : "Đã mở khóa ví");
      setToggleModal({ open: false, wallet: null });
      fetchWallets();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    } finally { setToggling(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Tìm kiếm người dùng</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setAppliedSearch(searchInput); setPage(1); } }}
              placeholder="Tên, email..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 transition" />
          </div>
        </div>
        <button onClick={() => { setAppliedSearch(searchInput); setPage(1); }}
          className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition">
          Tìm kiếm
        </button>
      </div>

      {wallets.length > 0 && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-700">
          Tổng số dư trên trang này: <b>{fmtCurrency(totalBalance)}</b> · {wallets.length} ví
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14"><div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : wallets.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-sm">Không có dữ liệu</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                {["#", "Người dùng", "Số dư", "Trạng thái", "Ngày tạo", "Thao tác"].map((h) => (
                  <th key={h} className="text-center px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 [&_td]:align-top">
              {wallets.map((w, idx) => (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-center text-gray-400">{(page - 1) * LIMIT + idx + 1}</td>
                  <td className="px-4 py-3"><AdminUserCell avatar={w.avatar} fullName={w.fullName} username={w.username} email={w.email} /></td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold text-base ${w.balance > 0 ? "text-sky-700" : "text-gray-400"}`}>
                      {fmtCurrency(w.balance)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${
                      w.status === "ACTIVE"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}>
                      {w.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">{fmtDate(w.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setToggleModal({ open: true, wallet: w })}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-xs font-semibold transition ${
                        w.status === "ACTIVE" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                      }`}>
                      {w.status === "ACTIVE"
                        ? <><Lock className="w-3.5 h-3.5" /> Khóa</>
                        : <><Unlock className="w-3.5 h-3.5" /> Mở khóa</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <AdminPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
      </div>

      <AdminConfirmModal
        open={toggleModal.open}
        title={toggleModal.wallet?.status === "ACTIVE" ? "Xác nhận khóa ví" : "Xác nhận mở khóa ví"}
        message={
          toggleModal.wallet?.status === "ACTIVE"
            ? `Khóa ví của ${toggleModal.wallet?.fullName || toggleModal.wallet?.username}? Người dùng sẽ không thể nạp, rút hoặc thanh toán.`
            : `Mở khóa ví của ${toggleModal.wallet?.fullName || toggleModal.wallet?.username}? Người dùng có thể giao dịch bình thường.`
        }
        confirmLabel={toggleModal.wallet?.status === "ACTIVE" ? "Khóa ví" : "Mở khóa ví"}
        confirmClass={toggleModal.wallet?.status === "ACTIVE" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
        icon={
          toggleModal.wallet?.status === "ACTIVE"
            ? <Lock className="w-6 h-6 text-red-500" />
            : <Unlock className="w-6 h-6 text-green-500" />
        }
        loading={toggling}
        onConfirm={handleToggle}
        onCancel={() => setToggleModal({ open: false, wallet: null })}
      />
    </div>
  );
};

export default WalletsTab;
