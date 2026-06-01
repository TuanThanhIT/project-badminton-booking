import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  CircleDollarSign,
  Coffee,
  Package,
  TrendingUp,
  Trophy,
  Users,
  WalletCards,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getManagerRevenue } from "../../redux/slices/manager/revenueSlice";
import type { ManagerRevenueBreakdownItem } from "../../types/revenue";

const getDefaultStartDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return date.toISOString().slice(0, 10);
};

const getToday = () => new Date().toISOString().slice(0, 10);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const compactCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

const COLORS: Record<ManagerRevenueBreakdownItem["type"], string> = {
  COURT: "#0ea5e9",
  PRODUCT: "#22c55e",
  BEVERAGE: "#f59e0b",
};

const revenueKeyLabel: Record<string, string> = {
  courtRevenue: "Sân",
  productRevenue: "Sản phẩm",
  beverageRevenue: "Đồ uống",
  totalRevenue: "Tổng",
  profit: "Lợi nhuận",
  salaryCost: "Lương",
  inventoryCost: "Nhập hàng",
  totalCost: "Chi phí",
};

const tooltipFormatter = (value: number, name: string) => [
  formatCurrency(Number(value || 0)),
  revenueKeyLabel[name] || name,
];

///MANAGER
const RevenuePage = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.managerRevenue);
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getToday());

  useEffect(() => {
    dispatch(getManagerRevenue({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  const overview = data?.overview;
  const monthlyEstimate = data?.monthlyEstimate;
  const breakdown = data?.breakdown || [];
  const chart = data?.chart || [];
  const monthlyChart = data?.monthlyChart || [];
  const bestSource = useMemo(
    () =>
      [...breakdown].sort((a, b) => b.revenue - a.revenue)[0] || {
        label: "Chưa có",
        revenue: 0,
      },
    [breakdown],
  );

  const cards = [
    {
      label: "Doanh thu tổng",
      value: overview?.totalRevenue || 0,
      icon: CircleDollarSign,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "Lợi nhuận",
      value: overview?.profit || 0,
      icon: TrendingUp,
      color: (overview?.profit || 0) >= 0 ? "text-emerald-600" : "text-rose-600",
      bg: (overview?.profit || 0) >= 0 ? "bg-emerald-50" : "bg-rose-50",
    },
    {
      label: "Lương nhân viên",
      value: overview?.salaryCost || 0,
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Tiền nhập hàng",
      value: overview?.inventoryCost || 0,
      icon: Package,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Doanh thu sân",
      value: overview?.courtRevenue || 0,
      icon: Trophy,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Doanh thu sản phẩm",
      value: overview?.productRevenue || 0,
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Doanh thu đồ uống",
      value: overview?.beverageRevenue || 0,
      icon: Coffee,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold text-sky-700">///MANAGER</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Thống kê doanh thu
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi doanh thu sân, sản phẩm, đồ uống và tổng thể của chi nhánh.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 outline-none"
            />
          </label>
          <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 outline-none"
            />
          </label>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <section
              key={card.label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {formatCurrency(card.value)}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg}`}
                >
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Ước tính doanh thu tháng {monthlyEstimate?.month || "--"}/
            {monthlyEstimate?.year || "----"}
          </p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {formatCurrency(monthlyEstimate?.estimatedRevenue || 0)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Dựa trên {monthlyEstimate?.basedOnDays || 0} ngày đã chọn, trung bình{" "}
            {formatCurrency(monthlyEstimate?.averageDailyRevenue || 0)}/ngày.
          </p>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Ước tính lợi nhuận tháng {monthlyEstimate?.month || "--"}/
            {monthlyEstimate?.year || "----"}
          </p>
          <p
            className={`mt-2 text-3xl font-black ${
              (monthlyEstimate?.estimatedProfit || 0) >= 0
                ? "text-emerald-700"
                : "text-rose-700"
            }`}
          >
            {formatCurrency(monthlyEstimate?.estimatedProfit || 0)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Lợi nhuận = doanh thu - lương nhân viên - tiền nhập hàng.
          </p>
        </section>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Doanh thu theo ngày
              </h2>
              <p className="text-sm text-slate-500">
                Tổng doanh thu trong khoảng đã chọn.
              </p>
            </div>
            {loading && (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                Đang tải
              </span>
            )}
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="totalRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => compactCurrency(Number(value))}
                />
                <Tooltip formatter={tooltipFormatter} />
                <Area
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fill="url(#totalRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#22c55e"
                  strokeWidth={3}
                  fill="url(#profit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Cơ cấu doanh thu</h2>
          <p className="text-sm text-slate-500">
            Nguồn cao nhất: {bestSource.label}
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="revenue"
                  nameKey="label"
                  innerRadius={58}
                  outerRadius={96}
                  paddingAngle={4}
                >
                  {breakdown.map((item) => (
                    <Cell key={item.type} fill={COLORS[item.type]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(Number(value))}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Doanh thu theo tháng
            </h2>
            <p className="text-sm text-slate-500">
              Tổng doanh thu và lợi nhuận gom theo từng tháng trong khoảng đã chọn.
            </p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => compactCurrency(Number(value))}
              />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Bar
                dataKey="totalRevenue"
                name="Doanh thu"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="profit"
                name="Lợi nhuận"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              So sánh từng nguồn
            </h2>
            <p className="text-sm text-slate-500">
              Sân, sản phẩm và đồ uống theo từng ngày.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <WalletCards className="h-4 w-4 text-sky-600" />
            {overview?.bookingCount || 0} lượt sân • {overview?.orderCount || 0}{" "}
            giao dịch hàng hóa
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => compactCurrency(Number(value))}
              />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Bar
                dataKey="courtRevenue"
                name="Sân"
                stackId="revenue"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="productRevenue"
                name="Sản phẩm"
                stackId="revenue"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="beverageRevenue"
                name="Đồ uống"
                stackId="revenue"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default RevenuePage;
