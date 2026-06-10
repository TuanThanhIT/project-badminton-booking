import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
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
import { CalendarDays, Coffee, Download, Package, Trophy } from "lucide-react";
import managerRevenueService from "../../services/manager/revenueService";
import {
  ManagerEmptyState,
  ManagerPageHeader,
  managerCardClass,
  managerInputClass,
} from "../../components/commons/manager/ManagerPage";
import TablePagination from "../../components/ui/user/pagination/TablePagination";
import { exportExcel } from "../../utils/exportExcel";
import { ORDER_STATUS_COLOR } from "../../utils/constants/color";
import { ORDER_STATUS_LABEL } from "../../utils/constants/orderLabel";

const LIMIT = 10;

const REVENUE_TYPE_COLORS = ["#0ea5e9", "#22c55e", "#f59e0b"];

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - (days - 1));
  return date.toISOString().slice(0, 10);
};

const fmtCurrency = (value: number) =>
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

const OrderStatusBadge = ({ status }: { status?: string }) => {
  const statusKey = status || "UNKNOWN";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        ORDER_STATUS_COLOR[statusKey] || "bg-slate-100 text-slate-600"
      }`}
    >
      {ORDER_STATUS_LABEL[statusKey] || statusKey}
    </span>
  );
};

type BranchTopRankingType = "product" | "beverage";

type BranchTopRankingItem = {
  productName?: string | null;
  beverageName?: string | null;
  variant?: string | null;
  sku?: string | null;
  quantitySold?: number | string | null;
  revenue?: number | string | null;
};

type BranchTopRankingProps = {
  title: string;
  items: BranchTopRankingItem[];
  type: BranchTopRankingType;
};

const fmtRankingCurrency = (value: number | string | null | undefined) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const rankBadgeClass = (index: number) => {
  if (index === 0) return "bg-amber-100 text-amber-700";
  if (index === 1) return "bg-slate-200 text-slate-700";
  if (index === 2) return "bg-orange-100 text-orange-700";
  return "bg-slate-50 text-slate-500";
};

const RevenuePage = () => {
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate] = useState(today());
  const [revenueType, setRevenueType] = useState("ALL");
  const [itemType, setItemType] = useState("ALL");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await managerRevenueService.getRevenueReportService({
        startDate,
        endDate,
        revenueType,
        itemType,
      } as any);
      setReport((res.data as any).data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, revenueType, itemType]);

  const summary = report?.summary || {};
  const chart = report?.revenueChart || [];
  const revenueByType = report?.revenueByType || [];
  const productItems = report?.productRevenueItems || [];
  const beverageItems = report?.beverageRevenueItems || [];
  const recentOrders = report?.recentRevenueOrders || [];
  const revenueTypePie = revenueByType
    .map((item: any, index: number) => ({
      name: item.label,
      value: Number(item.revenue || 0),
      fill: REVENUE_TYPE_COLORS[index % REVENUE_TYPE_COLORS.length],
    }))
    .filter((item: any) => item.value > 0);

  const handleExportExcel = () => {
    exportExcel(`bao-cao-doanh-thu-manager-${startDate}_${endDate}.xls`, [
      {
        title: "Tong quan doanh thu",
        headers: ["Chi tieu", "Gia tri"],
        rows: [
          ["Tong doanh thu", summary.totalRevenue || 0],
          ["Doanh thu dat san", summary.bookingRevenue || 0],
          ["Doanh thu san pham", summary.productRevenue || 0],
          ["Doanh thu do uong", summary.beverageRevenue || 0],
          ["So luot dat san", summary.bookingCount || 0],
          ["So don hang", summary.orderCount || 0],
        ],
      },
      {
        title: "Doanh thu theo thoi gian",
        headers: ["Ngay", "Nhan", "Dat san", "San pham", "Do uong", "Tong"],
        rows: chart.map((item: any) => [
          item.date,
          item.label,
          item.bookingRevenue || 0,
          item.productRevenue || 0,
          item.beverageRevenue || 0,
          item.totalRevenue || 0,
        ]),
      },
      {
        title: "Doanh thu theo loai",
        headers: ["Loai", "So luong", "Doanh thu"],
        rows: revenueByType.map((item: any) => [
          item.label,
          item.transactionCount || 0,
          item.revenue || 0,
        ]),
      },
      {
        title: "Top san pham",
        headers: ["Ten", "Variant", "SKU", "So luong", "Doanh thu"],
        rows: productItems.map((item: any) => [
          item.productName,
          item.variant || "",
          item.sku || "",
          item.quantitySold || 0,
          item.revenue || 0,
        ]),
      },
      {
        title: "Top do uong",
        headers: ["Ten", "So luong", "Doanh thu"],
        rows: beverageItems.map((item: any) => [
          item.beverageName,
          item.quantitySold || 0,
          item.revenue || 0,
        ]),
      },
      {
        title: "Don hang tao doanh thu",
        headers: [
          "Ma don",
          "Khach hang",
          "Tong tien",
          "Trang thai",
          "Thoi gian",
        ],
        rows: recentOrders.map((item: any) => [
          item.code,
          item.customerName || "",
          item.amount || 0,
          item.status || "",
          item.createdAt
            ? new Date(item.createdAt).toLocaleString("vi-VN")
            : "",
        ]),
      },
    ]);
  };

  const cards = [
    {
      label: "Tổng doanh thu",
      value: fmtCurrency(summary.totalRevenue),
      hint: "Không bao gồm báo cáo lợi nhuận",
      icon: Trophy,
    },
    {
      label: "Doanh thu đặt sân",
      value: fmtCurrency(summary.bookingRevenue),
      hint: `${summary.bookingCount || 0} lượt đặt`,
      icon: CalendarDays,
    },
    {
      label: "Doanh thu sản phẩm",
      value: fmtCurrency(summary.productRevenue),
      hint: `${summary.productQuantitySold || 0} sản phẩm`,
      icon: Package,
    },
    {
      label: "Doanh thu đồ uống",
      value: fmtCurrency(summary.beverageRevenue),
      hint: `${summary.beverageQuantitySold || 0} đồ uống`,
      icon: Coffee,
    },
  ];

  return (
    <div className="space-y-6">
      <ManagerPageHeader
        eyebrow="Manager revenue"
        title="Báo cáo doanh thu"
        description="Manager chỉ xem doanh thu của branch mình quản lý, không hiển thị giá vốn hoặc lợi nhuận."
        metrics={[
          { label: "Tổng doanh thu", value: fmtCurrency(summary.totalRevenue) },
        ]}
      />

      <section
        className={`${managerCardClass} grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5`}
      >
        <label>
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Từ ngày
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className={`w-full ${managerInputClass}`}
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Đến ngày
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className={`w-full ${managerInputClass}`}
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Loại doanh thu
          </span>
          <select
            value={revenueType}
            onChange={(event) => setRevenueType(event.target.value)}
            className={`w-full ${managerInputClass}`}
          >
            <option value="ALL">Tất cả</option>
            <option value="BOOKING">Đặt sân</option>
            <option value="PRODUCT">Sản phẩm</option>
            <option value="BEVERAGE">Đồ uống</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Loại hàng
          </span>
          <select
            value={itemType}
            onChange={(event) => setItemType(event.target.value)}
            className={`w-full ${managerInputClass}`}
          >
            <option value="ALL">Tất cả</option>
            <option value="PRODUCT_VARIANT">Sản phẩm</option>
            <option value="BEVERAGE">Đồ uống</option>
          </select>
        </label>
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={!report || loading}
          className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none"
        >
          <Download className="h-4 w-4" />
          Xuất Excel
        </button>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <section key={card.label} className={`${managerCardClass} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {card.hint}
                  </p>
                </div>
                <div className="rounded-lg bg-sky-50 p-3 text-sky-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className={`${managerCardClass} p-5`}>
        <h2 className="text-lg font-bold text-slate-900">
          Doanh thu theo thời gian
        </h2>
        <p className="text-sm text-slate-500">
          Tách tổng doanh thu, đặt sân, sản phẩm và đồ uống của branch.
        </p>
        <div className="mt-4 h-96">
          {chart.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(value) => compactCurrency(Number(value))}
                />
                <Tooltip
                  formatter={(value: number) => fmtCurrency(Number(value))}
                />
                <Legend />
                <Bar
                  dataKey="bookingRevenue"
                  name="Đặt sân"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="productRevenue"
                  name="Sản phẩm"
                  fill="#22c55e"
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
          ) : (
            <ManagerEmptyState
              icon={Trophy}
              title="Không có dữ liệu doanh thu"
              description="Dữ liệu sẽ hiển thị khi branch có giao dịch trong khoảng thời gian đã chọn."
            />
          )}
        </div>
      </section>

      <section className={`${managerCardClass} p-5`}>
        <h2 className="text-lg font-bold text-slate-900">
          Doanh thu theo loại
        </h2>
        <p className="text-sm text-slate-500">
          Tách doanh thu đặt sân, sản phẩm và đồ uống tại chi nhánh.
        </p>
        <div className="mt-4 h-80 rounded-lg border border-slate-200 p-3">
          {revenueTypePie.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueTypePie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={64}
                  outerRadius={104}
                  paddingAngle={2}
                >
                  {revenueTypePie.map((item: any) => (
                    <Cell key={item.name} fill={item.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => fmtCurrency(Number(value))}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ManagerEmptyState
              icon={Trophy}
              title="KhÃ´ng cÃ³ dá»¯ liá»‡u theo loáº¡i"
              description="Biá»ƒu Ä‘á»“ sáº½ hiá»ƒn thá»‹ khi cÃ³ doanh thu trong khoáº£ng Ä‘Ã£ chá»n."
            />
          )}
        </div>
        <ReportTable
          headers={["Loại", "Số lượng", "Doanh thu"]}
          empty="Không có dữ liệu theo loại"
          rows={revenueByType.map((item: any) => [
            item.label,
            item.transactionCount,
            fmtCurrency(item.revenue),
          ])}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <BranchTopRanking
          title="Top sản phẩm tại chi nhánh"
          items={productItems}
          type="product"
        />
        <BranchTopRanking
          title="Top đồ uống tại chi nhánh"
          items={beverageItems}
          type="beverage"
        />
      </div>

      <section className={`${managerCardClass} p-5`}>
        <h2 className="text-lg font-bold text-slate-900">
          Đơn hàng tạo doanh thu
        </h2>
        <p className="text-sm text-slate-500">
          Danh sách đơn hàng phát sinh doanh thu trong khoảng thời gian đã chọn.
        </p>
        <ReportTable
          headers={[
            "Mã đơn",
            "Khách hàng",
            "Tổng tiền",
            "Trạng thái",
            "Thời gian",
          ]}
          empty="Không có đơn hàng tạo doanh thu"
          rows={recentOrders.map((item: any) => [
            item.code,
            item.customerName || "-",
            fmtCurrency(item.amount),
            <OrderStatusBadge status={item.status} />,
            item.createdAt
              ? new Date(item.createdAt).toLocaleString("vi-VN")
              : "-",
          ])}
        />
      </section>
    </div>
  );
};

