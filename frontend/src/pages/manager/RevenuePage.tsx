import { useEffect, useState } from "react";
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
import { CalendarDays, Coffee, Package, RefreshCw, Trophy } from "lucide-react";
import managerRevenueService from "../../services/manager/revenueService";
import {
  ManagerEmptyState,
  ManagerPageHeader,
  managerCardClass,
  managerInputClass,
} from "../../components/commons/manager/ManagerPage";
import TablePagination from "../../components/ui/TablePagination";

const LIMIT = 10;

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
  }, []);

  const summary = report?.summary || {};
  const chart = report?.revenueChart || [];
  const revenueByType = report?.revenueByType || [];
  const productItems = report?.productRevenueItems || [];
  const beverageItems = report?.beverageRevenueItems || [];
  const recentOrders = report?.recentRevenueOrders || [];

  const cards = [
    {
      label: "Tổng doanh thu branch",
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
          { label: "Bán hàng", value: fmtCurrency(summary.salesRevenue) },
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
          onClick={fetchReport}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl bg-sky-600 px-3 text-sm font-bold text-white disabled:bg-slate-300"
        >
          <RefreshCw className="h-4 w-4" />
          Cập nhật
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

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={`${managerCardClass} p-5`}>
          <h2 className="text-lg font-bold text-slate-900">
            Top sản phẩm tại chi nhánh
          </h2>
          <ReportTable
            headers={["Tên", "Variant", "SKU", "SL", "Doanh thu"]}
            empty="Không có sản phẩm bán chạy"
            rows={productItems.map((item: any) => [
              item.productName,
              item.variant || "-",
              item.sku || "-",
              item.quantitySold,
              fmtCurrency(item.revenue),
            ])}
          />
        </section>
        <section className={`${managerCardClass} p-5`}>
          <h2 className="text-lg font-bold text-slate-900">
            Top đồ uống tại chi nhánh
          </h2>
          <ReportTable
            headers={["Tên", "SL", "Doanh thu"]}
            empty="Không có đồ uống bán chạy"
            rows={beverageItems.map((item: any) => [
              item.beverageName,
              item.quantitySold,
              fmtCurrency(item.revenue),
            ])}
          />
        </section>
      </div>

      <section className={`${managerCardClass} p-5`}>
        <h2 className="text-lg font-bold text-slate-900">
          Đơn hàng tạo doanh thu
        </h2>
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
            item.status,
            item.createdAt
              ? new Date(item.createdAt).toLocaleString("vi-VN")
              : "-",
          ])}
        />
      </section>
    </div>
  );
};

const ReportTable = ({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: Array<Array<string | number>>;
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
      <TablePagination page={page} totalPages={totalPages} total={rows.length} onPage={setPage} />
    </div>
  );
};

export default RevenuePage;
