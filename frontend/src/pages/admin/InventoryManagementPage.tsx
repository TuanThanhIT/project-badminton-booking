import { useEffect, useState } from "react";
import { Boxes, Coffee, History, RefreshCcw } from "lucide-react";
import adminInventoryService from "../../services/admin/inventoryService";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import TablePagination from "../../components/ui/TablePagination";
import type {
  BeverageStock,
  StockTransaction,
  VariantStock,
} from "../../types/inventory";

const LIMIT = 10;

const InventoryManagementPage = () => {
  const [tab, setTab] = useState<"variant" | "beverage" | "history">("variant");
  const [variantStocks, setVariantStocks] = useState<VariantStock[]>([]);
  const [beverageStocks, setBeverageStocks] = useState<BeverageStock[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    try {
      if (tab === "variant") {
        const res = await adminInventoryService.stockService.variantStocks({
          page,
          limit: LIMIT,
        });
        setVariantStocks(res.data.data.variantStocks || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
      if (tab === "beverage") {
        const res = await adminInventoryService.stockService.beverageStocks({
          page,
          limit: LIMIT,
        });
        setBeverageStocks(res.data.data.beverageStocks || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
      if (tab === "history") {
        const res = await adminInventoryService.stockService.transactions({
          page,
          limit: LIMIT,
        });
        setTransactions(res.data.data.stockTransactions || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
    } catch {
      setVariantStocks([]);
      setBeverageStocks([]);
      setTransactions([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab, page]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        <AdminPageHeader
          title="Tồn kho & Lịch sử kho"
          subtitle="Xem tồn kho tất cả chi nhánh và lịch sử nhập xuất."
          action={
            <button
              type="button"
              onClick={fetchData}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <RefreshCcw className="h-4 w-4" />
              Làm mới
            </button>
          }
        />
        <div className="hidden">
          <div>
            <h1 className="text-2xl font-bold text-sky-700">
              Tồn kho & lịch sử kho
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Xem tồn kho tất cả chi nhánh và lịch sử nhập xuất.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-bold text-gray-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
          {[
            { key: "variant", label: "Sản phẩm", icon: Boxes },
            { key: "beverage", label: "Đồ uống", icon: Coffee },
            { key: "history", label: "Lịch sử", icon: History },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
              onClick={() => {
                setTab(item.key as any);
                setPage(1);
              }}
                className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold ${
                  tab === item.key ? "bg-sky-600 text-white" : "text-gray-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "variant" ? (
          <StockTable
            rows={variantStocks.map((item) => ({
              id: item.id,
              name: item.variant?.product?.productName || "Sản phẩm",
              branch: item.branch?.branchName || "",
              stock: item.stock,
              extra: item.variant?.sku || "",
            }))}
            page={page}
            total={total}
            onPage={setPage}
          />
        ) : null}
        {tab === "beverage" ? (
          <StockTable
            rows={beverageStocks.map((item) => ({
              id: item.id,
              name: item.beverage?.beverageName || "Đồ uống",
              branch: item.branch?.branchName || "",
              stock: item.stock,
              extra: "",
            }))}
            page={page}
            total={total}
            onPage={setPage}
          />
        ) : null}
        {tab === "history" ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 text-center font-semibold">#</th>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-left">Chi nhánh</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-right">Thay đổi</th>
                  <th className="px-4 py-3 text-right">Sau tồn</th>
                  <th className="px-4 py-3 text-left">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((item, index) => (
                  <tr key={item.id} className="transition hover:bg-sky-50/40">
                    <td className="px-4 py-3 text-center text-slate-400">{(page - 1) * LIMIT + index + 1}</td>
                    <td className="px-4 py-3">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">{item.branch?.branchName}</td>
                    <td className="px-4 py-3 font-bold">{item.type}</td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        item.quantity > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {item.quantity > 0 ? "+" : ""}
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right">{item.afterStock}</td>
                    <td className="px-4 py-3">{item.note}</td>
                  </tr>
                ))}
                {!transactions.length ? (
                  <EmptyTableRow colSpan={7} label="Không có lịch sử kho" />
                ) : null}
              </tbody>
            </table>
            <TablePagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const StockTable = ({
  rows,
  page,
  total,
  onPage,
}: {
  rows: { id: number; name: string; branch: string; stock: number; extra: string }[];
  page: number;
  total: number;
  onPage: (page: number) => void;
}) => (
  <div className="overflow-hidden rounded-xl border border-gray-200">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <th className="px-4 py-3 text-center font-semibold">#</th>
          <th className="px-4 py-3 text-left">Mặt hàng</th>
          <th className="px-4 py-3 text-left">Thông tin</th>
          <th className="px-4 py-3 text-left">Chi nhánh</th>
          <th className="px-4 py-3 text-right">Tồn kho</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row, index) => (
          <tr key={row.id} className="transition hover:bg-sky-50/40">
            <td className="px-4 py-3 text-center text-slate-400">
              {(page - 1) * LIMIT + index + 1}
            </td>
            <td className="px-4 py-3 font-semibold text-slate-800">{row.name}</td>
            <td className="px-4 py-3 text-slate-500">{row.extra || "-"}</td>
            <td className="px-4 py-3 text-slate-600">{row.branch}</td>
            <td className="px-4 py-3 text-right font-semibold text-sky-700">
              {row.stock}
            </td>
          </tr>
        ))}
        {!rows.length ? (
          <EmptyTableRow colSpan={5} label="Không có dữ liệu tồn kho" />
        ) : null}
      </tbody>
    </table>
    <TablePagination page={page} totalPages={Math.ceil(total / LIMIT)} total={total} onPage={onPage} />
  </div>
);

const EmptyTableRow = ({
  colSpan,
  label,
}: {
  colSpan: number;
  label: string;
}) => (
  <tr>
    <td
      colSpan={colSpan}
      className="px-4 py-10 text-center text-sm font-semibold text-gray-400"
    >
      {label}
    </td>
  </tr>
);

export default InventoryManagementPage;
