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
    instance.get<ListResponse<"suppliers", Supplier>>("/manager/suppliers", {
      params,
    }),
};

const purchaseReceiptService = {
  list: (params?: any) =>
    instance.get<ListResponse<"purchaseReceipts", PurchaseReceipt>>(
      "/manager/purchase-receipts",
      { params },
    ),
  create: (data: any) =>
    instance.post<PurchaseReceiptResponse>("/manager/purchase-receipts", data),
  detail: (id: number) =>
    instance.get<PurchaseReceiptResponse>(`/manager/purchase-receipts/${id}`),
  cancel: (id: number) =>
    instance.patch<PurchaseReceiptResponse>(
      `/manager/purchase-receipts/${id}/cancel`,
    ),
};

const stockService = {
  variantStocks: (params?: any) =>
    instance.get<ListResponse<"variantStocks", VariantStock>>(
      "/manager/variant-stocks",
      { params },
    ),
  beverageStocks: (params?: any) =>
    instance.get<ListResponse<"beverageStocks", BeverageStock>>(
      "/manager/beverage-stocks",
      { params },
    ),
  transactions: (params?: any) =>
    instance.get<ListResponse<"stockTransactions", StockTransaction>>(
      "/manager/stock-transactions",
      { params },
    ),
};

export default {
  supplierService,
  purchaseReceiptService,
  stockService,
};
