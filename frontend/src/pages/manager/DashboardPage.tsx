import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ClipboardCheck,
  Coffee,
  History,
  PackagePlus,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import {
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
import managerRevenueService from "../../services/manager/revenueService";
import {
  ManagerEmptyState,
  ManagerPageHeader,
  managerCardClass,
} from "../../components/commons/manager/ManagerPage";
import TablePagination from "../../components/ui/TablePagination";

const LIMIT = 10;

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

const DashboardPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stockPage, setStockPage] = useState(1);

  useEffect(() => {
    managerRevenueService
      .getDashboardService({ range: "today" })
      .then((res) => setData((res.data as any).data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary || {};
  const chart = data?.quickRevenueChart || [];
  const structure = data?.revenueStructure || {};
  const operation = data?.operationSummary || {};
  const recentStockTransactions = data?.recentStockTransactions || [];
  const paginatedStockTransactions = recentStockTransactions.slice(
    (stockPage - 1) * LIMIT,
    stockPage * LIMIT,
  );
  const stockTotalPages = Math.ceil(recentStockTransactions.length / LIMIT);

  const cards = [
    {
      label: "Doanh thu hôm nay",
      value: fmtCurrency(summary.todayRevenue),
      hint: "Trong branch đang quản lý",
      icon: Trophy,
    },
    {
      label: "Doanh thu đặt sân",
      value: fmtCurrency(summary.todayBookingRevenue),
      hint: `${summary.todayBookingCount || 0} lượt đặt`,
      icon: Trophy,
    },
    {
      label: "Doanh thu bán hàng",
      value: fmtCurrency(summary.todaySalesRevenue),
      hint: `${summary.todayOrderCount || 0} đơn hàng`,
      icon: ShoppingBag,
    },
    {
      label: "Sân đang sử dụng",
      value: `${summary.playingCourtCount || 0}`,
      hint: "Booking đang chơi",
      icon: Trophy,
    },
    {
      label: "Booking chờ xác nhận",
      value: `${summary.pendingBookingCount || 0}`,
      hint: "Cần theo dõi",
      icon: ClipboardCheck,
    },
    {
      label: "Đơn chờ xử lý",
      value: `${summary.pendingOrderCount || 0}`,
      hint: "Đơn online tại branch",
      icon: ShoppingBag,
    },
    {
      label: "Mặt hàng sắp hết",
      value: `${summary.lowStockCount || 0}`,
      hint: "Theo tồn branch",
      icon: AlertTriangle,
    },
    {
      label: "Phiếu nhập chờ duyệt",
      value: `${summary.pendingPurchaseReceiptCount || 0}`,
      hint: "Đang chờ admin duyệt",
      icon: PackagePlus,
    },
  ];

  const pie = [
    { name: "Đặt sân", value: structure.bookingRevenue || 0, fill: "#0ea5e9" },
    { name: "Sản phẩm", value: structure.productRevenue || 0, fill: "#22c55e" },
    { name: "Đồ uống", value: structure.beverageRevenue || 0, fill: "#f59e0b" },
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-lg bg-slate-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ManagerPageHeader
        eyebrow="Manager dashboard"
        title="Tổng quan vận hành"
        description="Xem nhanh doanh thu hôm nay, vận hành sân, tồn kho và phiếu nhập của branch đang quản lý."
        metrics={[
          {
            label: "Doanh thu hôm nay",
            value: fmtCurrency(summary.todayRevenue),
          },
          {
            label: "Cần xử lý",
            value: `${(summary.pendingBookingCount || 0) + (summary.pendingOrderCount || 0)}`,
          },
        ]}
      />

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

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className={`${managerCardClass} p-5`}>
          <h2 className="text-lg font-bold text-slate-900">
            Doanh thu nhanh của branch
          </h2>
          <p className="text-sm text-slate-500">
            Theo khoảng dashboard đã chọn.
          </p>
          <div className="mt-4 h-80">
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
                description="Doanh thu branch sẽ hiển thị khi có giao dịch."
              />
            )}
          </div>
        </section>

        <section className={`${managerCardClass} p-5`}>
          <h2 className="text-lg font-bold text-slate-900">
            Cơ cấu doanh thu branch
          </h2>
          <div className="mt-4 h-80">
            {pie.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={104}
                  >
                    {pie.map((item) => (
                      <Cell key={item.name} fill={item.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => fmtCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ManagerEmptyState
                icon={Coffee}
                title="Không có cơ cấu doanh thu"
                description="Đặt sân, sản phẩm và đồ uống sẽ được tách riêng ở đây."
              />
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ListPanel title="Đơn hàng gần đây" empty="Không có đơn hàng">
          {(data?.recentOrders || []).map((item: any) => (
            <ListItem
              key={item.id}
              title={item.code || `DH-${item.id}`}
              subtitle={item.customerName || "-"}
              right={fmtCurrency(item.amount)}
            />
          ))}
        </ListPanel>
        <ListPanel title="Tồn kho sắp hết" empty="Không có cảnh báo tồn kho">
          {(data?.lowStockItems || []).map((item: any) => (
            <ListItem
              key={`${item.itemType}-${item.itemId}`}
              title={item.itemName}
              subtitle={item.itemType}
              right={`${item.stock}/${item.threshold}`}
            />
          ))}
        </ListPanel>
        <ListPanel title="Phiếu nhập gần đây" empty="Không có phiếu nhập">
          {(data?.recentPurchaseReceipts || []).map((item: any) => (
            <ListItem
              key={item.id}
              title={item.receiptCode}
              subtitle={`${item.supplierName || "-"} • ${item.status}`}
              right={fmtCurrency(item.totalAmount)}
            />
          ))}
        </ListPanel>
      </div>

      <section className={`${managerCardClass} p-5`}>
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-sky-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Hoạt động kho gần đây
          </h2>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                {[
                  "#",
                  "Thời gian",
                  "Mặt hàng",
                  "Loại",
                  "Thay đổi",
                  "Sau tồn",
                  "Ghi chú",
                ].map((header) => (
                  <th key={header} className="px-4 py-3 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 [&_td]:align-top">
              {paginatedStockTransactions.map((item: any, index: number) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-slate-400">
                    {(stockPage - 1) * LIMIT + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString("vi-VN")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800">
                    {item.itemName}
                  </td>
                  <td className="px-4 py-3">{item.type}</td>
                  <td className="px-4 py-3 font-bold">{item.quantity}</td>
                  <td className="px-4 py-3">{item.afterStock}</td>
                  <td className="px-4 py-3">{item.note || "-"}</td>
                </tr>
              ))}
              {!recentStockTransactions.length ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm font-semibold text-slate-400"
                  >
                    Không có hoạt động kho
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <TablePagination
            page={stockPage}
            totalPages={stockTotalPages}
            total={recentStockTransactions.length}
            onPage={setStockPage}
          />
        </div>
      </section>

      <section className={`${managerCardClass} p-5`}>
        <h2 className="text-lg font-bold text-slate-900">
          Vận hành sân hôm nay
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            ["Tổng booking", operation.todayBookingCount],
            ["Chờ xác nhận", operation.pendingBookingCount],
            ["Đã xác nhận", operation.confirmedBookingCount],
            ["Đang chơi", operation.playingBookingCount],
            ["Hoàn thành", operation.completedBookingCount],
            ["Đã hủy", operation.cancelledBookingCount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {Number(value || 0)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const ListPanel = ({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: ReactNode[];
}) => (
  <section className={`${managerCardClass} p-5`}>
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    <div className="mt-4 space-y-3">
      {children.length ? (
        children
      ) : (
        <div className="py-10 text-center text-sm font-semibold text-slate-400">
          {empty}
        </div>
      )}
    </div>
  </section>
);

const ListItem = ({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: string;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-slate-900">{title}</p>
      {subtitle ? (
        <p className="truncate text-xs text-slate-500">{subtitle}</p>
      ) : null}
    </div>
    {right ? (
      <p className="shrink-0 text-sm font-bold text-sky-700">{right}</p>
    ) : null}
  </div>
);

export default DashboardPage;
