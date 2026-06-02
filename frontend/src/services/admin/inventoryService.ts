import instance from "../../utils/axiosCustomize";
import type {
  BeverageStock,
  ListResponse,
  PurchaseReceipt,
  PurchaseReceiptResponse,
  StockTransaction,
  Supplier,
  VariantStock,
} from "../../types/inventory";

const supplierService = {
  list: (params?: any) =>
    instance.get<ListResponse<"suppliers", Supplier>>("/admin/suppliers", {
      params,
    }),
  create: (data: Partial<Supplier>) => instance.post("/admin/suppliers", data),
  update: (id: number, data: Partial<Supplier>) =>
    instance.put(`/admin/suppliers/${id}`, data),
  updateStatus: (id: number, status: string) =>
    instance.patch(`/admin/suppliers/${id}/status`, { status }),
  remove: (id: number) => instance.delete(`/admin/suppliers/${id}`),
};

const purchaseReceiptService = {
  list: (params?: any) =>
    instance.get<ListResponse<"purchaseReceipts", PurchaseReceipt>>(
      "/admin/purchase-receipts",
      { params },
    ),
  detail: (id: number) =>
    instance.get<PurchaseReceiptResponse>(`/admin/purchase-receipts/${id}`),
  approve: (id: number) =>
    instance.patch<PurchaseReceiptResponse>(
      `/admin/purchase-receipts/${id}/approve`,
    ),
  reject: (id: number, reason?: string) =>
    instance.patch<PurchaseReceiptResponse>(
      `/admin/purchase-receipts/${id}/reject`,
      { reason },
    ),
};

const stockService = {
  variantStocks: (params?: any) =>
    instance.get<ListResponse<"variantStocks", VariantStock>>(
      "/admin/variant-stocks",
      { params },
    ),
  beverageStocks: (params?: any) =>
    instance.get<ListResponse<"beverageStocks", BeverageStock>>(
      "/admin/beverage-stocks",
      { params },
    ),
  transactions: (params?: any) =>
    instance.get<ListResponse<"stockTransactions", StockTransaction>>(
      "/admin/stock-transactions",
      { params },
    ),
};

export default {
  supplierService,
  purchaseReceiptService,
  stockService,
};
