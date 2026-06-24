import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Eye,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  UserCog,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import AdminPagination from "../../components/ui/admin/AdminPagination";
import AdminSpinner from "../../components/ui/admin/AdminSpinner";
import AdminStatusBadge from "../../components/ui/admin/AdminStatusBadge";
import UserAvatar from "../../components/ui/admin/UserAvatar";
import UserDetailModal from "../../components/ui/admin/users/UserDetailModal";
import UserViolationsModal from "../../components/ui/admin/users/UserViolationsModal";
import adminManagerService from "../../services/admin/managerService";
import adminUserService from "../../services/admin/userService";
import type { AdminUser } from "../../types/admin";
import { ROLE_TAG } from "../../utils/constants/adminConstant";
import { showConfirmDialog } from "../../utils/confirmDialog";

const LIMIT = 10;
const ROLE_FILTER_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Người dùng", value: "USER" },
  { label: "Huấn luyện viên", value: "COACH" },
  { label: "Quản lý", value: "MANAGER" },
  { label: "Nhân viên", value: "EMPLOYEE" },
];
const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý",
  EMPLOYEE: "Nhân viên",
  USER: "Người dùng",
  COACH: "Huấn luyện viên",
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
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

const UserManagementPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [detailUserId, setDetailUserId] = useState<number | null>(null);
  const [violationUser, setViolationUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminUserService.getUsersService({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
        role: role || undefined,
        isActive: isActive || undefined,
      });
      const data = (res.data as any).data;
      setUsers(data.users || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setUsers([]);
      setTotal(0);
      toast.error(
        err?.response?.data?.message || "Không thể tải danh sách tài khoản",
      );
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, isActive, page, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleToggleActive = async (user: AdminUser) => {
    if (user.isActive) {
      const confirmed = await showConfirmDialog(
        "Khóa tài khoản?",
        `Tài khoản @${user.username} sẽ không thể đăng nhập cho đến khi được mở khóa lại.`,
        "Khóa tài khoản",
        "Hủy",
        "danger",
      );
      if (!confirmed) return;
    }

    setTogglingId(user.id);
    try {
      await adminUserService.toggleUserActiveService(user.id);
      toast.success(
        user.isActive ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
      );
      fetchUsers();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Không thể cập nhật trạng thái tài khoản",
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleCoachRole = async (user: AdminUser) => {
    const newRole = user.role === "COACH" ? "USER" : "COACH";
    const message =
      newRole === "COACH"
        ? "Chuyển tài khoản này thành tài khoản HLV?"
        : "Thu hồi tài khoản HLV và chuyển về tài khoản Người dùng?";

    if (newRole === "COACH") {
      const confirmed = await showConfirmDialog(
        "Cấp quyền dạy cầu lông?",
        message,
        "Cấp quyền",
        "Hủy",
        "question",
      );
      if (!confirmed) return;
    } else {
      const confirmed = await showConfirmDialog(
        "Thu hồi quyền dạy cầu lông?",
        message,
        "Thu hồi quyền",
        "Hủy",
        "danger",
      );
      if (!confirmed) return;
    }

    try {
      await adminManagerService.changeUserRoleService(user.id, { newRole });
      toast.success(
        newRole === "COACH"
          ? "Đã cấp quyền dạy cầu lông"
          : "Đã chuyển về Người dùng",
      );
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể thay đổi vai trò");
    }
  };

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);
  const activeCount = users.filter((user) => user.isActive).length;
  const lockedCount = users.filter((user) => !user.isActive).length;
  const verifiedCount = users.filter((user) => user.isVerified).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý tài khoản"
        subtitle="Theo dõi tài khoản, vai trò và trạng thái xác thực."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng tài khoản"
          value={total}
          icon={Users}
          color="bg-sky-50 border-sky-200 text-sky-700"
        />
        <StatCard
          label="Hoạt động"
          value={activeCount}
          icon={CheckCircle2}
          color="bg-emerald-50 border-emerald-200 text-emerald-700"
        />
        <StatCard
          label="Đã khóa"
          value={lockedCount}
          icon={XCircle}
          color="bg-red-50 border-red-200 text-red-700"
        />
        <StatCard
          label="Đã xác thực"
          value={verifiedCount}
          icon={ShieldCheck}
          color="bg-indigo-50 border-indigo-200 text-indigo-700"
        />
      </div>

      <section>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tên đăng nhập, email..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 text-[13px] outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Vai trò
            </label>
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
            >
              {ROLE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Trạng thái
            </label>
            <select
              value={isActive}
              onChange={(event) => {
                setIsActive(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
            >
              <option value="">Tất cả</option>
              <option value="true">Hoạt động</option>
              <option value="false">Đã khóa</option>
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <AdminSpinner />
        ) : users.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-400">
            Không có dữ liệu
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  {[
                    "#",
                    "Người dùng",
                    "Email",
                    "Vai trò",
                    "Xác thực",
                    "Trạng thái",
                    "Kiểm duyệt",
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
                {users.map((user, index) => (
                  <tr key={user.id} className="transition hover:bg-sky-50/40">
                    <td className="px-4 py-3 text-center text-slate-400">
                      {(page - 1) * LIMIT + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={user.avatar}
                          name={user.fullName || user.username}
                          className="h-9 w-9 rounded-lg border border-slate-200"
                        />
                        <div className="min-w-0 text-left">
                          <p className="truncate font-semibold text-slate-800">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-xs text-slate-400">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.role ? (
                        <AdminStatusBadge
                          color={
                            ROLE_TAG[user.role]?.color ||
                            "bg-slate-100 text-slate-600 border-slate-200"
                          }
                          label={
                            ROLE_LABEL[user.role] ||
                            ROLE_TAG[user.role]?.label ||
                            user.role
                          }
                        />
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <AdminStatusBadge
                        color={
                          user.isVerified
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-600 border-red-200"
                        }
                        label={
                          user.isVerified ? "Đã xác thực" : "Chưa xác thực"
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <AdminStatusBadge
                        color={
                          user.isActive
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-600 border-red-200"
                        }
                        label={user.isActive ? "Hoạt động" : "Đã khóa"}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="space-y-1">
                        <AdminStatusBadge
                          color={
                            user.accountStatus === "BANNED"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : user.accountStatus === "SUSPENDED"
                                ? "bg-orange-100 text-orange-700 border-orange-200"
                                : user.accountStatus === "WARNING"
                                  ? "bg-amber-100 text-amber-700 border-amber-200"
                                  : "bg-emerald-100 text-emerald-700 border-emerald-200"
                          }
                          label={
                            user.accountStatus === "BANNED"
                              ? "Cấm"
                              : user.accountStatus === "SUSPENDED"
                                ? "Tạm khóa"
                                : user.accountStatus === "WARNING"
                                  ? "Cảnh báo"
                                  : "Bình thường"
                          }
                        />
                        <p className="text-xs text-slate-400">
                          {user.violationCount || 0} vi phạm
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailUserId(user.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-600 transition hover:bg-sky-100"
                        >
                          <Eye size={13} />
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          onClick={() => setViolationUser(user)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100"
                        >
                          <ShieldAlert size={13} />
                          Vi phạm
                        </button>
                        {(user.role === "USER" || user.role === "COACH") && (
                          <button
                            type="button"
                            onClick={() => handleToggleCoachRole(user)}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
                          >
                            <UserCog size={13} />
                            {user.role === "COACH"
                              ? "Về Người dùng"
                              : "Huấn luyện viên"}
                          </button>
                        )}
                        {user.role !== "ADMIN" && (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(user)}
                            disabled={togglingId === user.id}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                              user.isActive
                                ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                                : "border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                          >
                            {togglingId === user.id ? (
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : user.isActive ? (
                              <>
                                <Lock size={13} />
                                Khóa
                              </>
                            ) : (
                              <>
                                <Unlock size={13} />
                                Mở khóa
                              </>
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
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPage={setPage}
        />
      </section>

      {detailUserId !== null ? (
        <UserDetailModal
          userId={detailUserId}
          onClose={() => setDetailUserId(null)}
        />
      ) : null}
      {violationUser ? (
        <UserViolationsModal
          userId={violationUser.id}
          username={violationUser.username}
          onClose={() => setViolationUser(null)}
        />
      ) : null}
    </div>
  );
};

export default UserManagementPage;
