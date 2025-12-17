import React, { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";

import type { WorkShiftItem } from "../../types/workShift";
import workShiftService from "../../services/admin/workShiftService";
import IconButton from "../../components/commons/admin/IconButton";
import AddWorkShiftModal from "../../components/commons/admin/AddWorkShiftModal";
import { useNavigate } from "react-router-dom";

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
      key: "workDate",
      align: "center",
    },
    {
      title: "Tên ca",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      align: "center",
    },
    {
      title: "Kết thúc",
      dataIndex: "endTime",
      key: "endTime",
      align: "center",
    },
    {
      title: "Lương (VNĐ)",
      dataIndex: "shiftWage",
      key: "shiftWage",
      align: "center",
      render: (v) => v.toLocaleString(),
    },
    {
      title: "Nhân viên",
      align: "center",
      render: (_, record) => (
        <button
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() =>
            navigate(`/admin/workShift/employees?workShiftId=${record.id}`)
          }
        >
          Xem
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Danh sách ca làm việc</h2>
        {openModal && (
          <div className="z-80">
            <AddWorkShiftModal
              isOpen={openModal}
              onClose={() => setOpenModal(false)}
              onSuccess={() => {
                fetchWorkShifts();
                setOpenModal(false);
              }}
            />
          </div>
        )}
        <IconButton
          icon={Plus}
          text="Tạo ca cho ngày"
          color="bg-blue-500"
          hoverColor="hover:bg-blue-700"
          onClick={() => setOpenModal(true)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          onChange: (page, pageSize) => {
            fetchWorkShifts(page, pageSize);
          },
        }}
      />
    </div>
  );
}
