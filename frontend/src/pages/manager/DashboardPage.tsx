import { useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  Coffee,
  Dumbbell,
  PackageCheck,
  Star,
  ShieldCheck,
  Trophy,
  Users,
  WalletCards,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { getManagerRevenue } from "../../redux/slices/manager/revenueSlice";
import {
  getManagerMonthlyHighlights,
  getManagerOrders,
} from "../../redux/slices/manager/orderSlice";
import { getManagerProducts } from "../../redux/slices/manager/productSlice";
import { getManagerBeverages } from "../../redux/slices/manager/beverageSlice";
import { getEmployees } from "../../redux/slices/manager/employeeSlice";
import { getManagerWorkShifts } from "../../redux/slices/manager/workShiftSlice";
import { getMyBranch } from "../../redux/slices/manager/branchSlice";
import { getCourts } from "../../redux/slices/manager/courtSlice";
import { formatOrderItemCode } from "../../utils/order";
import {
  ManagerEmptyState,
  ManagerPageHeader,
  managerCardClass,
} from "../../components/commons/manager/ManagerPage";

const getToday = () => new Date().toISOString().slice(0, 10);

const getStartDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return date.toISOString().slice(0, 10);
};

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

const timeShort = (value?: string | null) => value?.slice(0, 5) || "--:--";

const dateTimeShort = (value?: string | null) => {
  if (!value) return "--";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
};

const displayPersonName = (item?: {
  fullName?: string | null;
  username?: string | null;
}) => item?.fullName?.trim() || item?.username || "--";

const orderStatusLabel: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang soạn",
  READY_TO_SHIP: "Chờ giao",
  SHIPPING: "Đang giao",
  CANCEL_REQUESTED: "Yêu cầu hủy",
  RETURN_REQUESTED: "Yêu cầu trả",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  FAILED: "Thất bại",
  RETURNING: "Đang hoàn",
  RETURNED: "Đã hoàn",
};

const tooltipFormatter = (value: number, name: string) => {
  const labels: Record<string, string> = {
    totalRevenue: "Tổng doanh thu",
    courtRevenue: "Sân",
    productRevenue: "Sản phẩm",
    beverageRevenue: "Đồ uống",
  };

  return [formatCurrency(Number(value || 0)), labels[name] || name];
};

