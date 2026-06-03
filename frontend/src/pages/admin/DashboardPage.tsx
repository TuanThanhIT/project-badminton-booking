import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  Coffee,
  DollarSign,
  PackageCheck,
  ShoppingBag,
  Store,
  Trophy,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import { adminPrimaryButtonClass } from "../../components/ui/admin/AdminModal";
import DashboardRecentRow from "../../components/ui/admin/dashboard/DashboardRecentRow";
import adminRevenueService from "../../services/admin/revenueService";
import type { AdminDashboardData } from "../../types/admin";
import {
  BOOKING_STATUS_CONFIG,
  fmtCurrency,
  ORDER_STATUS_CONFIG,
} from "../../utils/constants/adminConstant";

const fmtShort = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

const percentOf = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
);

const StatCard = ({
  title,
  value,
  note,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  icon: typeof DollarSign;
  tone: string;
}) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{note}</p>
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="space-y-1 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
      <p className="font-semibold text-slate-700">{label}</p>
      {payload.map((item: any) => (
        <p key={item.name} style={{ color: item.color }}>
          {item.name}: {fmtCurrency(Number(item.value))}
        </p>
      ))}
    </div>
  );
};

const AdminDashboardPage = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminRevenueService
      .getDashboardService({ range: "today" })
      .then((res) => setData((res.data as any).data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary;
  const operation = data?.operationSummary;
  const chart = data?.quickRevenueChart || data?.chart || [];

  const revenueStructure = useMemo(() => {
    const source = data?.revenueStructure || {
      bookingRevenue: data?.overview?.bookingRevenue || 0,
      productRevenue: data?.overview?.productRevenue || 0,
      beverageRevenue: data?.overview?.beverageRevenue || 0,
    };
    const total =
      source.bookingRevenue + source.productRevenue + source.beverageRevenue;
    return [
      { label: "Đặt sân", value: source.bookingRevenue, color: "bg-indigo-500" },
      { label: "Sản phẩm", value: source.productRevenue, color: "bg-emerald-500" },
      { label: "Đồ uống", value: source.beverageRevenue, color: "bg-amber-500" },
    ].map((item) => ({ ...item, pct: percentOf(item.value, total), total }));
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Skeleton className="h-80 xl:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!data || !summary) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400">
        Không thể tải dữ liệu dashboard
      </div>
    );
  }

  const cards = [
    {
      title: "Doanh thu hôm nay",
      value: fmtCurrency(summary.todayRevenue),
      note: "Tổng đặt sân và bán hàng",
      icon: DollarSign,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      title: "Doanh thu đặt sân",
      value: fmtCurrency(summary.todayBookingRevenue),
      note: `${summary.todayBookingCount} lượt đặt sân`,
      icon: CalendarCheck,
      tone: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Doanh thu bán hàng",
      value: fmtCurrency(summary.todaySalesRevenue),
      note: `${summary.todayOrderCount} đơn hàng hôm nay`,
      icon: ShoppingBag,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Đang chờ xử lý",
      value: String(summary.pendingBookingCount + summary.pendingOrderCount),
      note: `${summary.pendingBookingCount} booking, ${summary.pendingOrderCount} đơn`,
      icon: ClipboardCheck,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      title: "Cảnh báo tồn kho",
      value: String(summary.lowStockCount),
      note: `${summary.outOfStockCount} mặt hàng hết hàng`,
      icon: AlertTriangle,
      tone: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard Admin"
        subtitle="Tổng quan nhanh tình hình vận hành hôm nay: doanh thu, booking, đơn hàng, phiếu nhập và cảnh báo tồn kho."
        action={
          <Link
            to="/admin/revenue"
            className={adminPrimaryButtonClass}
          >
            <BarChart3 className="h-4 w-4" />
            Xem báo cáo doanh thu
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Doanh thu 7 ngày gần nhất
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tách nhanh theo đặt sân, sản phẩm và đồ uống
              </p>
            </div>
            <Wallet className="h-5 w-5 text-slate-300" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} barSize={12} barGap={2}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => fmtShort(Number(v))} width={54} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="bookingRevenue" name="Đặt sân" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="productRevenue" name="Sản phẩm" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="beverageRevenue" name="Đồ uống" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Cơ cấu doanh thu hôm nay</h2>
          <p className="mt-1 text-sm text-slate-500">Dashboard chỉ hiển thị tỷ trọng nhanh</p>
          <div className="mt-6 space-y-5">
            {revenueStructure.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-900">
                    {fmtCurrency(item.value)} ({item.pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${Math.max(item.pct, item.value > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Vận hành sân hôm nay</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {[
              ["Tổng booking", operation?.totalBookingCount || 0],
              ["Chờ xác nhận", operation?.pendingBookingCount || 0],
              ["Đã xác nhận", operation?.confirmedBookingCount || 0],
              ["Đang chơi", operation?.checkedInBookingCount || 0],
              ["Hoàn thành", operation?.completedBookingCount || 0],
              ["Đã hủy", operation?.cancelledBookingCount || 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-slate-100 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Sân đang sử dụng</span>
              <span className="font-bold text-sky-700">
                {operation?.playingCourtCount || 0}/{operation?.totalCourtCount || 0}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-sky-500"
                style={{ width: `${operation?.occupancyRate || 0}%` }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Phiếu nhập chờ duyệt</h2>
            <PackageCheck className="h-5 w-5 text-slate-300" />
          </div>
          {(data.pendingPurchaseReceipts || []).length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Không có phiếu nhập chờ duyệt
            </p>
          ) : (
            <div className="space-y-3">
              {(data.pendingPurchaseReceipts || []).map((receipt) => (
                <Link
                  key={receipt.id}
                  to="/admin/purchase-receipts"
                  className="block rounded-lg border border-slate-100 p-4 transition hover:border-sky-200 hover:bg-sky-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">{receipt.receiptCode}</p>
                    <p className="font-bold text-sky-700">{fmtCurrency(receipt.totalAmount)}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {receipt.branchName || "Chi nhánh"} · {receipt.supplierName || "Nhà cung cấp"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Cảnh báo tồn kho</h2>
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          {(data.lowStockItems || []).length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Không có mặt hàng sắp hết
            </p>
          ) : (
            <div className="space-y-3">
              {(data.lowStockItems || []).map((item) => (
                <Link
                  key={`${item.itemType}-${item.branchId}-${item.itemId}`}
                  to="/admin/inventory"
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-rose-200 hover:bg-rose-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{item.itemName}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {item.branchName} · {item.itemType === "BEVERAGE" ? "Đồ uống" : "Sản phẩm"}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                    item.status === "OUT_OF_STOCK"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {item.currentStock}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Top 3 chi nhánh</h2>
          </div>
          <div className="space-y-3">
            {data.topBranches.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
            ) : (
              data.topBranches.map((branch, index) => (
                <div key={branch.branchId} className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">#{index + 1} {branch.branchName}</p>
                    <p className="font-bold text-sky-700">{fmtCurrency(branch.totalRevenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Store className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900">Top sản phẩm</h2>
          </div>
          <div className="space-y-3">
            {data.topProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
            ) : (
              data.topProducts.map((product, index) => (
                <div key={product.productVariantId} className="rounded-lg bg-slate-50 p-4">
                  <p className="truncate font-semibold text-slate-800">#{index + 1} {product.productName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {product.totalQuantity} sản phẩm · {fmtCurrency(product.totalRevenue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Coffee className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Top đồ uống</h2>
          </div>
          <div className="space-y-3">
            {(data.topBeverages || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
            ) : (
              (data.topBeverages || []).map((beverage, index) => (
                <div key={beverage.beverageId} className="rounded-lg bg-slate-50 p-4">
                  <p className="truncate font-semibold text-slate-800">#{index + 1} {beverage.beverageName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {beverage.totalQuantity} món · {fmtCurrency(beverage.totalRevenue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Đơn hàng gần đây</h2>
          {data.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có đơn hàng nào</p>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((item) => (
                <DashboardRecentRow key={item.id} item={item} statusConfig={ORDER_STATUS_CONFIG} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Đặt sân gần đây</h2>
          {data.recentBookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có lượt đặt sân nào</p>
          ) : (
            <div className="space-y-3">
              {data.recentBookings.map((item) => (
                <DashboardRecentRow key={item.id} item={item} statusConfig={BOOKING_STATUS_CONFIG} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
