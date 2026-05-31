import type { AdminRevenueOverview } from "../../../../types/admin";

const fmtShort = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M₫`
  : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K₫`
  : `${n}₫`;

const fmtFull = (n: number) => n.toLocaleString("vi-VN") + "₫";

const RevenueOverviewCards = ({ data }: { data: AdminRevenueOverview | null }) => {
  if (!data) return null;
  const cards = [
    { label: "Tổng doanh thu",     value: data.totalRevenue,   sub: `${data.bookingCount + data.orderCount} đơn`, color: "from-sky-500 to-sky-600" },
    { label: "Doanh thu đặt sân",  value: data.bookingRevenue, sub: `${data.bookingCount} lượt đặt`,             color: "from-indigo-400 to-indigo-500" },
    { label: "Doanh thu sản phẩm", value: data.orderRevenue,   sub: `${data.orderCount} đơn hàng`,              color: "from-emerald-400 to-emerald-500" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-2xl bg-gradient-to-br ${c.color} p-6 shadow-lg`}>
          <p className="text-sm font-medium text-white opacity-85 mb-2">{c.label}</p>
          <p className="text-3xl font-bold text-white mb-1">{fmtShort(c.value)}</p>
          <p className="text-xs text-white opacity-70">{c.sub}</p>
          <p className="text-xs text-white opacity-60 mt-0.5">{fmtFull(c.value)}</p>
        </div>
      ))}
    </div>
  );
};

export default RevenueOverviewCards;
