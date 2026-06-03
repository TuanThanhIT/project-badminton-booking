import type { ReactNode } from "react";
import {
  CalendarCheck,
  Coffee,
  ShoppingBag,
  Store,
  TrendingUp,
} from "lucide-react";
import type { AdminRevenueOverview } from "../../../../types/admin";

const fmtShort = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}Mđ`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(0)}Kđ`
      : `${n.toLocaleString("vi-VN")}đ`;

const fmtFull = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

const percentOf = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

type ChannelCardProps = {
  title: string;
  total: number;
  icon: ReactNode;
  accent: string;
  lines: { label: string; value: string; muted?: string }[];
};

const ChannelCard = ({ title, total, icon, accent, lines }: ChannelCardProps) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md">
    <div className="flex items-start justify-between gap-3">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0 text-right">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{fmtShort(total)}</p>
      </div>
    </div>
    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
      {lines.map((line) => (
        <div key={line.label} className="flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-500">{line.label}</span>
          <span className="font-semibold text-slate-700">
            {line.value}
            {line.muted ? (
              <span className="ml-1 font-normal text-slate-400">{line.muted}</span>
            ) : null}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const RevenueOverviewCards = ({ data }: { data: AdminRevenueOverview | null }) => {
  if (!data) return null;

  const mix = [
    {
      label: "Sân cầu",
      value: data.bookingRevenue,
      color: "bg-indigo-500",
      pct: percentOf(data.bookingRevenue, data.totalRevenue),
    },
    {
      label: "Sản phẩm",
      value: data.productRevenue,
      color: "bg-emerald-500",
      pct: percentOf(data.productRevenue, data.totalRevenue),
    },
    {
      label: "Đồ uống",
      value: data.beverageRevenue,
      color: "bg-amber-500",
      pct: percentOf(data.beverageRevenue, data.totalRevenue),
    },
  ];

  const onlineTotal = data.onlineBookingRevenue + data.onlineProductRevenue;
  const offlineTotal =
    data.offlineBookingRevenue +
    data.offlineProductRevenue +
    data.beverageRevenue;

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.2fr_1fr]">
          <div className="border-b border-slate-100 bg-gradient-to-br from-sky-600 via-sky-600 to-cyan-600 p-6 text-white lg:border-b-0 lg:border-r">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-sky-100/90">Tổng doanh thu kỳ</p>
                <p className="mt-2 text-4xl font-bold tracking-tight">
                  {fmtShort(data.totalRevenue)}
                </p>
                <p className="mt-2 text-sm text-sky-50/80">{fmtFull(data.totalRevenue)}</p>
              </div>
              <div className="rounded-lg bg-white/15 p-3 backdrop-blur">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-3">
                <p className="text-sky-100/70">Giao dịch</p>
                <p className="mt-1 text-lg font-bold">
                  {(data.bookingCount + data.orderCount).toLocaleString("vi-VN")}
                </p>
                <p className="text-xs text-sky-50/70">
                  {data.bookingCount} sân · {data.orderCount} đơn
                </p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-3">
                <p className="text-sky-100/70">Kênh</p>
                <p className="mt-1 text-lg font-bold">Online / Quầy</p>
                <p className="text-xs text-sky-50/70">
                  {fmtShort(onlineTotal)} / {fmtShort(offlineTotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm font-semibold text-slate-800">Cơ cấu doanh thu</p>
            <p className="mt-1 text-xs text-slate-500">Theo nhóm nguồn thu</p>
            <div className="mt-5 space-y-4">
              {mix.map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    <span className="font-semibold text-slate-800">
                      {fmtShort(item.value)}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        ({item.pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all`}
                      style={{ width: `${Math.max(item.pct, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ChannelCard
          title="Sân cầu"
          total={data.bookingRevenue}
          accent="bg-indigo-50 text-indigo-600"
          icon={<CalendarCheck className="h-5 w-5" />}
          lines={[
            {
              label: "Online",
              value: fmtShort(data.onlineBookingRevenue),
              muted: `(${data.onlineBookingCount} lượt)`,
            },
            {
              label: "Tại quầy",
              value: fmtShort(data.offlineBookingRevenue),
              muted: `(${data.offlineBookingCount} HĐ)`,
            },
          ]}
        />
        <ChannelCard
          title="Sản phẩm"
          total={data.productRevenue}
          accent="bg-emerald-50 text-emerald-600"
          icon={<ShoppingBag className="h-5 w-5" />}
          lines={[
            {
              label: "Online",
              value: fmtShort(data.onlineProductRevenue),
              muted: `(${data.onlineProductOrderCount} đơn)`,
            },
            {
              label: "Tại quầy",
              value: fmtShort(data.offlineProductRevenue),
              muted: `(${data.offlineProductOrderCount} HĐ)`,
            },
          ]}
        />
        <ChannelCard
          title="Đồ uống"
          total={data.beverageRevenue}
          accent="bg-amber-50 text-amber-600"
          icon={<Coffee className="h-5 w-5" />}
          lines={[
            {
              label: "Tại quầy",
              value: fmtShort(data.beverageRevenue),
              muted: `(${data.beverageOrderCount} HĐ)`,
            },
            {
              label: "Số món",
              value: String(data.beverageQuantity),
            },
          ]}
        />
        <ChannelCard
          title="Tổng hợp đơn"
          total={data.orderRevenue}
          accent="bg-violet-50 text-violet-600"
          icon={<Store className="h-5 w-5" />}
          lines={[
            {
              label: "Sản phẩm",
              value: `${data.productQuantity} SP`,
            },
            {
              label: "Đồ uống",
              value: `${data.beverageQuantity} món`,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default RevenueOverviewCards;
