import { useEffect, useState } from "react";
import { CheckCircle2, RefreshCcw, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import adminInventoryService from "../../services/admin/inventoryService";
import type { PurchaseReceipt } from "../../types/inventory";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";
import TablePagination from "../../components/ui/TablePagination";

const LIMIT = 10;

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

const PurchaseReceiptManagementPage = () => {
  const [receipts, setReceipts] = useState<PurchaseReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await adminInventoryService.purchaseReceiptService.list({
        page,
        limit: LIMIT,
      });
      setReceipts(res.data.data.purchaseReceipts || []);
      setTotal(res.data.data.pagination?.total || 0);
    } catch {
      setReceipts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [page]);

  const totalPages = Math.ceil(total / LIMIT);

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
        <div className="hidden">
          <div>
            <h1 className="text-2xl font-bold text-sky-700">
              Phiếu nhập hàng
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Duyệt phiếu nhập để hệ thống tự động cộng tồn kho và ghi lịch sử.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchReceipts}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-bold text-gray-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Mã phiếu</th>
                <th className="px-4 py-3 text-left">Chi nhánh</th>
                <th className="px-4 py-3 text-left">Nhà cung cấp</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {receipts.map((receipt) => (
                <tr key={receipt.id}>
                  <td className="px-4 py-3 font-bold text-gray-800">
                    {receipt.receiptCode}
                    <p className="mt-1 text-xs font-normal text-gray-400">
                      {new Date(receipt.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </td>
                  <td className="px-4 py-3">{receipt.branch?.branchName}</td>
                  <td className="px-4 py-3">{receipt.supplier?.supplierName}</td>
                  <td className="px-4 py-3 text-right font-bold">
                    {formatCurrency(receipt.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badgeClass[receipt.status]}`}
                    >
                      {receipt.status}
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
                <EmptyTableRow colSpan={6} label="Không có phiếu nhập" />
              ) : null}
            </tbody>
          </table>
          <TablePagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
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
