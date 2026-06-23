import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { toast } from "react-toastify";
import adminUserService from "../../../../services/admin/userService";
import type { AdminUserDetail } from "../../../../types/admin";
import { ROLE_TAG, GENDER_LABEL } from "../../../../utils/constants/adminConstant";
import AdminModal from "../AdminModal";
import UserAvatar from "../UserAvatar";

type UserDetailModalProps = {
  userId: number;
  onClose: () => void;
};

const UserDetailModal = ({ userId, onClose }: UserDetailModalProps) => {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminUserService
      .getUserDetailService(userId)
      .then((res) => setUser((res.data as any).data))
      .catch(() => {
        toast.error("Không thể tải thông tin người dùng");
        onClose();
      })
      .finally(() => setLoading(false));
  }, [userId, onClose]);

  return (
    <AdminModal
      title="Chi tiết người dùng"
      icon={<Eye className="w-5 h-5 text-sky-600" />}
      onClose={onClose}
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : user ? (
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar
              src={user.profile?.avatar}
              name={user.profile?.fullName || user.username}
              className="w-14 h-14 rounded-xl border border-gray-200"
            />
            <div>
              <p className="font-bold text-gray-800">{user.profile?.fullName || user.username}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
              {user.role && (
                <span
                  className={`inline-flex mt-1 px-2 py-0.5 rounded border text-xs font-semibold ${
                    ROLE_TAG[user.role]?.color || "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  {ROLE_TAG[user.role]?.label || user.role}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {[
              { label: "Email",      value: user.email },
              { label: "Điện thoại", value: user.profile?.phoneNumber || "—" },
              { label: "Giới tính",  value: GENDER_LABEL[user.profile?.gender || ""] || "—" },
              { label: "Địa chỉ",   value: user.profile?.address || "—" },
              { label: "Cấp độ",    value: user.profile?.level || "—" },
              { label: "Xác thực",  value: user.isVerified ? "✅ Đã xác thực" : "❌ Chưa xác thực" },
              { label: "Trạng thái", value: user.isActive ? "🟢 Hoạt động" : "🔴 Đã khóa" },
              {
                label: "Kiểm duyệt",
                value:
                  user.accountStatus === "BANNED"
                    ? "Bị cấm"
                    : user.accountStatus === "SUSPENDED"
                      ? "Đang tạm khóa"
                      : user.accountStatus === "WARNING"
                        ? "Đang cảnh báo"
                        : "Bình thường",
              },
              { label: "Số vi phạm", value: String(user.violationCount || 0) },
              {
                label: "Khóa đến",
                value: user.suspendedUntil
                  ? new Date(user.suspendedUntil).toLocaleString("vi-VN")
                  : "—",
              },
              { label: "Lý do khóa", value: user.suspensionReason || "—" },
              {
                label: "Ngày tạo",
                value: user.createdDate
                  ? new Date(user.createdDate).toLocaleDateString("vi-VN")
                  : "—",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm text-gray-800 font-medium text-right max-w-[55%]">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {(user.managedBranches?.length ?? 0) > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Chi nhánh đang quản lý</p>
              {user.managedBranches!.map((b) => (
                <div
                  key={b.branchId}
                  className="flex justify-between bg-blue-50 rounded-lg px-3 py-2 mb-1"
                >
                  <span className="text-sm font-medium text-blue-800">{b.branchName}</span>
                  <span className="text-xs text-blue-500">
                    {b.assignedDate ? new Date(b.assignedDate).toLocaleDateString("vi-VN") : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          {(user.assignedBranches?.length ?? 0) > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Chi nhánh nhân viên</p>
              {user.assignedBranches!.map((branch) => (
                <div
                  key={branch.branchId}
                  className="bg-indigo-50 rounded-lg px-3 py-2 mb-1"
                >
                  <p className="text-sm font-medium text-indigo-800">{branch.branchName}</p>
                  {branch.address && <p className="text-xs text-indigo-500 mt-0.5">{branch.address}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </AdminModal>
  );
};

export default UserDetailModal;
