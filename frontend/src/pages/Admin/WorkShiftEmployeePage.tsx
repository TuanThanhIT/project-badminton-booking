import { useEffect, useState } from "react";
import { Table, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

import workShiftEmployeeService from "../../services/admin/workShiftEmployeeService";
import type { WorkShiftEmployee } from "../../types/workShiftEmployee";

import IconButton from "../../components/ui/admin/IconButton";
import AddWorkShiftEmployeeModal from "../../components/ui/admin/AddWorkShiftEmployeeModal";
import EditWorkShiftEmployeeModal from "../../components/ui/admin/EditWorkShiftEmployeeModal";
import { Plus, Trash2, Pencil } from "lucide-react";

export default function WorkShiftEmployeePage() {
  const [searchParams] = useSearchParams();
  const workShiftId = Number(searchParams.get("workShiftId"));

  const [data, setData] = useState<WorkShiftEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState<WorkShiftEmployee | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const res = await workShiftEmployeeService.getEmployeesByShiftService(
      workShiftId
    );
    setData(res.data.employees || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [workShiftId]);

  /* ================= DELETE ================= */
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Nhân viên sẽ bị gỡ khỏi ca làm này",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    await workShiftEmployeeService.removeEmployeeFromShiftService(id);
    fetchData();
    Swal.fire("Đã xóa thành công!", "", "success");
  };

  /* ================= TABLE COLUMNS ================= */
  const columns: ColumnsType<WorkShiftEmployee> = [
    {
      title: "Tên nhân viên",
      render: (_, r) => r.employee?.Profile?.fullName ?? "—",
    },
    {
      title: "Email",
      render: (_, r) => r.employee?.email ?? "—",
    },
    {
      title: "Vai trò trong ca",
      dataIndex: "roleInShift",
      align: "center",
    },
    {
      title: "Tiền công ca",
      dataIndex: "earnedWage",
      align: "center",
      render: (v) => (
        <span className="font-medium text-green-600">
          {Number(v).toLocaleString()} đ
        </span>
      ),
    },
    {
      title: "Thao tác",
      align: "center",
      width: 120,
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <IconButton
            icon={Pencil}
            color="bg-yellow-500"
            hoverColor="hover:bg-yellow-600"
            onClick={() => {
              setSelected(record);
              setOpenEdit(true);
            }}
          />

          <IconButton
            icon={Trash2}
            color="bg-red-500"
            hoverColor="hover:bg-red-600"
            onClick={() => handleDelete(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sky-700">
              Phân công ca làm
            </h1>
            <p className="text-sm text-gray-500">
              Danh sách nhân viên được phân công trong ca
            </p>
          </div>

          <IconButton
            icon={Plus}
            text="Phân công "
            color="bg-blue-500"
            hoverColor="hover:bg-blue-600"
            onClick={() => setOpenAdd(true)}
          />
        </div>

        {/* ===== TABLE ===== */}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={false}
          bordered
          locale={{
            emptyText: (
              <Empty description="Chưa có nhân viên nào trong ca làm" />
            ),
          }}
          rowClassName={(_, index) => (index % 2 === 0 ? "bg-gray-50" : "")}
        />
      </div>

      {/* ===== MODALS ===== */}
      {openAdd && (
        <AddWorkShiftEmployeeModal
          isOpen={openAdd}
          onClose={() => setOpenAdd(false)}
          workShiftId={workShiftId}
          onSuccess={fetchData}
        />
      )}

      {openEdit && selected && (
        <EditWorkShiftEmployeeModal
          isOpen={openEdit}
          onClose={() => setOpenEdit(false)}
          record={selected}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
