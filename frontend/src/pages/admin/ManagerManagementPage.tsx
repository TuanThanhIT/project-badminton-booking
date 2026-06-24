import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Building2,
  CheckCircle,
  ChevronDown,
  Lock,
  Mail,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  Unlock,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { adminPrimaryButtonClass } from "../../components/ui/admin/AdminModal";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminSpinner from "../../components/ui/admin/AdminSpinner";
import UserAvatar from "../../components/ui/admin/UserAvatar";
import BranchManageModal from "../../components/ui/admin/managers/BranchManageModal";
import ChangeRoleModal from "../../components/ui/admin/managers/ChangeRoleModal";
import CreateManagerModal from "../../components/ui/admin/managers/CreateManagerModal";
import DeleteManagerModal from "../../components/ui/admin/managers/DeleteManagerModal";
import adminBranchService from "../../services/admin/branchService";
import adminManagerService from "../../services/admin/managerService";
import adminUserService from "../../services/admin/userService";
import type { AdminBranchOption, AdminManager } from "../../types/admin";
import { showConfirmDialog } from "../../utils/confirmDialog";

const LIMIT = 10;

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

const ManagerManagementPage = () => {
  const [managers, setManagers] = useState<AdminManager[]>([]);
  const [branches, setBranches] = useState<AdminBranchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    locked: 0,
    unassigned: 0,
  });

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState<number | "">("");
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [branchManageTarget, setBranchManageTarget] =
    useState<AdminManager | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminManager | null>(null);
  const [changeRoleTarget, setChangeRoleTarget] = useState<AdminManager | null>(
    null,
  );
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminManagerService.getAllManagersService({
        page,
        limit: LIMIT,
        search: appliedSearch,
        status: statusFilter || undefined,
        branchId: branchFilter === "" ? undefined : branchFilter,
      });
      const data = (res.data as any).data;
      setManagers(data?.managers || []);
      setTotal(data?.pagination?.total || 0);
      setStats(
        data?.stats || { total: 0, active: 0, locked: 0, unassigned: 0 },
      );
    } catch (err: any) {
      setManagers([]);
      setTotal(0);
      toast.error(
        err?.response?.data?.message || "Không thể tải danh sách quản lý",
      );
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, statusFilter, branchFilter]);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await adminBranchService.getAdminBranchOptionsService();
      setBranches((res.data as any).data || []);
    } catch {
      setBranches([]);
    }
  }, []);

  useEffect(() => {
    fetchManagers();
    fetchBranches();
  }, [fetchManagers, fetchBranches]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);

  const handleToggleActive = async (manager: AdminManager) => {
    if (manager.isActive) {
      const confirmed = await showConfirmDialog(
        "Khóa tài khoản quản lý?",
        `Tài khoản @${manager.username} sẽ không thể đăng nhập. Phân công chi nhánh hiện tại vẫn được giữ nguyên.`,
        "Khóa tài khoản",
        "Hủy",
        "danger",
      );
      if (!confirmed) return;
    }

    setTogglingId(manager.id);
    try {
      await adminUserService.toggleUserActiveService(manager.id);
      toast.success(
        manager.isActive
          ? "Đã khóa tài khoản quản lý"
          : "Đã mở khóa tài khoản quản lý",
      );
      fetchManagers();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Không thể cập nhật trạng thái quản lý",
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleBranchSuccess = () => {
    fetchManagers();
    if (!branchManageTarget) return;

    adminManagerService
      .getAllManagersService({
        page,
        limit: LIMIT,
        search: appliedSearch,
        status: statusFilter || undefined,
        branchId: branchFilter === "" ? undefined : branchFilter,
      })
      .then((res) => {
        const updated = ((res.data as any).data?.managers || []).find(
          (manager: AdminManager) => manager.id === branchManageTarget.id,
        );
        if (updated) setBranchManageTarget(updated);
      })
      .catch(() => {});
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý tài khoản quản lý"
        subtitle="Quản lý tài khoản quản lý, trạng thái hoạt động và phân công chi nhánh."
        action={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className={adminPrimaryButtonClass}
          >
            <Plus className="h-4 w-4" /> Tạo quản lý
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Tổng quản lý"
          value={stats.total}
          icon={Users}
          color="bg-sky-50 border-sky-200 text-sky-700"
        />
        <StatCard
          label="Đang hoạt động"
          value={stats.active}
          icon={CheckCircle}
          color="bg-emerald-50 border-emerald-200 text-emerald-700"
        />
        <StatCard
          label="Bị khóa"
          value={stats.locked}
          icon={Lock}
          color="bg-red-50 border-red-200 text-red-700"
        />
        <StatCard
          label="Chưa có chi nhánh"
          value={stats.unassigned}
          icon={Building2}
          color="bg-amber-50 border-amber-200 text-amber-700"
        />
      </div>

      <section>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Tìm kiếm
            </label>
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
                placeholder="Tên, email, tên đăng nhập..."
                className="h-10 w-full rounded-lg border border-slate-200 pl-8 pr-2.5 text-[13px] outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
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
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-[13px] outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              >
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Bị khóa</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Chi nhánh
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(
                    e.target.value === "" ? "" : Number(e.target.value),
                  );
                  setPage(1);
                }}
                className="h-10 max-w-[220px] appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-7 text-[13px] outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              >
                <option value="">Tất cả chi nhánh</option>
                <option value={-1}>Chưa có chi nhánh</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branchName}
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
        ) : managers.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <Shield className="mb-2 h-10 w-10 opacity-30" />
            <p className="text-sm">Không tìm thấy tài khoản quản lý nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1024px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  {[
                    "#",
                    "Quản lý",
                    "Liên hệ",
                    "Chi nhánh quản lý",
                    "Trạng thái",
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
              <tbody className="divide-y divide-slate-100">
                {managers.map((manager, index) => (
                  <tr
                    key={manager.id}
                    className="transition hover:bg-sky-50/40"
                  >
                    <td className="px-4 py-4 text-center text-xs font-medium text-slate-400">
                      {(page - 1) * LIMIT + index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <UserAvatar
                            src={manager.avatar}
                            name={manager.fullName || manager.username}
                            className="h-10 w-10 rounded-xl border border-slate-200"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${manager.isActive ? "bg-emerald-500" : "bg-slate-400"}`}
                          />
                        </div>
                        <div>
                          <p className="font-semibold leading-tight text-slate-800">
                            {manager.fullName || manager.username}
                          </p>
                          <p className="text-xs text-slate-400">
                            @{manager.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex flex-col items-start gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="max-w-[180px] truncate">
                            {manager.email}
                          </span>
                        </div>
                        {manager.phoneNumber ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                            <span>{manager.phoneNumber}</span>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {manager.managedBranches.length === 0 ? (
                        <span className="text-xs italic text-slate-400">
                          Chưa gán
                        </span>
                      ) : (
                        <div className="flex flex-wrap justify-center gap-1">
                          {manager.managedBranches.slice(0, 2).map((branch) => (
                            <span
                              key={branch.branchId}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                            >
                              <Building2 className="h-2.5 w-2.5" />{" "}
                              {branch.branchName}
                            </span>
                          ))}
                          {manager.managedBranches.length > 2 ? (
                            <span className="text-xs text-slate-400">
                              +{manager.managedBranches.length - 2}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {manager.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />{" "}
                          Bị khóa
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setBranchManageTarget(manager)}
                          title="Quản lý chi nhánh"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        >
                          <Building2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setChangeRoleTarget(manager)}
                          title="Thu hồi quyền quản lý"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-200 bg-orange-50 text-orange-500 transition hover:bg-orange-100"
                        >
                          <ArrowLeftRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(manager)}
                          disabled={togglingId === manager.id}
                          title={
                            manager.isActive ? "Khóa tài khoản" : "Mở khóa"
                          }
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-60 ${
                            manager.isActive
                              ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                        >
                          {togglingId === manager.id ? (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : manager.isActive ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <Unlock className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(manager)}
                          title="Xóa tài khoản"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
          unit="quản lý"
        />
      </section>

      {showCreate ? (
        <CreateManagerModal
          branches={branches}
          onClose={() => setShowCreate(false)}
          onSuccess={fetchManagers}
        />
      ) : null}
      {branchManageTarget ? (
        <BranchManageModal
          manager={branchManageTarget}
          branches={branches}
          onClose={() => setBranchManageTarget(null)}
          onSuccess={handleBranchSuccess}
        />
      ) : null}
      {changeRoleTarget ? (
        <ChangeRoleModal
          manager={changeRoleTarget}
          onClose={() => setChangeRoleTarget(null)}
          onSuccess={fetchManagers}
        />
      ) : null}
      {deleteTarget ? (
        <DeleteManagerModal
          manager={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={fetchManagers}
        />
      ) : null}
    </div>
  );
};

export default ManagerManagementPage;
