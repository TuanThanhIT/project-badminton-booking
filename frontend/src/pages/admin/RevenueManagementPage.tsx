import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Building2,
  CalendarDays,
  Coffee,
  Package,
  RefreshCw,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import { adminPrimaryButtonClass } from "../../components/ui/admin/AdminModal";
import adminRevenueService from "../../services/admin/revenueService";
import type {
  AdminBeverageRevenue,
  AdminBranchRevenue,
  AdminDateRevenue,
  AdminProductRevenue,
} from "../../types/admin";

type RevenueType = "ALL" | "BOOKING" | "PRODUCT" | "BEVERAGE";
type ItemType = "ALL" | "PRODUCT_VARIANT" | "BEVERAGE";
type GroupBy = "day" | "month";

type RevenueSummary = {
  totalRevenue: number;
  bookingRevenue: number;
  productRevenue: number;
  beverageRevenue: number;
  salesRevenue: number;
  salesCost: number;
  grossProfit: number;
  grossMargin: number;
  bookingCount: number;
  orderCount: number;
  productQuantitySold: number;
  beverageQuantitySold: number;
};

type RevenueReport = {
  summary: RevenueSummary;
  revenueChart: AdminDateRevenue[];
  revenueByType: {
    type: RevenueType;
    label: string;
    transactionCount: number;
    quantity?: number;
    revenue: number;
  }[];
  revenueByBranch: (AdminBranchRevenue & { contributionRate?: number })[];
  productRevenueItems: AdminProductRevenue[];
  beverageRevenueItems: AdminBeverageRevenue[];
  profitSummary: {
    productSales: { revenue: number; cost: number; grossProfit: number };
    beverageSales: { revenue: number; cost: number; grossProfit: number };
  };
};

const toDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = () => toDateInput(new Date());

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - (days - 1));
  return toDateInput(date);
};

const firstDayOfMonth = () => {
  const date = new Date();
  return toDateInput(new Date(date.getFullYear(), date.getMonth(), 1));
};

const fmtCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const fmtShort = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

const PRESETS = [
  { label: "7 ngày", getRange: () => ({ start: daysAgo(7), end: today() }) },
  { label: "30 ngày", getRange: () => ({ start: daysAgo(30), end: today() }) },
  {
    label: "Tháng này",
    getRange: () => ({ start: firstDayOfMonth(), end: today() }),
  },
];

const revenueTypeOptions: { value: RevenueType; label: string }[] = [
  { value: "ALL", label: "Tất cả doanh thu" },
  { value: "BOOKING", label: "Đặt sân" },
  { value: "PRODUCT", label: "Sản phẩm" },
  { value: "BEVERAGE", label: "Đồ uống" },
];

const itemTypeOptions: { value: ItemType; label: string }[] = [
  { value: "ALL", label: "Tất cả hàng" },
  { value: "PRODUCT_VARIANT", label: "Sản phẩm cầu lông" },
  { value: "BEVERAGE", label: "Đồ uống" },
];

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

