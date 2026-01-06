import { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import Swal from "sweetalert2";
import { Lock, Unlock, Plus } from "lucide-react";

import userService from "../../services/admin/usersService";
import IconButton from "../../components/ui/admin/IconButton";
import type { UserItem } from "../../types/user";
import AddUserModal from "../../components/ui/admin/AddUserModal";

export default function UserPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  /* ================= FETCH ================= */
  const fetchUsers = async () => {
    try {
      const res = await userService.getAllUsersService();
      const data = (res.data.users || []).filter(Boolean);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= LOCK / UNLOCK ================= */
  const handleLock = async (user: UserItem) => {
    const result = await Swal.fire({
      title: user.isActive ? "Khóa người dùng?" : "Mở khóa người dùng?",
      text: user.isActive
        ? "Người dùng sẽ không thể đăng nhập!"
        : "Người dùng sẽ được phép đăng nhập lại!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: user.isActive ? "Khóa" : "Mở khóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: user.isActive ? "#ef4444" : "#22c55e",
    });

    if (!result.isConfirmed) return;

    try {
      await userService.toggleLock(user.id, user.isActive);
      Swal.fire(
        "Thành công!",
        user.isActive ? "Đã khóa người dùng." : "Đã mở khóa người dùng.",
        "success"
      );
      fetchUsers();
    } catch {
      Swal.fire("Lỗi!", "Không thể xử lý yêu cầu.", "error");
    }
  };

  /* ================= TABLE COLUMNS ================= */
  const columns: ColumnsType<UserItem> = [
    {
      title: "Họ tên",
      align: "center",
      render: (_, user) => (
        <span className="font-medium text-gray-800">
          {user.Profile?.fullName || "-"}
        </span>
      ),
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      align: "center",
      render: (u) => <span className="text-gray-700">{u}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      align: "center",
      render: (email) => <span className="text-gray-600">{email}</span>,
    },
    {
      title: "Số điện thoại",
      align: "center",
      render: (_, user) => (
        <span className="text-gray-600">
          {user.Profile?.phoneNumber || "-"}
        </span>
      ),
    },
    {
      title: "Giới tính",
      align: "center",
      render: (_, user) => {
        const g = user.Profile?.gender;
        if (g === "male") return <Tag color="blue">Nam</Tag>;
        if (g === "female") return <Tag color="pink">Nữ</Tag>;
        return <Tag>Khác</Tag>;
      },
    },
    {
      title: "Vai trò",
      align: "center",
      render: (_, user) => {
        const role = user.role?.roleName;
        if (role === "ADMIN") return <Tag color="red">Quản trị viên</Tag>;
        if (role === "EMPLOYEE") return <Tag color="orange">Nhân viên</Tag>;
        return <Tag color="green">Người dùng</Tag>;
      },
    },
    {
      title: "Xác thực",
      dataIndex: "isVerified",
      align: "center",
      render: (v) =>
        v ? (
          <Tag color="green">Đã xác thực</Tag>
        ) : (
          <Tag color="red">Chưa xác thực</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      align: "center",
      render: (active) =>
        active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Đã khóa</Tag>
        ),
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_, user) => (
        <button
          onClick={() => handleLock(user)}
          className={`
          inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white
          ${
            user.isActive
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }
        `}
        >
          {user.isActive ? (
            <>
              <Lock size={14} /> Khóa
            </>
          ) : (
            <>
              <Unlock size={14} /> Mở khóa
            </>
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold text-sky-700 relative">
            Quản lý người dùng
            <span className="absolute left-0 -bottom-4 w-1/2 h-1 bg-sky-400 rounded-sm"></span>
          </h1>

          <IconButton
            type="button"
            icon={Plus}
            text="Thêm người dùng"
            color="bg-blue-600"
            hoverColor="hover:bg-blue-700"
            onClick={() => setIsAddOpen(true)}
          />
        </div>

        {/* ===== TABLE WRAPPER ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <Table
            columns={columns}
            dataSource={users}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 8,
              showSizeChanger: false,
            }}
            rowClassName={() => "hover:bg-gray-50 transition-colors"}
            locale={{ emptyText: "Không có người dùng nào" }}
          />
        </div>

        {/* ===== MODAL ===== */}
        <AddUserModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={fetchUsers}
        />
      </div>
    </div>
  );
}
