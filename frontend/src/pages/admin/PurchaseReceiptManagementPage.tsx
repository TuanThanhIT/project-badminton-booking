import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  RefreshCcw,
  Search,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import adminInventoryService from "../../services/admin/inventoryService";
import type {
  PurchaseReceipt,
  PurchaseReceiptStatus,
  Supplier,
} from "../../types/inventory";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import TablePagination from "../../components/ui/TablePagination";

const LIMIT = 10;
type ReceiptStatusFilter = "ALL" | PurchaseReceiptStatus;

const statusOptions: { value: ReceiptStatusFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const badgeClass: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusLabel: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}) => (
  <div className={`rounded-xl border p-4 ${color}`}>
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold opacity-75">{label}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const PurchaseReceiptManagementPage = () => {
  const [receipts, setReceipts] = useState<PurchaseReceipt[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ReceiptStatusFilter>("ALL");
  const [supplierId, setSupplierId] = useState("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminInventoryService.purchaseReceiptService.list({
        page,
        limit: LIMIT,
        search: appliedSearch || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        supplierId: supplierId === "ALL" ? undefined : supplierId,
      });
      setReceipts(res.data.data.purchaseReceipts || []);
      setTotal(res.data.data.pagination?.total || 0);
    } catch {
      setReceipts([]);
      setTotal(0);
      toast.error("Không thể tải phiếu nhập");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, page, statusFilter, supplierId]);

  useEffect(() => {
    adminInventoryService.supplierService
      .list({ page: 1, limit: 100 })
      .then((res) => setSuppliers(res.data.data.suppliers || []))
      .catch(() => setSuppliers([]));
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);
  const pendingCount = receipts.filter(
    (receipt) => receipt.status === "PENDING",
  ).length;
  const approvedCount = receipts.filter(
    (receipt) => receipt.status === "APPROVED",
  ).length;
  const closedCount = receipts.filter((receipt) =>
    ["REJECTED", "CANCELLED"].includes(receipt.status),
  ).length;

  const handleApprove = async (receipt: PurchaseReceipt) => {
    setLoading(true);
    try {
      await adminInventoryService.purchaseReceiptService.approve(receipt.id);
      toast.success("Đã duyệt phiếu nhập và cộng kho");
      fetchReceipts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Duyệt phiếu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (receipt: PurchaseReceipt) => {
    const reason = window.prompt("Lý do từ chối phiếu nhập", "");
    setLoading(true);
    try {
      await adminInventoryService.purchaseReceiptService.reject(
        receipt.id,
        reason || undefined,
      );
      toast.success("Đã từ chối phiếu nhập");
      fetchReceipts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Từ chối phiếu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        <AdminPageHeader
          title="Phiếu nhập hàng"
          subtitle="Duyệt phiếu nhập để hệ thống tự động cộng tồn kho và ghi lịch sử."
          action={
            <button
              type="button"
              onClick={fetchReceipts}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <RefreshCcw className="h-4 w-4" />
              Làm mới
            </button>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng phiếu nhập"
            value={total}
            icon={ClipboardCheck}
            color="bg-sky-50 border-sky-200 text-sky-700"
          />
          <StatCard
            label="Chờ duyệt"
            value={pendingCount}
            icon={Clock3}
            color="bg-amber-50 border-amber-200 text-amber-700"
          />
          <StatCard
            label="Đã duyệt"
            value={approvedCount}
            icon={CheckCircle2}
            color="bg-emerald-50 border-emerald-200 text-emerald-700"
          />
          <StatCard
            label="Đã đóng"
            value={closedCount}
            icon={XCircle}
            color="bg-rose-50 border-rose-200 text-rose-700"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_260px]">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Nhập mã phiếu nhập..."
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as ReceiptStatusFilter);
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Nhà cung cấp
            </label>
            <select
              value={supplierId}
              onChange={(event) => {
                setSupplierId(event.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="ALL">Tất cả nhà cung cấp</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.supplierName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200">
          {loading ? (
            <div className="flex justify-center py-14">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 text-center font-semibold">#</th>
                  <th className="px-4 py-3 text-left">Mã phiếu</th>
                  <th className="px-4 py-3 text-left">Chi nhánh</th>
                  <th className="px-4 py-3 text-left">Nhà cung cấp</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipts.map((receipt, index) => (
                  <tr key={receipt.id} className="transition hover:bg-sky-50/40">
                    <td className="px-4 py-3 text-center text-slate-400">
                      {(page - 1) * LIMIT + index + 1}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800">
                      {receipt.receiptCode}
                      <p className="mt-1 text-xs font-normal text-gray-400">
                        {new Date(receipt.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </td>
                    <td className="px-4 py-3">{receipt.branch?.branchName}</td>
                    <td className="px-4 py-3">
                      {receipt.supplier?.supplierName}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {formatCurrency(receipt.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badgeClass[receipt.status]}`}
                      >
                        {statusLabel[receipt.status] || receipt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {receipt.status === "PENDING" ? (
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleApprove(receipt)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Duyệt
                          </button>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleReject(receipt)}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!receipts.length ? (
                  <EmptyTableRow colSpan={7} label="Không có phiếu nhập" />
                ) : null}
              </tbody>
            </table>
          )}
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPage={setPage}
          />
        </div>
      </div>
    </div>
  );
};

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

export default PurchaseReceiptManagementPage;
