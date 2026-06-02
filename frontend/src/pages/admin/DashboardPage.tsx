import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ClipboardCheck,
  Clock3,
  DollarSign,
  PackageX,
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
import adminRevenueService from "../../services/admin/revenueService";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";

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

const timeText = (value?: string) =>
  value ? new Date(value).toLocaleString("vi-VN") : "-";

const Empty = ({ label }: { label: string }) => (
  <div className="py-10 text-center text-sm font-semibold text-slate-400">
    {label}
  </div>
);

const AdminDashboardPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminRevenueService
      .getDashboardService({ range: "today" })
      .then((res) => setData((res.data as any).data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

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

  const summary = data?.summary || {};
  const structure = data?.revenueStructure || {};
  const chart = data?.quickRevenueChart || [];
  const operation = data?.operationSummary || {};
  const cards = [
    {
      label: "Doanh thu hôm nay",
      value: fmtCurrency(summary.todayRevenue),
      hint: "Tổng đặt sân và bán hàng",
      icon: DollarSign,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "Doanh thu đặt sân",
      value: fmtCurrency(summary.todayBookingRevenue),
      hint: `${summary.todayBookingCount || 0} lượt hôm nay`,
      icon: Trophy,
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Doanh thu bán hàng",
      value: fmtCurrency(summary.todaySalesRevenue),
      hint: `${summary.todayOrderCount || 0} đơn hôm nay`,
      icon: ShoppingBag,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Chờ xử lý",
      value: `${(summary.pendingBookingCount || 0) + (summary.pendingOrderCount || 0)}`,
      hint: `${summary.pendingBookingCount || 0} booking, ${summary.pendingOrderCount || 0} đơn`,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Phiếu nhập chờ duyệt",
      value: `${summary.pendingPurchaseReceiptCount || 0}`,
      hint: "Admin cần kiểm tra",
      icon: ClipboardCheck,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Sắp hết hàng",
      value: `${summary.lowStockCount || 0}`,
      hint: "Theo ngưỡng cảnh báo",
      icon: AlertTriangle,
      tone: "bg-orange-50 text-orange-700",
    },
    {
      label: "Hết hàng",
      value: `${summary.outOfStockCount || 0}`,
      hint: "Cần nhập bổ sung",
      icon: PackageX,
      tone: "bg-rose-50 text-rose-700",
    },
    {
      label: "Sân đang sử dụng",
      value: `${summary.playingCourtCount || 0}`,
      hint: "Tại thời điểm hiện tại",
      icon: Trophy,
      tone: "bg-cyan-50 text-cyan-700",
    },
  ];

  const pie = [
    { name: "Đặt sân", value: structure.bookingRevenue || 0, fill: "#6366f1" },
    { name: "Sản phẩm", value: structure.productRevenue || 0, fill: "#10b981" },
    { name: "Đồ uống", value: structure.beverageRevenue || 0, fill: "#f59e0b" },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard Admin"
        subtitle="Tổng quan nhanh hôm nay: doanh thu, vận hành, phiếu nhập và tồn kho."
      />
      <div className="hidden">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tổng quan nhanh hôm nay: doanh thu, vận hành, phiếu nhập và tồn kho.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <section
              key={card.label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {card.hint}
                  </p>
                </div>
                <div className={`rounded-lg p-3 ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Doanh thu nhanh
          </h2>
          <p className="text-sm text-slate-500">Theo khoảng dashboard đã chọn.</p>
          <div className="mt-4 h-80">
            {chart.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => compactCurrency(Number(value))} />
                  <Tooltip formatter={(value: number) => fmtCurrency(Number(value))} />
                  <Bar dataKey="bookingRevenue" name="Đặt sân" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="productRevenue" name="Sản phẩm" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="beverageRevenue" name="Đồ uống" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty label="Không có dữ liệu doanh thu" />
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Cơ cấu doanh thu
          </h2>
          <p className="text-sm text-slate-500">Đặt sân, sản phẩm và đồ uống.</p>
          <div className="mt-4 h-80">
            {pie.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" innerRadius={64} outerRadius={102}>
                    {pie.map((item) => (
                      <Cell key={item.name} fill={item.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => fmtCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty label="Không có cơ cấu doanh thu" />
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
              subtitle={`${item.customerName || "-"} • ${item.branchName || "-"}`}
              right={fmtCurrency(item.amount)}
              foot={timeText(item.createdAt)}
            />
          ))}
        </ListPanel>
        <ListPanel title="Phiếu nhập chờ duyệt" empty="Không có phiếu nhập chờ duyệt">
          {(data?.pendingPurchaseReceipts || []).map((item: any) => (
            <ListItem
              key={item.id}
              title={item.receiptCode}
              subtitle={`${item.branchName || "-"} • ${item.supplierName || "-"}`}
              right={fmtCurrency(item.totalAmount)}
              foot={timeText(item.createdAt)}
            />
          ))}
        </ListPanel>
        <ListPanel title="Cảnh báo tồn kho" empty="Không có mặt hàng cảnh báo">
          {(data?.lowStockItems || []).map((item: any) => (
            <ListItem
              key={`${item.itemType}-${item.branchId}-${item.itemId}`}
              title={item.itemName}
              subtitle={`${item.branchName || "-"} • ${item.itemType}`}
              right={`${item.stock}/${item.threshold}`}
              foot={item.status === "OUT_OF_STOCK" ? "Hết hàng" : "Sắp hết"}
            />
          ))}
        </ListPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ListPanel title="Top sản phẩm" empty="Không có sản phẩm bán chạy">
          {(data?.topProducts || []).map((item: any) => (
            <ListItem
              key={item.variantId}
              title={item.productName}
              subtitle={`${item.variant || "-"} • ${item.quantitySold} bán`}
              right={fmtCurrency(item.revenue)}
            />
          ))}
        </ListPanel>
        <ListPanel title="Top đồ uống" empty="Không có đồ uống bán chạy">
          {(data?.topBeverages || []).map((item: any) => (
            <ListItem
              key={item.beverageId}
              title={item.beverageName}
              subtitle={`${item.quantitySold} sản phẩm`}
              right={fmtCurrency(item.revenue)}
            />
          ))}
        </ListPanel>
        <ListPanel title="Top chi nhánh" empty="Không có dữ liệu chi nhánh">
          {(data?.topBranches || []).map((item: any) => (
            <ListItem
              key={item.branchId}
              title={item.branchName}
              subtitle={`${item.contributionRate || 0}% đóng góp`}
              right={fmtCurrency(item.totalRevenue)}
            />
          ))}
        </ListPanel>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Vận hành hôm nay</h2>
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
              <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{Number(value || 0)}</p>
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
  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    <div className="mt-4 space-y-3">
      {children.length ? children : <Empty label={empty} />}
    </div>
  </section>
);

const ListItem = ({
  title,
  subtitle,
  right,
  foot,
}: {
  title: string;
  subtitle?: string;
  right?: string;
  foot?: string;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-slate-900">{title}</p>
      {subtitle ? <p className="truncate text-xs text-slate-500">{subtitle}</p> : null}
      {foot ? <p className="mt-1 text-xs text-slate-400">{foot}</p> : null}
    </div>
    {right ? (
      <p className="shrink-0 text-right text-sm font-black text-sky-700">{right}</p>
    ) : null}
  </div>
);

export default AdminDashboardPage;
