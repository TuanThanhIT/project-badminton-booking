import React, { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

import workShiftEmployeeService from "../../services/admin/workShiftEmployeeService";
import type { WorkShiftEmployee } from "../../types/workShiftEmployee";

import IconButton from "../../components/commons/admin/IconButton";
import AddWorkShiftEmployeeModal from "../../components/commons/admin/AddWorkShiftEmployeeModal";
import EditWorkShiftEmployeeModal from "../../components/commons/admin/EditWorkShiftEmployeeModal";
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

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Bạn có chắc?",
      text: "Xóa nhân viên khỏi ca này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#e3342f",
    });

    if (!result.isConfirmed) return;

    await workShiftEmployeeService.removeEmployeeFromShiftService(id);
    fetchData();
    Swal.fire("Đã xóa!", "", "success");
  };

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
      title: "Vai trò",
      dataIndex: "roleInShift",
      align: "center",
    },
    {
      title: "Lương ca",
      dataIndex: "earnedWage",
      align: "center",
      render: (v) => `${Number(v).toLocaleString()} đ`,
    },
    {
      title: "Hành động",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <IconButton
            icon={Trash2}
            color="bg-red-500"
            hoverColor="hover:bg-red-700"
            onClick={() => handleDelete(record.id)}
          />

          <IconButton
            icon={Pencil}
            color="bg-yellow-500"
            hoverColor="hover:bg-yellow-700"
            onClick={() => {
              setSelected(record);
              setOpenEdit(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Danh sách nhân viên theo ca</h2>
        {openAdd && (
          <div className="z-80">
            <AddWorkShiftEmployeeModal
              isOpen={openAdd}
              onClose={() => setOpenAdd(false)}
              workShiftId={workShiftId}
              onSuccess={fetchData}
            />
          </div>
        )}

        {openEdit && selected && (
          <div className="z-80">
            <EditWorkShiftEmployeeModal
              isOpen={openEdit}
              onClose={() => setOpenEdit(false)}
              record={selected}
              onSuccess={fetchData}
            />
          </div>
        )}
        <IconButton
          icon={Plus}
          text="Phân nhân viên"
          color="bg-blue-500"
          hoverColor="hover:bg-blue-700"
          onClick={() => setOpenAdd(true)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
}
