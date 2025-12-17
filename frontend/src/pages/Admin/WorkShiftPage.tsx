import { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { WorkShiftItem } from "../../types/workShift";
import workShiftService from "../../services/admin/workShiftService";
import IconButton from "../../components/ui/admin/IconButton";
import AddWorkShiftModal from "../../components/ui/admin/AddWorkShiftModal";

export default function WorkShiftPage() {
  const [data, setData] = useState<WorkShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchWorkShifts = async (page = 1, limit = pagination.pageSize) => {
    setLoading(true);
    try {
      const res = await workShiftService.getAllWorkShiftsService({
        page,
        limit,
      });

      setData(res.data.workShifts);
      setPagination({
        current: page,
        pageSize: limit,
        total: res.data.pagination.total,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkShifts(1, pagination.pageSize);
  }, []);

  const columns: ColumnsType<WorkShiftItem> = [
    {
      title: "Ngày",
      dataIndex: "workDate",
      align: "center",
      render: (d) => new Date(d).toLocaleDateString("vi-VN"),
    },
    {
      title: "Tên ca",
      dataIndex: "name",
      align: "center",
      render: (v) => <span className="font-medium text-gray-800">{v}</span>,
    },
    {
      title: "Bắt đầu",
      dataIndex: "startTime",
      align: "center",
    },
    {
      title: "Kết thúc",
      dataIndex: "endTime",
      align: "center",
    },
    {
      title: "Lương (VNĐ)",
      dataIndex: "shiftWage",
      align: "center",
      render: (v) => (
        <span className="font-semibold text-green-600">
          {v.toLocaleString()} ₫
        </span>
      ),
    },
    {
      title: "Nhân viên",
      align: "center",
      render: (_, record) => (
        <button
          onClick={() =>
            navigate(`/admin/workShift/employees?workShiftId=${record.id}`)
          }
          className="
            px-3 py-1
            bg-green-500 hover:bg-green-600
            text-white text-sm
            rounded-md
            transition
          "
        >
          Xem
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-sky-700 relative">
            Quản lý ca làm
            <span className="block w-1/3 h-1 bg-sky-400 rounded mt-1"></span>
          </h1>

          <IconButton
            icon={Plus}
            text="Tạo ca làm"
            color="bg-blue-500"
            hoverColor="hover:bg-blue-700"
            onClick={() => setOpenModal(true)}
          />
        </div>

        {/* ===== MODAL ===== */}
        {openModal && (
          <AddWorkShiftModal
            isOpen={openModal}
            onClose={() => setOpenModal(false)}
            onSuccess={() => {
              fetchWorkShifts();
              setOpenModal(false);
            }}
          />
        )}

        {/* ===== TABLE ===== */}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          bordered
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} ca làm`,
            onChange: (page, pageSize) => {
              fetchWorkShifts(page, pageSize);
            },
          }}
          className="rounded-xl overflow-hidden"
        />
      </div>
    </div>
  );
}