const BranchTopRanking = ({ title, items, type }: BranchTopRankingProps) => {
  const normalizedItems = (items || []).slice(0, 10).map((item) => ({
    ...item,
    name:
      type === "product"
        ? item.productName || "Sản phẩm"
        : item.beverageName || "Đồ uống",
    quantitySold: Number(item.quantitySold || 0),
    revenue: Number(item.revenue || 0),
  }));
  const maxRevenue = Math.max(
    ...normalizedItems.map((item) => item.revenue),
    0,
  );
  const EmptyIcon = type === "product" ? Package : Coffee;

  return (
    <section
      className={`${managerCardClass} flex flex-col p-5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Xếp hạng theo doanh thu tại chi nhánh
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">
          Top 10
        </span>
      </div>

      <div className="dashboard-short-scrollbar mt-5 max-h-[568px] space-y-3 overflow-y-auto pr-1">
        {normalizedItems.length ? (
          normalizedItems.map((item, index) => {
            const percentage = maxRevenue
              ? (Number(item.revenue || 0) / maxRevenue) * 100
              : 0;
            const variant = item.variant || "";
            const sku = item.sku || "";
            const productMeta = [variant, sku ? `SKU: ${sku}` : ""]
              .filter(Boolean)
              .join(" · ");

            return (
              <div
                key={`${type}-${index}-${item.name}-${sku}`}
                className="min-h-[104px] rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${rankBadgeClass(
                      index,
                    )}`}
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <p
                        className="min-w-0 overflow-hidden text-sm font-semibold text-slate-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      <p className="shrink-0 text-sm font-bold text-sky-700">
                        {fmtRankingCurrency(item.revenue)}
                      </p>
                    </div>

                    <div className="mt-1 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                      {type === "product" ? (
                        <p className="min-w-0 truncate" title={productMeta}>
                          {productMeta || "-"}
                        </p>
                      ) : (
                        <p className="min-w-0 truncate">Đồ uống tại chi nhánh</p>
                      )}
                      <p className="shrink-0 font-semibold text-slate-600">
                        Đã bán {Number(item.quantitySold || 0)}
                      </p>
                    </div>

                    <div className="mt-3 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-sky-500"
                        style={{
                          width: `${Math.max(percentage, percentage > 0 ? 4 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-full min-h-80 items-center justify-center rounded-xl border border-dashed border-slate-200">
            <ManagerEmptyState
              icon={EmptyIcon}
              title={
                type === "product"
                  ? "Không có sản phẩm bán chạy"
                  : "Không có đồ uống bán chạy"
              }
              description="Dữ liệu sẽ hiển thị khi chi nhánh có doanh thu trong khoảng đã chọn."
            />
          </div>
        )}
      </div>
    </section>
  );
};

const ReportTable = ({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: Array<Array<ReactNode>>;
  empty: string;
}) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(rows.length / LIMIT);
  const paginatedRows = rows.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-semibold">#</th>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 [&_td]:align-top">
          {paginatedRows.map((row, index) => (
            <tr key={`${page}-${index}`}>
              <td className="px-4 py-3 text-slate-400">
                {(page - 1) * LIMIT + index + 1}
              </td>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 font-semibold text-slate-700"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length ? (
            <tr>
              <td
                colSpan={headers.length + 1}
                className="px-4 py-10 text-center text-sm font-semibold text-slate-400"
              >
                {empty}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <TablePagination
        page={page}
        totalPages={totalPages}
        total={rows.length}
        onPage={setPage}
      />
    </div>
  );
};

export default RevenuePage;
