import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const LineChartBox = ({ data }: any) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white border border-gray-500 rounded-xl p-10 h-[350px]">
      <p className="text-sm font-semibold text-gray-700 mb-3">
        Doanh thu theo thời gian
      </p>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => `${(v / 1000).toLocaleString()}k`} />
          <Tooltip formatter={(value: any) => `${value.toLocaleString()} ₫`} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0284c7"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartBox;