///MANAGER
const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const revenue = useAppSelector((state) => state.managerRevenue.data);
  const revenueLoading = useAppSelector((state) => state.managerRevenue.loading);
  const managerOrders = useAppSelector((state) => state.managerOrder.orders);
  const orderSummary = useAppSelector((state) => state.managerOrder.summary);
  const monthlyHighlights = useAppSelector(
    (state) => state.managerOrder.monthlyHighlights,
  );
  const products = useAppSelector((state) => state.managerProduct.products);
  const beverages = useAppSelector((state) => state.managerBeverage.beverages);
  const employees = useAppSelector((state) => state.managerEmployee.employees);
  const workShifts = useAppSelector((state) => state.managerWorkShift.workShifts);
  const branch = useAppSelector((state) => state.managerBranch.branch);
  const courts = useAppSelector((state) => state.managerCourt.courts);

  const today = useMemo(() => getToday(), []);

  useEffect(() => {
    dispatch(getMyBranch());
    dispatch(getCourts());
    dispatch(getEmployees());
    dispatch(getManagerProducts({ page: 1, limit: 100 }));
    dispatch(getManagerBeverages({ page: 1, limit: 100 }));
    dispatch(getManagerWorkShifts({ workDate: today }));
    dispatch(getManagerRevenue({ startDate: getStartDate(), endDate: today }));
    dispatch(getManagerOrders({ page: 1, limit: 5 }));
    dispatch(getManagerMonthlyHighlights());
  }, [dispatch, today]);

  const productStock = products.reduce(
    (sum, product) => sum + Number(product.totalStock || 0),
    0,
  );
  const beverageStock = beverages.reduce(
    (sum, beverage) => sum + Number(beverage.stock || 0),
    0,
  );
  const activeEmployees = employees.filter((employee) => employee.isActive);
  const todayAssignments = workShifts.reduce(
    (sum, shift) => sum + shift.assignments.length,
    0,
  );
  const cashierCount = workShifts.reduce(
    (sum, shift) =>
      sum +
      shift.assignments.filter((item) => item.roleInShift === "CASHIER").length,
    0,
  );
  const activeCourtCount = courts.filter(
    (court) => court.courtStatus === "ACTIVE",
  ).length;
  const pendingOrderCount =
    Number(orderSummary.PENDING || 0) +
    Number(orderSummary.CANCEL_REQUESTED || 0) +
    Number(orderSummary.RETURN_REQUESTED || 0);

  const overview = revenue?.overview;
  const chart = revenue?.chart || [];
  const breakdown = revenue?.breakdown || [];
  const bestDay = useMemo(
    () =>
      [...chart].sort((a, b) => b.totalRevenue - a.totalRevenue)[0] || {
        date: today,
        totalRevenue: 0,
      },
    [chart, today],
  );

  const stockChart = [
    { name: "Sản phẩm", value: productStock, fill: "#22c55e" },
    { name: "Đồ uống", value: beverageStock, fill: "#f59e0b" },
  ];

  const topProducts = monthlyHighlights?.topProducts || [];
  const topBookers = monthlyHighlights?.topBookers || [];
  const topEmployees = monthlyHighlights?.topEmployees || [];
  const highlightsLabel = monthlyHighlights
    ? `Tháng ${monthlyHighlights.month}/${monthlyHighlights.year}`
    : "Tháng này";

  const stats = [
    {
      label: "Doanh thu 30 ngày",
      value: formatCurrency(overview?.totalRevenue || 0),
      hint: `Ngày cao nhất ${bestDay.date}`,
      icon: CircleDollarSign,
      bg: "bg-sky-50",
      iconColor: "text-sky-600",
    },
    {
      label: "Đơn hàng online",
      value: `${orderSummary.totalOrders || 0}`,
      hint: `${pendingOrderCount} đơn cần theo dõi`,
      icon: ClipboardList,
      bg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
    {
      label: "Tồn kho hàng hóa",
      value: `${productStock + beverageStock}`,
      hint: `${productStock} sản phẩm • ${beverageStock} đồ uống`,
      icon: PackageCheck,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Nhân viên hoạt động",
      value: `${activeEmployees.length}`,
      hint: `${todayAssignments} lượt phân ca hôm nay`,
      icon: Users,
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      label: "Sân đang mở",
      value: `${activeCourtCount}/${courts.length || 0}`,
      hint: `${workShifts.length} ca làm hôm nay`,
      icon: Trophy,
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <ManagerPageHeader
        eyebrow="Manager dashboard"
        title={branch?.branchName || "Tổng quan chi nhánh"}
        description="Theo dõi doanh thu, tồn kho, nhân sự và lịch vận hành trong một màn hình tổng quan."
        metrics={[
          { label: "Doanh thu sân", value: formatCurrency(overview?.courtRevenue || 0) },
          { label: "Ngày tốt nhất", value: compactCurrency(bestDay.totalRevenue || 0) },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <section
              key={item.label}
              className={`${managerCardClass} p-5`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {item.hint}
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg}`}
                >
                  <Icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className={`${managerCardClass} p-5`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
              <h2 className="text-lg font-bold text-slate-900">Đơn hàng mới</h2>
            <p className="text-sm text-slate-500">
              5 đơn online gần nhất của chi nhánh.
            </p>
          </div>
          <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600">
            <ClipboardList className="h-5 w-5" />
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-5">
          {managerOrders.length ? (
            managerOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm font-black text-sky-700">
                    {formatOrderItemCode(order.id)}
                  </p>
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-600">
                    {orderStatusLabel[order.orderStatus] || order.orderStatus}
                  </span>
                </div>
                <p className="mt-3 truncate text-sm font-bold text-slate-800">
                  {order.shippingName}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {dateTimeShort(order.createdAt)}
                </p>
                <p className="mt-3 text-base font-black text-slate-900">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            ))
          ) : (
            <div className="lg:col-span-5">
              <ManagerEmptyState
                icon={ClipboardList}
                title="Chưa có đơn hàng online"
                description="Các đơn mới nhất sẽ xuất hiện ở đây sau khi khách đặt hàng."
              />
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Top sản phẩm bán chạy
              </h2>
              <p className="text-sm text-slate-500">{highlightsLabel}</p>
            </div>
            <PackageCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="space-y-3">
            {topProducts.length ? (
              topProducts.map((item, index) => (
                <div
                  key={`${item.productName}-${item.variantInfo || index}`}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-sm font-black text-emerald-700">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {item.productName}
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-500">
                      {item.variantInfo || "Tất cả biến thể"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">
                      {item.quantity}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      {compactCurrency(item.revenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm font-semibold text-slate-500">
                Chưa có dữ liệu bán hàng tháng này.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Người đặt sân nổi bật
              </h2>
              <p className="text-sm text-slate-500">{highlightsLabel}</p>
            </div>
            <Star className="h-6 w-6 text-amber-500" />
          </div>
          <div className="space-y-3">
            {topBookers.length ? (
              topBookers.map((item, index) => (
                <div
                  key={item.userId}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-100 text-sm font-black text-amber-700">
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {displayPersonName(item)}
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-500">
                      @{item.username}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">
                      {item.bookingCount} lịch
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      {compactCurrency(item.totalAmount)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm font-semibold text-slate-500">
                Chưa có lịch đặt sân tháng này.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Top nhân viên làm nhiều
              </h2>
              <p className="text-sm text-slate-500">{highlightsLabel}</p>
            </div>
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="space-y-3">
            {topEmployees.length ? (
              topEmployees.map((item, index) => (
                <div
                  key={item.employeeId}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-100 text-sm font-black text-indigo-700">
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {displayPersonName(item)}
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-500">
                      @{item.username}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">
                      {item.shiftCount} ca
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      {compactCurrency(item.earnedWage)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm font-semibold text-slate-500">
                Chưa có phân ca tháng này.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Nhịp doanh thu
              </h2>
              <p className="text-sm text-slate-500">
                Tổng doanh thu 30 ngày gần nhất.
              </p>
            </div>
            {revenueLoading && (
              <span className="rounded-xl bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                Đang tải
              </span>
            )}
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
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
                  fill="url(#dashboardRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Cơ cấu doanh thu
          </h2>
          <p className="text-sm text-slate-500">
            Sân, sản phẩm và đồ uống trong 30 ngày.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="revenue"
                  nameKey="label"
                  innerRadius={54}
                  outerRadius={92}
                  paddingAngle={4}
                >
                  {breakdown.map((item) => (
                    <Cell
                      key={item.type}
                      fill={
                        item.type === "COURT"
                          ? "#0ea5e9"
                          : item.type === "PRODUCT"
                            ? "#22c55e"
                            : "#f59e0b"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {breakdown.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
              >
                <span className="text-sm font-bold text-slate-700">
                  {item.label}
                </span>
                <span className="text-sm font-black text-slate-900">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Nguồn doanh thu</h2>
          <p className="text-sm text-slate-500">So sánh theo từng ngày.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => compactCurrency(Number(value))}
                />
                <Tooltip formatter={tooltipFormatter} />
                <Bar dataKey="courtRevenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="productRevenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="beverageRevenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Vận hành hôm nay</h2>
              <p className="text-sm text-slate-500">{today}</p>
            </div>
            <CalendarClock className="h-6 w-6 text-sky-600" />
          </div>
          <div className="space-y-3">
            {workShifts.length ? (
              workShifts.slice(0, 4).map((shift) => (
                <div
                  key={shift.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-900">{shift.shiftName}</p>
                    <span className="rounded-xl bg-white px-2 py-1 text-xs font-bold text-slate-600">
                      {shift.shiftStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {timeShort(shift.startTime)} - {timeShort(shift.endTime)}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-slate-500">
                    <span>{shift.assignments.length} nhân viên</span>
                    <span>{cashierCount} thu ngân</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm font-semibold text-slate-500">
                Chưa có ca hôm nay.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Kho hàng</h2>
              <p className="text-sm text-slate-500">Tồn kho tại chi nhánh.</p>
            </div>
            <WalletCards className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockChart}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={72}
                  paddingAngle={5}
                >
                  {stockChart.map((item) => (
                    <Cell key={item.name} fill={item.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3">
              <PackageCheck className="h-5 w-5 text-emerald-600" />
              <p className="mt-2 text-xl font-black text-slate-900">
                {productStock}
              </p>
              <p className="text-xs font-bold text-slate-500">Sản phẩm</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3">
              <Coffee className="h-5 w-5 text-amber-600" />
              <p className="mt-2 text-xl font-black text-slate-900">
                {beverageStock}
              </p>
              <p className="text-xs font-bold text-slate-500">Đồ uống</p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Tình trạng chi nhánh</h2>
            <p className="text-sm text-slate-500">
              Những chỉ số cần để manager nắm nhanh trước khi vận hành.
            </p>
          </div>
          <ShieldCheck className="h-6 w-6 text-sky-600" />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <Dumbbell className="h-5 w-5 text-sky-600" />
            <p className="mt-2 text-2xl font-black text-slate-900">
              {courts.length}
            </p>
            <p className="text-xs font-bold uppercase text-slate-500">Tổng sân</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <Users className="h-5 w-5 text-indigo-600" />
            <p className="mt-2 text-2xl font-black text-slate-900">
              {employees.length}
            </p>
            <p className="text-xs font-bold uppercase text-slate-500">
              Tổng nhân viên
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <PackageCheck className="h-5 w-5 text-emerald-600" />
            <p className="mt-2 text-2xl font-black text-slate-900">
              {products.length}
            </p>
            <p className="text-xs font-bold uppercase text-slate-500">
              Mặt hàng sản phẩm
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <Coffee className="h-5 w-5 text-amber-600" />
            <p className="mt-2 text-2xl font-black text-slate-900">
              {beverages.length}
            </p>
            <p className="text-xs font-bold uppercase text-slate-500">
              Mặt hàng đồ uống
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