const SummaryCard = ({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Wallet;
  tone: string;
}) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{note}</p>
      </div>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const RevenueManagementPage = () => {
  const initialRange = PRESETS[1].getRange();
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [applied, setApplied] = useState(initialRange);
  const [activePreset, setActivePreset] = useState(PRESETS[1].label);
  const [branchId, setBranchId] = useState("");
  const [revenueType, setRevenueType] = useState<RevenueType>("ALL");
  const [itemType, setItemType] = useState<ItemType>("ALL");
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [branchSearch, setBranchSearch] = useState("");

  const [report, setReport] = useState<RevenueReport | null>(null);
  const [branchOptions, setBranchOptions] = useState<AdminBranchRevenue[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminRevenueService.getRevenueReportService({
        startDate: applied.start,
        endDate: applied.end,
        branchId: branchId || undefined,
        revenueType,
        itemType,
        groupBy,
        limit: 30,
      });
      const data = (res.data as any).data as RevenueReport;
      setReport(data);
      if (!branchId && data.revenueByBranch?.length) {
        setBranchOptions(data.revenueByBranch);
      }
    } catch {
      setReport(null);
      toast.error("Không thể tải báo cáo doanh thu");
    } finally {
      setLoading(false);
    }
  }, [applied, branchId, groupBy, itemType, revenueType]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    const range = preset.getRange();
    setStartDate(range.start);
    setEndDate(range.end);
    setApplied(range);
    setActivePreset(preset.label);
  };

  const applyCustomRange = () => {
    if (!startDate || !endDate) {
      toast.warning("Vui lòng chọn đủ ngày bắt đầu và ngày kết thúc");
      return;
    }
    if (startDate > endDate) {
      toast.warning("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }
    setApplied({ start: startDate, end: endDate });
    setActivePreset("Tùy chỉnh");
  };

  const summary = report?.summary;
  const chartData = useMemo(
    () =>
      (report?.revenueChart || []).map((item: any) => {
        const label =
          groupBy === "month"
            ? item.month || item.revenueKey
            : item.date?.slice(5) || item.revenueKey;
        return {
          ...item,
          label,
        };
      }),
    [groupBy, report],
  );

  const filteredBranches = useMemo(() => {
    const keyword = branchSearch.trim().toLowerCase();
    return (report?.revenueByBranch || []).filter((branch) =>
      branch.branchName.toLowerCase().includes(keyword),
    );
  }, [branchSearch, report]);

  const summaryCards = summary
    ? [
        {
          label: "Tổng doanh thu",
          value: fmtCurrency(summary.totalRevenue),
          note: `${summary.bookingCount} booking · ${summary.orderCount} đơn hàng`,
          icon: Wallet,
          tone: "bg-sky-50 text-sky-600",
        },
        {
          label: "Doanh thu đặt sân",
          value: fmtCurrency(summary.bookingRevenue),
          note: "Không tính là lợi nhuận khi chưa có chi phí sân",
          icon: CalendarDays,
          tone: "bg-indigo-50 text-indigo-600",
        },
        {
          label: "Doanh thu bán hàng",
          value: fmtCurrency(summary.salesRevenue),
          note: `${summary.productQuantitySold} sản phẩm · ${summary.beverageQuantitySold} đồ uống`,
          icon: Package,
          tone: "bg-emerald-50 text-emerald-600",
        },
        {
          label: "Giá vốn bán hàng",
          value: fmtCurrency(summary.salesCost),
          note: "Ước tính theo giá nhập đã duyệt",
          icon: ShoppingBagIcon,
          tone: "bg-amber-50 text-amber-600",
        },
        {
          label: "Lợi nhuận gộp",
          value: fmtCurrency(summary.grossProfit),
          note: `Biên lợi nhuận ${summary.grossMargin}%`,
          icon: TrendingUp,
          tone: "bg-violet-50 text-violet-600",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Báo cáo doanh thu"
        subtitle="Báo cáo chi tiết doanh thu toàn hệ thống, theo chi nhánh, nguồn thu, mặt hàng, giá vốn và lợi nhuận gộp."
        action={
          <button
            type="button"
            onClick={fetchReport}
            disabled={loading}
            className={adminPrimaryButtonClass}
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Cập nhật
          </button>
        }
      />

      <section>
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <CalendarDays className="h-4 w-4 text-sky-600" />
              Bộ lọc báo cáo
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Đang xem từ {applied.start} đến {applied.end}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`h-10 rounded-lg px-4 text-sm font-semibold transition ${
                  activePreset === preset.label
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setActivePreset("Tùy chỉnh");
              }}
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <span className="text-sm text-slate-400">đến</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setActivePreset("Tùy chỉnh");
              }}
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <button
              type="button"
              onClick={applyCustomRange}
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Áp dụng
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <select
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">Tất cả chi nhánh</option>
            {branchOptions.map((branch) => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.branchName}
              </option>
            ))}
          </select>
          <select
            value={revenueType}
            onChange={(event) =>
              setRevenueType(event.target.value as RevenueType)
            }
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            {revenueTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={itemType}
            onChange={(event) => setItemType(event.target.value as ItemType)}
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            {itemTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={groupBy}
            onChange={(event) => setGroupBy(event.target.value as GroupBy)}
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            <option value="day">Biểu đồ theo ngày</option>
            <option value="month">Biểu đồ theo tháng</option>
          </select>
        </div>
      </section>

      {loading && !report ? (
        <div className="flex justify-center rounded-lg border border-slate-200 bg-white py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        </div>
      ) : !report || !summary ? (
        <div className="rounded-lg border border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
          Không có dữ liệu báo cáo
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {summaryCards.map((card) => (
              <SummaryCard key={card.label} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Doanh thu theo thời gian
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Tách tổng doanh thu, đặt sân, sản phẩm và đồ uống
                  </p>
                </div>
                <BarChart3 className="h-5 w-5 text-slate-300" />
              </div>
              {chartData.length === 0 ? (
                <div className="py-20 text-center text-sm text-slate-400">
                  Không có dữ liệu biểu đồ
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      barSize={groupBy === "month" ? 24 : 12}
                      barGap={2}
                    >
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        tickFormatter={(v) => fmtShort(Number(v))}
                        width={56}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar
                        dataKey="totalRevenue"
                        name="Tổng doanh thu"
                        fill="#0ea5e9"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="bookingRevenue"
                        name="Đặt sân"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="productRevenue"
                        name="Sản phẩm"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="beverageRevenue"
                        name="Đồ uống"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Lợi nhuận gộp bán hàng
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Chỉ tính sản phẩm và đồ uống, không tính chi phí vận hành sân.
              </p>
              <div className="mt-5 space-y-4">
                {[
                  ["Sản phẩm", report.profitSummary.productSales],
                  ["Đồ uống", report.profitSummary.beverageSales],
                ].map(([label, item]: any) => (
                  <div key={label} className="rounded-lg bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800">{label}</p>
                      <p className="font-bold text-sky-700">
                        {fmtCurrency(item.grossProfit)}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Doanh thu {fmtCurrency(item.revenue)} · Giá vốn{" "}
                      {fmtCurrency(item.cost)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Doanh thu theo chi nhánh
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  So sánh đóng góp doanh thu giữa các branch
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={branchSearch}
                  onChange={(event) => setBranchSearch(event.target.value)}
                  placeholder="Tìm chi nhánh..."
                  className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {[
                      "#",
                      "Chi nhánh",
                      "Đặt sân",
                      "Sản phẩm",
                      "Đồ uống",
                      "Tổng",
                      "Booking",
                      "Đơn",
                      "Đóng góp",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left font-semibold"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBranches.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-slate-400"
                      >
                        Không có dữ liệu chi nhánh
                      </td>
                    </tr>
                  ) : (
                    filteredBranches.map((branch, index) => (
                      <tr key={branch.branchId} className="hover:bg-sky-50">
                        <td className="px-4 py-3 text-center text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {branch.branchName}
                        </td>
                        <td className="px-4 py-3 text-indigo-700">
                          {fmtCurrency(branch.bookingRevenue)}
                        </td>
                        <td className="px-4 py-3 text-emerald-700">
                          {fmtCurrency(branch.productRevenue)}
                        </td>
                        <td className="px-4 py-3 text-amber-700">
                          {fmtCurrency(branch.beverageRevenue)}
                        </td>
                        <td className="px-4 py-3 font-bold text-sky-700">
                          {fmtCurrency(branch.totalRevenue)}
                        </td>
                        <td className="px-4 py-3">{branch.bookingCount}</td>
                        <td className="px-4 py-3">{branch.orderCount}</td>
                        <td className="px-4 py-3">
                          {branch.contributionRate || 0}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <Package className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-900">
                  Sản phẩm cầu lông
                </h2>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      {[
                        "#",
                        "Sản phẩm",
                        "SKU",
                        "Số lượng",
                        "Doanh thu",
                        "Giá vốn",
                        "Lợi nhuận gộp",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left font-semibold"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.productRevenueItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-slate-400"
                        >
                          Không có dữ liệu sản phẩm
                        </td>
                      </tr>
                    ) : (
                      report.productRevenueItems.map((item, index) => (
                        <tr
                          key={item.productVariantId}
                          className="hover:bg-sky-50"
                        >
                          <td className="px-4 py-3 text-center text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">
                              {item.productName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {item.variantInfo || "Không phân loại"}
                            </p>
                          </td>
                          <td className="px-4 py-3">{item.sku || "-"}</td>
                          <td className="px-4 py-3">{item.totalQuantity}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-700">
                            {fmtCurrency(item.totalRevenue)}
                          </td>
                          <td className="px-4 py-3">
                            {fmtCurrency(item.totalCost || 0)}
                          </td>
                          <td className="px-4 py-3 font-bold text-sky-700">
                            {fmtCurrency(item.grossProfit || 0)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <Coffee className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">Đồ uống</h2>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      {[
                        "#",
                        "Đồ uống",
                        "Số lượng",
                        "Doanh thu",
                        "Giá vốn",
                        "Lợi nhuận gộp",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left font-semibold"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.beverageRevenueItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-slate-400"
                        >
                          Không có dữ liệu đồ uống
                        </td>
                      </tr>
                    ) : (
                      report.beverageRevenueItems.map((item, index) => (
                        <tr key={item.beverageId} className="hover:bg-sky-50">
                          <td className="px-4 py-3 text-center text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {item.beverageName}
                          </td>
                          <td className="px-4 py-3">{item.totalQuantity}</td>
                          <td className="px-4 py-3 font-semibold text-amber-700">
                            {fmtCurrency(item.totalRevenue)}
                          </td>
                          <td className="px-4 py-3">
                            {fmtCurrency(item.totalCost || 0)}
                          </td>
                          <td className="px-4 py-3 font-bold text-sky-700">
                            {fmtCurrency(item.grossProfit || 0)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-sky-500" />
              <h2 className="text-lg font-bold text-slate-900">
                Doanh thu theo loại
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {report.revenueByType.map((item) => (
                <div key={item.type} className="rounded-lg bg-slate-50 p-4">
                  <p className="font-semibold text-slate-800">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-sky-700">
                    {fmtCurrency(item.revenue)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.transactionCount} giao dịch
                    {item.quantity ? ` · ${item.quantity} món/SP` : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const ShoppingBagIcon = Package;

export default RevenueManagementPage;
