import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { AdminDashboardChartItem } from "../../../../types/admin";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString("vi-VN")}đ
        </p>
      ))}
    </div>
  );
};

type DashboardRevenueChartProps = {
  chart: AdminDashboardChartItem[];
};

const DashboardRevenueChart = ({ chart }: DashboardRevenueChartProps) => {
  const chartDisplayData = chart.map((item, i) => ({
    ...item,
    displayLabel: i % 3 === 0 ? item.label : "",
  }));

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800">Doanh thu 30 ngày gần nhất</h3>
        <p className="text-slate-500 text-sm mt-1">Đặt sân và đơn hàng theo ngày</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartDisplayData} barSize={8} barGap={2}>
          <XAxis
            dataKey="displayLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) =>
              v >= 1_000_000
                ? `${(v / 1_000_000).toFixed(0)}M`
                : v >= 1_000
                ? `${(v / 1_000).toFixed(0)}K`
                : String(v)
            }
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="bookingRevenue" name="Đặt sân" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="orderRevenue" name="Đơn hàng" fill="#818cf8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardRevenueChart;
