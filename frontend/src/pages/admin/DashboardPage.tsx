import { useState, useEffect } from "react";
import { CalendarCheck, Users, DollarSign, ShoppingBag } from "lucide-react";
import adminRevenueService from "../../services/admin/revenueService";
import type { AdminDashboardData } from "../../types/admin";
import { ORDER_STATUS_CONFIG, BOOKING_STATUS_CONFIG, fmtCurrency } from "../../utils/constants/adminConstant";
import DashboardStatCard from "../../components/ui/admin/dashboard/DashboardStatCard";
import DashboardRecentRow from "../../components/ui/admin/dashboard/DashboardRecentRow";
import DashboardRevenueChart from "../../components/ui/admin/dashboard/DashboardRevenueChart";

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-2xl ${className}`} />
);

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <Skeleton className="xl:col-span-2 h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Không thể tải dữ liệu dashboard
      </div>
    );
  }

  const { stats, chart, recentBookings, recentOrders } = data;

  const statCards = [
    {
      title: "Doanh thu tháng này",
      value: fmtCurrency(stats.totalRevenue),
      growth: stats.revenueGrowth,
      icon: <DollarSign className="w-6 h-6 text-sky-600" />,
      color: "bg-sky-100",
    },
    {
      title: "Đơn hàng tháng này",
      value: stats.orderCount.toLocaleString("vi-VN"),
      growth: stats.orderGrowth,
      icon: <ShoppingBag className="w-6 h-6 text-violet-600" />,
      color: "bg-violet-100",
    },
    {
      title: "Lượt đặt sân tháng này",
      value: stats.bookingCount.toLocaleString("vi-VN"),
      growth: stats.bookingGrowth,
      icon: <CalendarCheck className="w-6 h-6 text-emerald-600" />,
      color: "bg-emerald-100",
    },
    {
      title: "Tổng khách hàng",
      value: stats.userCount.toLocaleString("vi-VN"),
      growth: 0,
      icon: <Users className="w-6 h-6 text-orange-600" />,
      color: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <DashboardStatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <DashboardRevenueChart chart={chart} />

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800">Đơn hàng gần đây</h3>
              <p className="text-slate-500 text-sm mt-1">5 đơn hàng mới nhất</p>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">Chưa có đơn hàng nào</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((item) => (
                  <DashboardRecentRow key={item.id} item={item} statusConfig={ORDER_STATUS_CONFIG} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800">Đặt sân gần đây</h3>
              <p className="text-slate-500 text-sm mt-1">5 lượt đặt mới nhất</p>
            </div>
            {recentBookings.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">Chưa có lượt đặt sân nào</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((item) => (
                  <DashboardRecentRow key={item.id} item={item} statusConfig={BOOKING_STATUS_CONFIG} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Sản phẩm",   icon: "📦" },
                { label: "Khuyến mãi", icon: "🎁" },
                { label: "Rút tiền",   icon: "💸" },
                { label: "Doanh thu",  icon: "📊" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="h-24 rounded-2xl bg-slate-100 hover:bg-sky-500 hover:text-white transition-all duration-200 font-semibold text-slate-700 flex flex-col items-center justify-center gap-2"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
