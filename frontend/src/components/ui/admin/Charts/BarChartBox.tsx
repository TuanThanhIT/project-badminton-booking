import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function BarChartBox({ data }: { data: any[] }) {
  return (
    <div className="h-[300px] bg-gray-50 border border-gray-500 rounded-xl p-4">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(v: number) => `${v.toLocaleString()} ₫`} />
          <Bar dataKey="value" barSize={32} fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
