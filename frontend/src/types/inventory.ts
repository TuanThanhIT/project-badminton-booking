import type { ApiResponse } from "./api";

export type StockItemType = "PRODUCT_VARIANT" | "BEVERAGE";
export type PurchaseReceiptStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";
export type SupplierStatus = "ACTIVE" | "INACTIVE";

export type Pagination = {
  page: number;
  limit: number;
  total: number;
};

export type Supplier = {
  id: number;
  supplierName: string;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  status?: SupplierStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type PurchaseReceiptDetail = {
  id?: number;
  itemType: StockItemType;
  variantId?: number | null;
  beverageId?: number | null;
  itemName?: string;
  quantity: number;
  importPrice: number;
  totalPrice?: number;
};

export type PurchaseReceipt = {
  id: number;
  receiptCode: string;
  branchId: number;
  supplierId: number;
  supplier?: Supplier | null;
  branch?: { id: number; branchName: string } | null;
  status: PurchaseReceiptStatus;
  totalAmount: number;
  note?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  details?: PurchaseReceiptDetail[];
};

export type StockTransaction = {
  id: number;
  branchId: number;
  itemType: StockItemType;
  variantId?: number | null;
  beverageId?: number | null;
  type: "IMPORT" | "SALE" | "CANCEL_ORDER" | "RETURN" | "ADJUSTMENT";
  quantity: number;
  beforeStock: number;
  afterStock: number;
  referenceType?: string | null;
  referenceId?: number | null;
  note?: string | null;
  createdAt: string;
  branch?: { id: number; branchName: string } | null;
  variant?: any;
  beverage?: any;
  creator?: { id: number; username: string; email?: string } | null;
};

export type VariantStock = {
  id: number;
  variantId: number;
  branchId: number;
  stock: number;
  variant?: any;
  branch?: { id: number; branchName: string } | null;
};

export type BeverageStock = {
  id: number;
  beverageId: number;
  branchId: number;
  stock: number;
  beverage?: any;
  branch?: { id: number; branchName: string } | null;
};

export type ListResponse<TName extends string, TItem> = ApiResponse<
  Record<TName, TItem[]> & { pagination: Pagination }
>;

export type PurchaseReceiptResponse = ApiResponse<PurchaseReceipt>;
