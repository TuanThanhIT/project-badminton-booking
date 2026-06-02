import { useState, useEffect, useCallback } from "react";
import { Store, Search, Plus, Edit2, Power, Eye } from "lucide-react";
import { toast } from "react-toastify";
import adminBranchService from "../../services/admin/branchService";
import type { AdminBranch } from "../../types/admin";
import AdminSpinner from "../../components/ui/admin/AdminSpinner";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import AdminStatusBadge from "../../components/ui/admin/AdminStatusBadge";
import BranchFormModal from "../../components/ui/admin/branches/BranchFormModal";
import BranchDetailModal from "../../components/ui/admin/branches/BranchDetailModal";

const BranchManagementPage = () => {
  const [branches,   setBranches]   = useState<AdminBranch[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [search,   setSearch]   = useState("");
  const [isActive, setIsActive] = useState("");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const limit = 10;

  const [showForm,       setShowForm]       = useState(false);
  const [editBranch,     setEditBranch]     = useState<AdminBranch | null>(null);
  const [detailBranchId, setDetailBranchId] = useState<number | null>(null);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await adminBranchService.getAdminBranchesService({ page, limit, search, isActive });
      const data = (res.data as any).data;
      setBranches(data.branches || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      setBranches([]);
      setTotal(0);
    } finally { setLoading(false); }
  }, [page, search, isActive]);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);

  const handleToggleActive = async (branch: AdminBranch) => {
    setTogglingId(branch.id);
    try {
      await adminBranchService.toggleBranchActiveService(branch.id);
      toast.success(branch.isActive ? "Đã tạm ngừng chi nhánh" : "Đã kích hoạt chi nhánh");
      fetchBranches();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally { setTogglingId(null); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <AdminPageHeader
          title="Quản lý Chi nhánh"
          action={
            <button
              onClick={() => { setEditBranch(null); setShowForm(true); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
            >
              <Plus size={15} /> Thêm chi nhánh
            </button>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); fetchBranches(); } }}
                placeholder="Tên chi nhánh, địa chỉ..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
            <select
              value={isActive}
              onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
              className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition"
            >
              <option value="">Tất cả</option>
              <option value="true">Hoạt động</option>
              <option value="false">Tạm ngừng</option>
            </select>
          </div>
          <button
            onClick={() => { setPage(1); fetchBranches(); }}
            className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition"
          >
            Tìm kiếm
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <AdminSpinner />
          ) : branches.length === 0 ? (
            <div className="text-center py-14 text-gray-400 text-sm">Không có dữ liệu</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  {["#", "Chi nhánh", "Địa chỉ", "Điện thoại", "Manager", "Trạng thái", "Thao tác"].map((h) => (
                    <th key={h} className="text-center px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 [&_td]:align-top">
                {branches.map((branch, idx) => (
                  <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-400">{(page - 1) * limit + idx + 1}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                          <Store className="w-4 h-4 text-sky-600" />
                        </div>
                        <span className="font-semibold text-gray-800">{branch.branchName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 max-w-[180px]">
                      <span className="block truncate text-xs">
                        {branch.fullAddress || `${branch.address}, ${branch.districtName}, ${branch.provinceName}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{branch.phoneNumber}</td>
                    <td className="px-4 py-3 text-center">
                      {branch.managers?.length ? (
                        <div>
                          {branch.managers.slice(0, 2).map((m) => (
                            <p key={m.id} className="text-xs text-blue-600 font-medium">
                              {m.fullName || m.username}
                            </p>
                          ))}
                          {branch.managers.length > 2 && (
                            <p className="text-xs text-gray-400">+{branch.managers.length - 2} khác</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Chưa có</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <AdminStatusBadge
                        color={branch.isActive
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-600 border-red-200"}
                        label={branch.isActive ? "Hoạt động" : "Tạm ngừng"}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setDetailBranchId(branch.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 transition"
                        >
                          <Eye size={13} /> Chi tiết
                        </button>
                        <button
                          onClick={() => { setEditBranch(branch); setShowForm(true); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition"
                        >
                          <Edit2 size={13} /> Sửa
                        </button>
                        <button
                          onClick={() => handleToggleActive(branch)}
                          disabled={togglingId === branch.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition disabled:opacity-60 ${
                            branch.isActive
                              ? "bg-red-50 text-red-500 hover:bg-red-100 border-red-200"
                              : "bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                          }`}
                        >
                          {togglingId === branch.id ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <><Power size={13} /> {branch.isActive ? "Khóa" : "Mở"}</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <AdminPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
        </div>
      </div>

      {showForm && (
        <BranchFormModal
          branch={editBranch}
          onClose={() => { setShowForm(false); setEditBranch(null); }}
          onSuccess={fetchBranches}
        />
      )}
      {detailBranchId !== null && (
        <BranchDetailModal branchId={detailBranchId} onClose={() => setDetailBranchId(null)} />
      )}
    </div>
  );
};

export default BranchManagementPage;
