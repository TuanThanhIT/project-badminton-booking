import { useState, useEffect, useCallback } from "react";
import { Lock, Unlock, Eye, Search } from "lucide-react";
import { toast } from "react-toastify";
import adminUserService from "../../services/admin/userService";
import type { AdminUser } from "../../types/admin";
import { ROLE_TAG, ROLE_OPTIONS } from "../../utils/constants/adminConstant";
import UserAvatar from "../../components/ui/admin/UserAvatar";
import AdminSpinner from "../../components/ui/admin/AdminSpinner";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import AdminStatusBadge from "../../components/ui/admin/AdminStatusBadge";
import UserDetailModal from "../../components/ui/admin/users/UserDetailModal";

const UserManagementPage = () => {
  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [loading, setLoading]       = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [search,   setSearch]   = useState("");
  const [role,     setRole]     = useState("");
  const [isActive, setIsActive] = useState("");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const limit = 10;

  const [detailUserId, setDetailUserId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await adminUserService.getUsersService({ page, limit, search, role, isActive });
      const data = (res.data as any).data;
      setUsers(data.users || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, role, isActive]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
              className="py-2 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400 bg-white transition"
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  {["#", "Người dùng", "Email", "Vai trò", "Xác thực", "Trạng thái", "Thao tác"].map((h) => (
                    <th key={h} className="text-center px-4 py-3 font-semibold">{h}</th>
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
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setDetailUserId(user.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 transition"
                        >
                          <Eye size={13} /> Chi tiết
                        </button>
                        {user.role !== "ADMIN" && (
                          <button
                            onClick={() => handleToggleActive(user)}
                            disabled={togglingId === user.id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition disabled:opacity-60 ${
                              user.isActive
                                ? "bg-red-50 text-red-500 hover:bg-red-100 border-red-200"
                                : "bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                            }`}
                          >
                            {togglingId === user.id ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
