import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CheckCircle,
  ChevronDown,
  Edit2,
  Eye,
  Plus,
  Power,
  Search,
  Store,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminSpinner from "../../components/ui/admin/AdminSpinner";
import AdminStatusBadge from "../../components/ui/admin/AdminStatusBadge";
import { adminPrimaryButtonClass } from "../../components/ui/admin/AdminModal";
import BranchFormModal from "../../components/ui/admin/branches/BranchFormModal";
import adminBranchService from "../../services/admin/branchService";
import type { AdminBranch } from "../../types/admin";
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

const BranchManagementPage = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editBranch, setEditBranch] = useState<AdminBranch | null>(null);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminBranchService.getAdminBranchesService({
        page,
        limit: LIMIT,
        search: appliedSearch,
        status,
      });
      const data = (res.data as any).data;
      setBranches(data.branches || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setBranches([]);
      setTotal(0);
      toast.error(err?.response?.data?.message || "Không thể tải danh sách chi nhánh");
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, status]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleToggleActive = async (branch: AdminBranch) => {
    if (branch.isActive) {
      const confirmed = await showConfirmDialog(
        "Khóa chi nhánh?",
        `Chi nhánh "${branch.branchName}" sẽ tạm ngừng hoạt động cho đến khi được mở khóa lại.`,
        "Khóa chi nhánh",
        "Hủy",
        "danger",
      );
      if (!confirmed) return;
    }

    setTogglingId(branch.id);
    try {
      await adminBranchService.toggleBranchActiveService(branch.id);
      toast.success(branch.isActive ? "Đã khóa chi nhánh" : "Đã mở khóa chi nhánh");
      fetchBranches();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể cập nhật trạng thái chi nhánh");
    } finally {
      setTogglingId(null);
    }
  };

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);
  const activeInPage = branches.filter((branch) => branch.isActive).length;
  const lockedInPage = branches.filter((branch) => !branch.isActive).length;
  const managedInPage = branches.filter((branch) => branch.managers?.length).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý chi nhánh"
        subtitle="Theo dõi thông tin chi nhánh, trạng thái hoạt động và quản lý phụ trách."
        action={
          <button
            type="button"
            onClick={() => {
              setEditBranch(null);
              setShowForm(true);
            }}
            className={adminPrimaryButtonClass}
          >
            <Plus size={16} /> Thêm chi nhánh
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Tổng chi nhánh" value={total} icon={Building2} color="bg-sky-50 border-sky-200 text-sky-700" />
        <StatCard label="Hoạt động đang hiển thị" value={activeInPage} icon={CheckCircle} color="bg-emerald-50 border-emerald-200 text-emerald-700" />
        <StatCard label="Đã khóa đang hiển thị" value={lockedInPage} icon={XCircle} color="bg-red-50 border-red-200 text-red-700" />
        <StatCard label="Có quản lý đang hiển thị" value={managedInPage} icon={UserCheck} color="bg-amber-50 border-amber-200 text-amber-700" />
      </div>

      <section>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">Tìm kiếm</label>
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
                placeholder="Tên chi nhánh, địa chỉ, điện thoại, quản lý..."
                className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Trạng thái</label>
            <div className="relative">
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className="h-11 appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="">Tất cả</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="LOCKED">Đã khóa</option>
                <option value="MAINTENANCE">Bảo trì</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <AdminSpinner />
        ) : branches.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-400">Không có dữ liệu</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  {["#", "Chi nhánh", "Địa chỉ", "Điện thoại", "Quản lý", "Trạng thái", "Số sân", "Số NV", "Thao tác"].map((header) => (
                    <th key={header} className="px-4 py-3 text-center font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branches.map((branch, index) => (
                  <tr key={branch.id} className="transition hover:bg-sky-50/40">
                    <td className="px-4 py-3 text-center text-slate-400">
                      {(page - 1) * LIMIT + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100">
                          <Store className="h-4 w-4 text-sky-600" />
                        </div>
                        <span className="font-semibold text-slate-800">{branch.branchName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      <span className="block max-w-[260px] truncate text-xs">
                        {branch.fullAddress || `${branch.address}, ${branch.districtName}, ${branch.provinceName}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{branch.phoneNumber}</td>
                    <td className="px-4 py-3 text-center">
                      {branch.managers?.length ? (
                        <div className="space-y-1">
                          {branch.managers.slice(0, 2).map((manager) => (
                            <p key={manager.id} className="text-xs font-medium text-blue-600">
                              {manager.fullName || manager.username}
                            </p>
                          ))}
                          {branch.managers.length > 2 ? (
                            <p className="text-xs text-slate-400">+{branch.managers.length - 2} khác</p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400">Chưa có</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <AdminStatusBadge
                        color={
                          branch.isActive
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-600 border-red-200"
                        }
                        label={branch.isActive ? "Hoạt động" : "Đã khóa"}
                      />
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-slate-700">{branch.courtCount ?? 0}</td>
                    <td className="px-4 py-3 text-center font-medium text-slate-700">{branch.employeeCount ?? 0}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/branches/${branch.id}`)}
                          className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-600 transition hover:bg-sky-100"
                        >
                          <Eye size={13} /> Chi tiết
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditBranch(branch);
                            setShowForm(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-600 transition hover:bg-amber-100"
                        >
                          <Edit2 size={13} /> Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(branch)}
                          disabled={togglingId === branch.id}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                            branch.isActive
                              ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                              : "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {togglingId === branch.id ? (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <>
                              <Power size={13} /> {branch.isActive ? "Khóa" : "Mở"}
                            </>
                          )}
                        </button>
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

      {showForm ? (
        <BranchFormModal
          branch={editBranch}
          onClose={() => {
            setShowForm(false);
            setEditBranch(null);
          }}
          onSuccess={fetchBranches}
        />
      ) : null}
    </div>
  );
};

export default BranchManagementPage;
