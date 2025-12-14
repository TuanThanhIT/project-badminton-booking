import { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import Swal from "sweetalert2";
import { Lock, Unlock, Plus } from "lucide-react";

import userService from "../../services/Admin/usersService";
import IconButton from "../../components/ui/admin/IconButton";
import type { UserItem } from "../../types/user";
import AddUserModal from "../../components/ui/admin/AddUserModal";

export default function UserPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await userService.getAllUsersService();

      const data = (res.data.users || [])
        .filter((u) => u != null)
        .map((u) => ({
          ...u,
          locked: !u.isActive,
        }));
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLock = async (user: UserItem) => {
    const result = await Swal.fire({
      title: user.isActive ? "Mở khóa người dùng?" : "Khóa người dùng này?",
      text: user.isActive
        ? "Người dùng sẽ được mở khóa!"
        : "Người dùng sẽ không thể đăng nhập!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: user.isActive ? "Mở khóa" : "Khóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: user.isActive ? "#38a169" : "#e3342f",
    });

    if (!result.isConfirmed) return;

    try {
      await userService.toggleLock(user.id, user.isActive);
      console.log(user.isActive);
      Swal.fire(
        "Thành công!",
        user.isActive ? "Đã mở khóa." : "Đã khóa người dùng.",
        "success"
      );
      fetchUsers();
    } catch {
      Swal.fire("Lỗi!", "Không thể xử lý yêu cầu.", "error");
    }
  };

  const columns: ColumnsType<UserItem> = [
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "center",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      key: "phone",
      align: "center",
    },
    {
      title: "Role",
      dataIndex: "roleId",
      key: "roleId",
      align: "center",
      render: (r) =>
        r === 1 ? (
          <span className="text-blue-500 font-semibold">Admin</span>
        ) : (
          <span className="text-green-600 font-semibold">User</span>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "locked",
      key: "locked",
      align: "center",
      render: (locked) =>
        locked ? (
          <span className="text-red-500 font-semibold">Đã khóa</span>
        ) : (
          <span className="text-green-500 font-semibold">Hoạt động</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, user) => (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleLock(user)}
            className={`px-3 py-1 text-white rounded-md ${
              user.isActive ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {user.isActive ? (
              <div className="flex items-center gap-1">
                <Unlock size={16} /> Unlock
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Lock size={16} /> Lock
              </div>
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">User Management</h2>
        <div className="z-100">
          <AddUserModal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onSuccess={fetchUsers}
          />
        </div>
        <div className="flex gap-3">
          <IconButton
            type="button"
            icon={Plus}
            text="Thêm user"
            color="bg-blue-500"
            hoverColor="hover:bg-blue-700"
            onClick={() => setIsAddOpen(true)}
          />
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={false}
        rowKey="id"
        rowClassName={() => "text-center"}
      />
    </div>
  );
}
