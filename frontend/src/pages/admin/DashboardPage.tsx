import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CalendarCheck,
  DollarSign,
  PackageCheck,
  ShoppingBag,
  TicketPercent,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import adminRevenueService from "../../services/admin/revenueService";
import type { AdminDashboardData } from "../../types/admin";
import { BOOKING_STATUS_CONFIG, fmtCurrency, ORDER_STATUS_CONFIG } from "../../utils/constants/adminConstant";
import DashboardRecentRow from "../../components/ui/admin/dashboard/DashboardRecentRow";
import DashboardRevenueChart from "../../components/ui/admin/dashboard/DashboardRevenueChart";
import DashboardStatCard from "../../components/ui/admin/dashboard/DashboardStatCard";

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-2xl ${className}`} />
);

const fmtShort = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}Mđ`
  : n >= 1_000 ? `${(n / 1_000).toFixed(0)}Kđ`
  : `${n.toLocaleString("vi-VN")}đ`;

const percentOf = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

const AdminDashboardPage = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminRevenueService
      .getDashboardService()
      .then((res) => setData((res.data as any).data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <Skeleton className="h-80 xl:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Không thể tải dữ liệu dashboard
      </div>
    );
  }

  const { stats, overview, chart, recentBookings, recentOrders, topBranches, topProducts } = data;
  const maxBranchRevenue = Math.max(...topBranches.map((item) => item.totalRevenue), 1);
  const revenueMix = [
    { label: "Sân cầu", value: overview.bookingRevenue, color: "bg-indigo-500" },
    { label: "Sản phẩm", value: overview.productRevenue, color: "bg-emerald-500" },
    { label: "Đồ uống", value: overview.beverageRevenue, color: "bg-amber-500" },
  ];

  const statCards = [
    {
      title: "Doanh thu tháng này",
      value: fmtCurrency(stats.totalRevenue),
      growth: stats.revenueGrowth,
      icon: <DollarSign className="h-6 w-6 text-sky-600" />,
      color: "bg-sky-100",
    },
    {
      title: "Đơn hàng tháng này",
      value: stats.orderCount.toLocaleString("vi-VN"),
      growth: stats.orderGrowth,
      icon: <ShoppingBag className="h-6 w-6 text-violet-600" />,
      color: "bg-violet-100",
    },
    {
      title: "Lượt đặt sân tháng này",
      value: stats.bookingCount.toLocaleString("vi-VN"),
      growth: stats.bookingGrowth,
      icon: <CalendarCheck className="h-6 w-6 text-emerald-600" />,
      color: "bg-emerald-100",
    },
    {
      title: "Tổng khách hàng",
      value: stats.userCount.toLocaleString("vi-VN"),
      growth: 0,
      icon: <Users className="h-6 w-6 text-orange-600" />,
      color: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-500 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-100/80">Admin dashboard</p>
            <h1 className="mt-3 text-3xl font-bold">Tổng quan vận hành hôm nay</h1>
            <p className="mt-2 max-w-2xl text-sm text-sky-50/80">
              Theo dõi doanh thu, chi nhánh nổi bật, sản phẩm bán chạy và các giao dịch mới nhất trong một màn hình.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {revenueMix.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-sky-50/70">{item.label}</p>
                <p className="mt-1 font-bold">{fmtShort(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <DashboardStatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <DashboardRevenueChart chart={chart} />

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Top sản phẩm tháng này</h3>
                <p className="mt-1 text-sm text-slate-500">Sắp xếp theo doanh thu online và tại quầy</p>
              </div>
              <Link to="/admin/revenue" className="text-sm font-semibold text-sky-600 hover:text-sky-700">
                Xem doanh thu
              </Link>
            </div>
            {topProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu sản phẩm</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((item, index) => (
                  <div
                    key={item.productVariantId}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition hover:border-sky-200 hover:bg-sky-50/60"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-bold text-emerald-700">
                      #{index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800">{item.productName}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {item.variantInfo || "Không có phân loại"} · {item.totalQuantity} sản phẩm
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sky-700">{fmtShort(item.totalRevenue)}</p>
                      <p className="text-xs text-slate-400">Online {item.onlineQuantity} · Quầy {item.offlineQuantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Top 3 chi nhánh</h3>
                <p className="mt-1 text-sm text-slate-500">Doanh thu cao nhất tháng này</p>
              </div>
              <Trophy className="h-6 w-6 text-amber-500" />
            </div>
            {topBranches.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu chi nhánh</p>
            ) : (
              <div className="space-y-4">
                {topBranches.map((item, index) => (
                  <div key={item.branchId} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl font-bold ${
                          index === 0 ? "bg-amber-100 text-amber-700"
                          : index === 1 ? "bg-slate-100 text-slate-600"
                          : "bg-orange-100 text-orange-700"
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{item.branchName}</p>
                          <p className="text-xs text-slate-400">{item.bookingCount + item.orderCount} giao dịch</p>
                        </div>
                      </div>
                      <p className="font-bold text-sky-700">{fmtShort(item.totalRevenue)}</p>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-sky-500"
                        style={{ width: `${percentOf(item.totalRevenue, maxBranchRevenue)}%` }}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <span>Sân: {fmtShort(item.bookingRevenue)}</span>
                      <span>Sản phẩm: {fmtShort(item.productRevenue + item.beverageRevenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-xl font-bold text-slate-800">Tỷ trọng doanh thu</h3>
            <div className="space-y-4">
              {revenueMix.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    <span className="font-semibold text-slate-800">{percentOf(item.value, overview.totalRevenue)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${percentOf(item.value, overview.totalRevenue)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-xl font-bold text-slate-800">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Sản phẩm", icon: PackageCheck, to: "/admin/products" },
                { label: "Khuyến mãi", icon: TicketPercent, to: "/admin/discounts" },
                { label: "Tài chính", icon: Wallet, to: "/admin/finance" },
                { label: "Doanh thu", icon: BarChart3, to: "/admin/revenue" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-slate-100 font-semibold text-slate-700 transition-all duration-200 hover:bg-sky-500 hover:text-white"
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">Đơn hàng gần đây</h3>
            <p className="mt-1 text-sm text-slate-500">5 đơn hàng mới nhất</p>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có đơn hàng nào</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((item) => (
                <DashboardRecentRow key={item.id} item={item} statusConfig={ORDER_STATUS_CONFIG} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">Đặt sân gần đây</h3>
            <p className="mt-1 text-sm text-slate-500">5 lượt đặt mới nhất</p>
          </div>
          {recentBookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có lượt đặt sân nào</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((item) => (
                <DashboardRecentRow key={item.id} item={item} statusConfig={BOOKING_STATUS_CONFIG} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
