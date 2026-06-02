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
import { Calculator, Download, RefreshCw, TrendingUp } from "lucide-react";
import adminRevenueService from "../../services/admin/revenueService";
import adminBranchService from "../../services/admin/branchService";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
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

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - (days - 1));
  return date.toISOString().slice(0, 10);
};

const RevenueManagementPage = () => {
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate] = useState(today());
  const [branchId, setBranchId] = useState("");
  const [revenueType, setRevenueType] = useState("ALL");
  const [itemType, setItemType] = useState("ALL");
  const [branches, setBranches] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await adminRevenueService.getRevenueReportService({
        startDate,
        endDate,
        branchId: branchId || undefined,
        revenueType,
        itemType,
      });
      setReport((res.data as any).data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adminBranchService
      .getAdminBranchesService({ limit: 200 })
      .then((res: any) => setBranches((res.data as any).data?.branches || []))
      .catch(() => setBranches([]));
  }, []);

  useEffect(() => {
    fetchReport();
  }, []);

  const summary = report?.summary || {};
  const chart = report?.revenueChart || [];
  const revenueByBranch = report?.revenueByBranch || [];
  const productItems = report?.productRevenueItems || [];
  const beverageItems = report?.beverageRevenueItems || [];
  const profit = report?.profitSummary || {};

  const cards = [
    ["Tổng doanh thu", summary.totalRevenue, "Đặt sân + bán hàng"],
    ["Doanh thu đặt sân", summary.bookingRevenue, `${summary.bookingCount || 0} lượt`],
    ["Doanh thu sản phẩm", summary.productRevenue, `${summary.productQuantitySold || 0} sản phẩm`],
    ["Doanh thu đồ uống", summary.beverageRevenue, `${summary.beverageQuantitySold || 0} đồ uống`],
    ["Doanh thu bán hàng", summary.salesRevenue, `${summary.orderCount || 0} đơn`],
    ["Giá vốn hàng bán", summary.salesCost, "Từ giá nhập trung bình"],
    ["Lợi nhuận gộp", summary.grossProfit, `${summary.grossMargin || 0}% biên gộp`],
    ["Tổng đơn hàng", summary.orderCount, "Online và tại quầy"],
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Báo cáo Doanh thu Admin"
        subtitle="Xem doanh thu, giá vốn, lợi nhuận gộp, chi nhánh và mặt hàng toàn hệ thống."
        action={
          <button
            type="button"
            onClick={fetchReport}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:bg-slate-300"
          >
            {loading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Cập nhật
          </button>
        }
      />
      <div className="hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Báo cáo doanh thu Admin
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem doanh thu, giá vốn, lợi nhuận gộp, branch và mặt hàng toàn hệ thống.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchReport}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-bold text-white disabled:bg-slate-300"
        >
          {loading ? (
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Cập nhật
        </button>
      </div>

      <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-6">
        <label className="space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Từ ngày</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Đến ngày</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Branch</span>
          <select
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          >
            <option value="">Tất cả</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branchName}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Loại doanh thu</span>
          <select
            value={revenueType}
            onChange={(event) => setRevenueType(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          >
            <option value="ALL">Tất cả</option>
            <option value="BOOKING">Đặt sân</option>
            <option value="PRODUCT">Sản phẩm</option>
            <option value="BEVERAGE">Đồ uống</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">Loại hàng</span>
          <select
            value={itemType}
            onChange={(event) => setItemType(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          >
            <option value="ALL">Tất cả</option>
            <option value="PRODUCT_VARIANT">Sản phẩm</option>
            <option value="BEVERAGE">Đồ uống</option>
          </select>
        </label>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-600"
        >
          <Download className="h-4 w-4" />
          Xuất
        </button>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, hint]) => (
          <section
            key={label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {typeof value === "number" ? fmtCurrency(value) : value || 0}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{hint}</p>
          </section>
        ))}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Doanh thu theo thời gian
            </h2>
            <p className="text-sm text-slate-500">
              Tách tổng doanh thu, đặt sân, sản phẩm và đồ uống.
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-sky-600" />
        </div>
        <div className="h-96">
          {chart.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => compactCurrency(Number(value))} />
                <Tooltip formatter={(value: number) => fmtCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="bookingRevenue" name="Đặt sân" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="productRevenue" name="Sản phẩm" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="beverageRevenue" name="Đồ uống" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyTable label="Không có dữ liệu doanh thu" />
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Doanh thu theo branch</h2>
        <ReportTable
          headers={[
            "Branch",
            "Đặt sân",
            "Sản phẩm",
            "Đồ uống",
            "Tổng",
            "Booking",
            "Đóng góp",
          ]}
          empty="Không có dữ liệu branch"
          rows={revenueByBranch.map((item: any) => [
            item.branchName,
            fmtCurrency(item.bookingRevenue),
            fmtCurrency(item.productRevenue),
            fmtCurrency(item.beverageRevenue),
            fmtCurrency(item.totalRevenue),
            item.bookingCount,
            `${item.contributionRate || 0}%`,
          ])}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Sản phẩm cầu lông
          </h2>
          <ReportTable
            headers={["Tên", "Variant", "SKU", "SL", "Doanh thu", "Giá vốn", "Lãi gộp"]}
            empty="Không có dữ liệu sản phẩm"
            rows={productItems.map((item: any) => [
              item.productName,
              item.variant || "-",
              item.sku || "-",
              item.quantitySold,
              fmtCurrency(item.revenue),
              fmtCurrency(item.cost),
              fmtCurrency(item.grossProfit),
            ])}
          />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Đồ uống</h2>
          <ReportTable
            headers={["Tên", "SL", "Doanh thu", "Giá vốn", "Lãi gộp"]}
            empty="Không có dữ liệu đồ uống"
            rows={beverageItems.map((item: any) => [
              item.beverageName,
              item.quantitySold,
              fmtCurrency(item.revenue),
              fmtCurrency(item.cost),
              fmtCurrency(item.grossProfit),
            ])}
          />
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Báo cáo lợi nhuận gộp
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Bán hàng", summary.salesRevenue],
            ["Giá vốn", summary.salesCost],
            ["Lợi nhuận gộp", summary.grossProfit],
            ["Lãi sản phẩm", profit.productSales?.grossProfit],
            ["Lãi đồ uống", profit.beverageSales?.grossProfit],
            ["Biên gộp", `${summary.grossMargin || 0}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
              <p className="mt-2 text-xl font-black text-slate-900">
                {typeof value === "number" ? fmtCurrency(value) : value || "0%"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const EmptyTable = ({ label }: { label: string }) => (
  <div className="py-10 text-center text-sm font-semibold text-slate-400">
    {label}
  </div>
);

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
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {paginatedRows.map((row, index) => (
            <tr key={`${page}-${index}`}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 font-semibold text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length ? (
            <tr>
              <td colSpan={headers.length}>
                <EmptyTable label={empty} />
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <TablePagination page={page} totalPages={totalPages} total={rows.length} onPage={setPage} />
    </div>
  );
};

export default RevenueManagementPage;
