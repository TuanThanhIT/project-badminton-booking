import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Shield, Search, Plus, ChevronDown, Building2,
  ArrowLeftRight, Trash2, Lock, Unlock, CheckCircle,
  ChevronLeft, ChevronRight, Users, Mail, Phone,
} from "lucide-react";
import { toast } from "react-toastify";
import adminManagerService from "../../services/admin/managerService";
import adminBranchService from "../../services/admin/branchService";
import adminUserService from "../../services/admin/userService";
import type { AdminManager, AdminBranchOption } from "../../types/admin";
import UserAvatar from "../../components/ui/admin/UserAvatar";
import AdminSpinner from "../../components/ui/admin/AdminSpinner";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import CreateManagerModal from "../../components/ui/admin/managers/CreateManagerModal";
import BranchManageModal from "../../components/ui/admin/managers/BranchManageModal";
import ChangeRoleModal from "../../components/ui/admin/managers/ChangeRoleModal";
import DeleteManagerModal from "../../components/ui/admin/managers/DeleteManagerModal";

const StatCard = ({
  label, value, icon: Icon, bg, text, border,
}: { label: string; value: number; icon: React.ElementType; bg: string; text: string; border: string }) => (
  <div className={`flex items-center gap-4 rounded-2xl border ${border} ${bg} px-5 py-4`}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${text} bg-white/60 shrink-0`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className={`text-2xl font-bold ${text}`}>{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const ManagerManagementPage = () => {
  const [allManagers, setAllManagers] = useState<AdminManager[]>([]);
  const [branches,    setBranches]    = useState<AdminBranchOption[]>([]);
  const [loading,     setLoading]     = useState(false);

  const [searchInput,   setSearchInput]   = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [branchFilter,  setBranchFilter]  = useState<number | "">("");
  const [page,          setPage]          = useState(1);
  const LIMIT = 8;

  const [showCreate,         setShowCreate]         = useState(false);
  const [branchManageTarget, setBranchManageTarget] = useState<AdminManager | null>(null);
  const [deleteTarget,       setDeleteTarget]       = useState<AdminManager | null>(null);
  const [changeRoleTarget,   setChangeRoleTarget]   = useState<AdminManager | null>(null);
  const [togglingId,         setTogglingId]         = useState<number | null>(null);

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminManagerService.getAllManagersService();
      setAllManagers((res.data as any).data || []);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách manager");
    } finally { setLoading(false); }
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await adminBranchService.getAdminBranchesService({ limit: 200 });
      setBranches((res.data as any).data?.branches || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchManagers(); fetchBranches(); }, [fetchManagers, fetchBranches]);

  const stats = useMemo(() => ({
    total:      allManagers.length,
    active:     allManagers.filter((m) => m.isActive).length,
    locked:     allManagers.filter((m) => !m.isActive).length,
    unassigned: allManagers.filter((m) => m.managedBranches.length === 0).length,
  }), [allManagers]);

  const filteredManagers = useMemo(() => {
    const q = appliedSearch.toLowerCase();
    return allManagers.filter((m) => {
      const matchSearch = !q
        || m.username.toLowerCase().includes(q)
        || m.email.toLowerCase().includes(q)
        || (m.fullName || "").toLowerCase().includes(q);
      const matchStatus = !statusFilter
        || (statusFilter === "active" ? m.isActive : !m.isActive);
      const matchBranch = branchFilter === ""
        || (branchFilter === -1
          ? m.managedBranches.length === 0
          : m.managedBranches.some((b) => b.branchId === branchFilter));
      return matchSearch && matchStatus && matchBranch;
    });
  }, [allManagers, appliedSearch, statusFilter, branchFilter]);

  const totalPages       = Math.ceil(filteredManagers.length / LIMIT);
  const paginatedManagers = filteredManagers.slice((page - 1) * LIMIT, page * LIMIT);

  const applySearch = () => { setAppliedSearch(searchInput); setPage(1); };

  const handleToggleActive = async (manager: AdminManager) => {
    setTogglingId(manager.id);
    try {
      await adminUserService.toggleUserActiveService(manager.id);
      toast.success(manager.isActive ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
      fetchManagers();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally { setTogglingId(null); }
  };

  const handleBranchSuccess = () => {
    fetchManagers();
    if (branchManageTarget) {
      adminManagerService.getAllManagersService().then((res) => {
        const updated = ((res.data as any).data || []).find((m: AdminManager) => m.id === branchManageTarget.id);
        if (updated) setBranchManageTarget(updated);
        setAllManagers((res.data as any).data || []);
      });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <AdminPageHeader
          title="Quản lý Manager"
          subtitle="Quản lý tài khoản và phân công chi nhánh cho Manager"
          action={
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold transition shadow-sm shadow-sky-200"
            >
              <Plus className="w-4 h-4" /> Tạo Manager
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Tổng Manager"       value={stats.total}      icon={Users}        bg="bg-sky-50"     text="text-sky-700"     border="border-sky-200" />
          <StatCard label="Đang hoạt động"     value={stats.active}     icon={CheckCircle}  bg="bg-emerald-50" text="text-emerald-700" border="border-emerald-200" />
          <StatCard label="Bị khóa"            value={stats.locked}     icon={Lock}         bg="bg-red-50"     text="text-red-600"     border="border-red-200" />
          <StatCard label="Chưa có chi nhánh"  value={stats.unassigned} icon={Building2}    bg="bg-amber-50"   text="text-amber-700"   border="border-amber-200" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") applySearch(); }}
                placeholder="Tên, email, tên đăng nhập..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Trạng thái</label>
            <div className="relative">
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white appearance-none">
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Bị khóa</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Chi nhánh</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select
                value={branchFilter}
                onChange={(e) => { setBranchFilter(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
                className="pl-8 pr-8 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white appearance-none max-w-[200px]"
              >
                <option value="">Tất cả chi nhánh</option>
                <option value={-1}>Chưa có chi nhánh</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.branchName}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <button onClick={applySearch}
            className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 transition">
            Tìm kiếm
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <AdminSpinner />
          ) : paginatedManagers.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <Shield className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Không tìm thấy manager nào</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["#", "Manager", "Liên hệ", "Chi nhánh quản lý", "Trạng thái", "Thao tác"].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 [&_td]:align-top">
                {paginatedManagers.map((manager, idx) => (
                  <tr key={manager.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="px-4 py-4 text-center">
                      <span className="text-xs text-gray-400 font-medium">{(page - 1) * LIMIT + idx + 1}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <UserAvatar src={manager.avatar} name={manager.fullName || manager.username} className="w-10 h-10 rounded-xl border border-gray-200" />
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${manager.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm leading-tight">{manager.fullName || manager.username}</p>
                          <p className="text-xs text-gray-400">@{manager.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex flex-col items-start gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{manager.email}</span>
                        </div>
                        {manager.phoneNumber && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{manager.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {manager.managedBranches.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">Chưa gán</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {manager.managedBranches.slice(0, 2).map((b) => (
                            <span key={b.branchId}
                              className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg font-medium">
                              <Building2 className="w-2.5 h-2.5" /> {b.branchName}
                            </span>
                          ))}
                          {manager.managedBranches.length > 2 && (
                            <span className="text-xs text-gray-400">+{manager.managedBranches.length - 2}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {manager.isActive
                        ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Hoạt động
                          </span>
                        : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-600 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Bị khóa
                          </span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setBranchManageTarget(manager)} title="Quản lý chi nhánh"
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition">
                          <Building2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setChangeRoleTarget(manager)} title="Thu hồi role Manager"
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50 text-orange-500 hover:bg-orange-100 border border-orange-200 transition">
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleToggleActive(manager)} disabled={togglingId === manager.id}
                          title={manager.isActive ? "Khóa tài khoản" : "Mở khóa"}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition disabled:opacity-60 ${
                            manager.isActive
                              ? "bg-red-50 text-red-500 hover:bg-red-100 border-red-200"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200"
                          }`}>
                          {togglingId === manager.id
                            ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : manager.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setDeleteTarget(manager)} title="Xóa tài khoản"
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/70">
              <p className="text-sm text-gray-500">
                Trang <b>{page}</b> / {totalPages} · Tổng <b className="text-sky-600">{filteredManagers.length}</b> manager
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-100 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page - 2 + i;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold border transition ${p === page ? "bg-sky-600 text-white border-sky-600" : "border-gray-300 hover:bg-gray-100 text-gray-600"}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-100 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateManagerModal branches={branches} onClose={() => setShowCreate(false)} onSuccess={fetchManagers} />
      )}
      {branchManageTarget && (
        <BranchManageModal
          manager={branchManageTarget}
          branches={branches}
          onClose={() => setBranchManageTarget(null)}
          onSuccess={handleBranchSuccess}
        />
      )}
      {changeRoleTarget && (
        <ChangeRoleModal
          manager={changeRoleTarget}
          onClose={() => setChangeRoleTarget(null)}
          onSuccess={fetchManagers}
        />
      )}
      {deleteTarget && (
        <DeleteManagerModal
          manager={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={fetchManagers}
        />
      )}
    </div>
  );
};

export default ManagerManagementPage;
