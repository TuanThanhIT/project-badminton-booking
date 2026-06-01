import { X, Building2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import type { AdminBranchRevenue, AdminDateRevenue } from "../../../../types/admin";

const fmtShort = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}Mđ`
  : n >= 1_000 ? `${(n / 1_000).toFixed(0)}Kđ`
  : `${n}đ`;

const fmtFull = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

const yTickFmt = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M`
  : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K`
  : String(v);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {fmtFull(p.value)}</p>
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

const RevenueBranchDetailModal = ({ branch, data, loading, onClose }: RevenueBranchDetailModalProps) => {
  const chartData = data.map((d) => ({ ...d, label: d.date.slice(5) }));

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
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{branch.branchName}</h2>
              <p className="text-xs text-gray-400">Chi tiết doanh thu theo ngày</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.map((s) => (
              <div key={s.label} className={`rounded-2xl p-4 ${s.cls}`}>
                <p className="text-xs font-medium opacity-70 mb-1">{s.label}</p>
                <p className="text-xl font-bold">{fmtShort(s.value)}</p>
                <p className="text-xs opacity-60 mt-0.5">{s.count} · {fmtFull(s.value)}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Không có dữ liệu theo ngày</div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-4">Doanh thu theo ngày</p>
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
