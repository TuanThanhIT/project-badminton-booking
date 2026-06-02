import { useState, useEffect, useCallback } from "react";
import { Lock, Unlock, Eye, Search, UserCog } from "lucide-react";
import { toast } from "react-toastify";
import adminUserService from "../../services/admin/userService";
import adminBranchService from "../../services/admin/branchService";
import adminManagerService from "../../services/admin/managerService";
import type { AdminBranchOption, AdminUser } from "../../types/admin";
import { ROLE_TAG, ROLE_OPTIONS } from "../../utils/constants/adminConstant";
import UserAvatar from "../../components/ui/admin/UserAvatar";
import AdminSpinner from "../../components/ui/admin/AdminSpinner";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import AdminStatusBadge from "../../components/ui/admin/AdminStatusBadge";
import UserDetailModal from "../../components/ui/admin/users/UserDetailModal";

const UserManagementPage = () => {
  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [branches, setBranches]     = useState<AdminBranchOption[]>([]);
  const [loading, setLoading]       = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [search,   setSearch]   = useState("");
  const [role,     setRole]     = useState("");
  const [isActive, setIsActive] = useState("");
  const [branchId, setBranchId] = useState("");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const limit = 10;

  const [detailUserId, setDetailUserId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await adminUserService.getUsersService({ page, limit, search, role, isActive, branchId });
      const data = (res.data as any).data;
      setUsers(data.users || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, role, isActive, branchId]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    adminBranchService
      .getAdminBranchesService({ page: 1, limit: 100, isActive: "true" })
      .then((res) => {
        const data = (res.data as any).data;
        setBranches(data.branches || []);
      })
      .catch(() => {});
  }, []);

  const handleToggleActive = async (user: AdminUser) => {
    setTogglingId(user.id);
    try {
      await adminUserService.toggleUserActiveService(user.id);
      toast.success(user.isActive ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra");
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleCoachRole = async (user: AdminUser) => {
    const newRole = user.role === "COACH" ? "USER" : "COACH";
    const message =
      newRole === "COACH"
        ? "Chuyển tài khoản này thành người dạy cầu lông?"
        : "Thu hồi quyền dạy cầu lông và chuyển về User?";

    if (!window.confirm(message)) return;

    try {
      await adminManagerService.changeUserRoleService(user.id, { newRole });
      toast.success(newRole === "COACH" ? "Đã cấp quyền dạy cầu lông" : "Đã chuyển về User");
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || "Khong the thay doi role");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <AdminPageHeader title="Quản lý Tài khoản" />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); fetchUsers(); } }}
                placeholder="Tên đăng nhập, email..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vai trò</label>
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setBranchId(""); setPage(1); }}
              className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition"
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Chi nhánh</label>
            <select
              value={branchId}
              onChange={(e) => {
                setBranchId(e.target.value);
                if (e.target.value) setRole("EMPLOYEE");
                setPage(1);
              }}
              className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition"
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.branchName}</option>
              ))}
            </select>
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
              <option value="false">Đã khóa</option>
            </select>
          </div>
          <button
            onClick={() => { setPage(1); fetchUsers(); }}
            className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition"
          >
            Tìm kiếm
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <AdminSpinner />
          ) : users.length === 0 ? (
            <div className="text-center py-14 text-gray-400 text-sm">Không có dữ liệu</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[1024px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  {["#", "Người dùng", "Email", "Vai trò", "Chi nhánh", "Xác thực", "Trạng thái", "Thao tác"].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-center font-semibold ${
                        h === "Thao tác" ? "min-w-[300px] whitespace-nowrap" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 [&_td]:align-top">
                {users.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-400">{(page - 1) * limit + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={user.avatar}
                          name={user.fullName || user.username}
                          className="w-8 h-8 rounded-lg border border-gray-200"
                        />
                        <div className="text-left">
                          <p className="font-semibold text-gray-800">{user.fullName || user.username}</p>
                          <p className="text-xs text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                      {user.role && (
                        <AdminStatusBadge
                          color={ROLE_TAG[user.role]?.color || "bg-gray-100 text-gray-600 border-gray-200"}
                          label={ROLE_TAG[user.role]?.label || user.role}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.role === "EMPLOYEE" && (user.assignedBranches?.length ?? 0) > 0 ? (
                        <div className="flex flex-col gap-1 items-center">
                          {user.assignedBranches!.map((branch) => (
                            <span key={branch.branchId} className="px-2 py-0.5 rounded border text-xs font-medium bg-indigo-50 text-indigo-700 border-indigo-200">
                              {branch.branchName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <AdminStatusBadge
                        color={user.isVerified
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-600 border-red-200"}
                        label={user.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <AdminStatusBadge
                        color={user.isActive
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-600 border-red-200"}
                        label={user.isActive ? "Hoạt động" : "Đã khóa"}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <div className="inline-flex flex-nowrap items-center justify-center gap-1.5">
                        <button
                          onClick={() => setDetailUserId(user.id)}
                          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-600 transition hover:bg-sky-100"
                        >
                          <Eye size={13} /> Chi tiết
                        </button>
                        {(user.role === "USER" || user.role === "COACH") && (
                          <button
                            onClick={() => handleToggleCoachRole(user)}
                            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-yellow-200 bg-yellow-50 px-2.5 py-1.5 text-xs font-medium text-yellow-700 transition hover:bg-yellow-100"
                          >
                            <UserCog size={13} />
                            {user.role === "COACH" ? "Về User" : "Dạy cầu lông"}
                          </button>
                        )}
                        {user.role !== "ADMIN" && (
                          <button
                            onClick={() => handleToggleActive(user)}
                            disabled={togglingId === user.id}
                            className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                              user.isActive
                                ? "bg-red-50 text-red-500 hover:bg-red-100 border-red-200"
                                : "bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                            }`}
                          >
                            {togglingId === user.id ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : user.isActive ? (
                              <><Lock size={13} /> Khóa</>
                            ) : (
                              <><Unlock size={13} /> Mở khóa</>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          <AdminPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
        </div>
      </div>

      {detailUserId !== null && (
        <UserDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />
      )}
    </div>
  );
};

export default UserManagementPage;
