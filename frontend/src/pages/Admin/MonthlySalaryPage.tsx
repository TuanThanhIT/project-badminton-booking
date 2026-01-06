import { useEffect, useState } from "react";
import { Table, Empty, Select, Statistic, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { Eye, Users, Wallet } from "lucide-react";

import workShiftEmployeeService from "../../services/admin/workShiftEmployeeService";
import IconButton from "../../components/ui/admin/IconButton";
import MonthlySalaryDetailModal from "../../components/ui/admin/MonthlySalaryDetailModal";

type MonthlySalaryEmployee = {
  employeeId: number;
  username: string;
  email: string;
  fullName: string;
  totalShifts: number;
  totalWage: number;
};

export default function MonthlySalaryPage() {
  const navigate = useNavigate();

  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

  const [data, setData] = useState<MonthlySalaryEmployee[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [loading, setLoading] = useState(true);

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  );

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    setLoading(true);
    const res =
      await workShiftEmployeeService.getAllEmployeesMonthlySalaryService({
        month,
        year,
      });

    const result = res.data;
    setData(result.employees || []);
    setTotalEmployees(result.totalEmployees || 0);
    setTotalPayroll(result.totalPayroll || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  /* ================= TABLE COLUMNS ================= */
  const columns: ColumnsType<MonthlySalaryEmployee> = [
    {
      title: "ID",
      dataIndex: "employeeId",
      width: 80,
      align: "center",
    },
    {
      title: "Tên nhân viên",
      dataIndex: "fullName",
      render: (v) => <span className="font-medium">{v}</span>,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Số ca làm",
      dataIndex: "totalShifts",
      align: "center",
    },
    {
      title: "Tổng lương",
      dataIndex: "totalWage",
      align: "center",
      render: (v: number) => (
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
        <div className="flex justify-center">
          <IconButton
            icon={Eye}
            color="bg-blue-500"
            hoverColor="hover:bg-blue-600"
            onClick={() => {
              setSelectedEmployeeId(record.employeeId);
              setOpenDetail(true);
            }}
          />
        </div>
      ),
    },
  ];

  /* ================= SELECT OPTIONS ================= */
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${i + 1}`,
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = now.getFullYear() - 2 + i;
    return { value: y, label: `Năm ${y}` };
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        {/* ===== HEADER ===== */}
        <div>
          <h1 className="text-2xl font-bold text-sky-700">
            Bảng lương nhân viên theo tháng
          </h1>
          <p className="text-sm text-gray-500">
            Thống kê tổng số ca làm và lương của nhân viên
          </p>
        </div>

        {/* ===== FILTER ===== */}
        <div className="flex gap-4">
          <Select
            value={month}
            options={monthOptions}
            onChange={setMonth}
            style={{ width: 140 }}
          />
          <Select
            value={year}
            options={yearOptions}
            onChange={setYear}
            style={{ width: 140 }}
          />
        </div>

        {/* ===== STATISTIC ===== */}
        <Row gutter={16}>
          <Col span={12}>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng số nhân viên</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalEmployees}
                </p>
              </div>
            </div>
          </Col>

          <Col span={12}>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng lương phải trả</p>
                <p className="text-2xl font-bold text-green-600">
                  {Number(totalPayroll).toLocaleString()} đ
                </p>
              </div>
            </div>
          </Col>
        </Row>

        {/* ===== TABLE ===== */}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="employeeId"
          pagination={false}
          bordered
          locale={{
            emptyText: (
              <Empty description="Không có dữ liệu lương trong tháng này" />
            ),
          }}
          rowClassName={(_, index) => (index % 2 === 0 ? "bg-gray-50" : "")}
        />
      </div>

      {openDetail && selectedEmployeeId && (
        <MonthlySalaryDetailModal
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          employeeId={selectedEmployeeId}
          month={month}
          year={year}
        />
      )}
    </div>
  );
}
