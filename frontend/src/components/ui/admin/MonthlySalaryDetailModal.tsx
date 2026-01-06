import { useEffect, useState } from "react";
import { Modal, Table, Empty, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";

import workShiftEmployeeService from "../../../services/admin/workShiftEmployeeService";
import type { WorkShiftDetailResponse } from "../../../types/workShiftEmployee";

type Props = {
  open: boolean;
  onClose: () => void;
  employeeId: number;
  month: number;
  year: number;
};

export default function MonthlySalaryDetailModal({
  open,
  onClose,
  employeeId,
  month,
  year,
}: Props) {
  const [data, setData] = useState<WorkShiftDetailResponse>([]);
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res =
        await workShiftEmployeeService.getWorkShiftEmployeeDetailService({
          employeeId,
        });

      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && employeeId) {
      fetchDetail();
    }
  }, [open, employeeId, month, year]);

  /* ================= TABLE COLUMNS ================= */
  const columns: ColumnsType<WorkShiftDetailResponse[number]> = [
    {
      title: "Ngày làm",
      dataIndex: ["workShift", "workDate"],
      align: "center",
      render: (d) => new Date(d).toLocaleDateString("vi-VN"),
    },
    {
      title: "Ca làm",
      dataIndex: ["workShift", "name"],
      align: "center",
      render: (v) => <span className="font-medium">{v}</span>,
    },
    {
      title: "Giờ bắt đầu",
      dataIndex: ["workShift", "startTime"],
      align: "center",
      render: (v) => v ?? "-",
    },
    {
      title: "Giờ kết thúc",
      dataIndex: ["workShift", "endTime"],
      align: "center",
      render: (v) => v ?? "-",
    },
    {
      title: "Check-in",
      dataIndex: "checkIn",
      align: "center",
      render: (v) => v ?? "-",
    },
    {
      title: "Check-out",
      dataIndex: "checkOut",
      align: "center",
      render: (v) => v ?? "-",
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      title={
        <div>
          <p className="text-xl font-semibold text-sky-700">
            Chi tiết ca làm trong tháng {month}/{year}
          </p>
          <p className="text-sm text-gray-500">
            Danh sách các ca nhân viên đã làm trong tháng
          </p>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={false}
          scroll={{ y: "50vh" }}
          bordered
          locale={{
            emptyText: (
              <Empty description="Nhân viên chưa làm ca nào trong tháng này" />
            ),
          }}
        />
      )}
    </Modal>
  );
}
