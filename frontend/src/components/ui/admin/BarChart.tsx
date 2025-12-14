import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { CountOrderResponse } from "../../../types/order";

interface BarChartProps {
  data: CountOrderResponse;
  date: string;
}

/* Map trạng thái → tiếng Việt */
const STATUS_LABEL_VI: Record<string, string> = {
  Pending: "Đang chờ",
  Confirmed: "Đã xác nhận",
  Paid: "Đã thanh toán",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};

const getTodayVN = () => {
  const vnDate = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
    })
  );

  return vnDate.toISOString().split("T")[0]; // yyyy-mm-dd
};

const NiceBarChart: React.FC<BarChartProps> = ({ data, date }) => {
  const displayDate = date && date.trim() !== "" ? date : getTodayVN();

  /* Chuyển data sang label tiếng Việt */
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      statusLabel: STATUS_LABEL_VI[item.status] || item.status,
    }));
  }, [data]);

  return (
    <div className="w-full h-80 bg-white rounded-2xl p-10 border border-gray-300">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Thống kê theo ngày
        </h3>

        {/* Ngày hiển thị */}
        <p className="text-sm text-gray-500 mb-4">Ngày: {displayDate}</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barSize={40}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey="statusLabel"
            tick={{ fill: "#6b7280", fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            allowDecimals={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            cursor={{ fill: "rgba(2,132,199,0.08)" }}
            formatter={(value: number) => [`${value} đơn`, "Số lượng"]}
          />

          <Bar
            dataKey="count"
            fill="#0284c7"
            radius={[10, 10, 0, 0]}
            activeBar={{ fill: "#0369a1" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NiceBarChart;
