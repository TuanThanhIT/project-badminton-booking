import { X, Building2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import type { AdminBranchRevenue, AdminDateRevenue } from "../../../../types/admin";

const fmtShort = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}Mđ`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(0)}Kđ`
      : `${n.toLocaleString("vi-VN")}đ`;

const fmtFull = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

const yTickFmt = (value: number) =>
  value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(0)}M`
    : value >= 1_000
      ? `${(value / 1_000).toFixed(0)}K`
      : String(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-lg">
      <p className="font-semibold text-slate-700">{label}</p>
      {payload.map((item: any) => (
        <p key={item.name} style={{ color: item.color }}>
          {item.name}: {fmtFull(Number(item.value))}
        </p>
      ))}
    </div>
  );
};

type RevenueBranchDetailModalProps = {
  branch: AdminBranchRevenue;
  data: AdminDateRevenue[];
  loading: boolean;
  onClose: () => void;
};

const RevenueBranchDetailModal = ({
  branch,
  data,
  loading,
  onClose,
}: RevenueBranchDetailModalProps) => {
  const chartData = data.map((item) => ({ ...item, label: item.date.slice(5) }));

  const summary = [
    {
      label: "Sân online",
      value: branch.onlineBookingRevenue,
      count: `${branch.onlineBookingCount} lượt`,
      cls: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Sân tại quầy",
      value: branch.offlineBookingRevenue,
      count: `${branch.offlineBookingCount} hóa đơn`,
      cls: "bg-violet-50 text-violet-700",
    },
    {
      label: "SP online",
      value: branch.onlineProductRevenue,
      count: `${branch.onlineProductQuantity} sản phẩm`,
      cls: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "SP tại quầy",
      value: branch.offlineProductRevenue,
      count: `${branch.offlineProductQuantity} sản phẩm`,
      cls: "bg-teal-50 text-teal-700",
    },
    {
      label: "Đồ uống",
      value: branch.beverageRevenue,
      count: `${branch.beverageQuantity} món`,
      cls: "bg-amber-50 text-amber-700",
    },
    {
      label: "Tổng cộng",
      value: branch.totalRevenue,
      count: `${branch.bookingCount + branch.orderCount} giao dịch`,
      cls: "bg-sky-50 text-sky-700",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100">
              <Building2 className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{branch.branchName}</h2>
              <p className="text-xs text-slate-400">Chi tiết doanh thu theo ngày</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-slate-100"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="space-y-6 p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summary.map((item) => (
              <div key={item.label} className={`rounded-lg p-4 ${item.cls}`}>
                <p className="mb-1 text-xs font-medium opacity-70">{item.label}</p>
                <p className="text-xl font-bold">{fmtShort(item.value)}</p>
                <p className="mt-0.5 text-xs opacity-60">
                  {item.count} · {fmtFull(item.value)}
                </p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Không có dữ liệu theo ngày
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm font-semibold text-slate-600">Doanh thu theo ngày</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} barSize={10} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={yTickFmt} width={44} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="onlineBookingRevenue" name="Sân online" fill="#6366f1" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="offlineBookingRevenue" name="Sân tại quầy" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="onlineProductRevenue" name="SP online" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="offlineProductRevenue" name="SP tại quầy" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="beverageRevenue" name="Đồ uống" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueBranchDetailModal;
