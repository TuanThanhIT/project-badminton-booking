import type { ApiResponse } from "./api";

export type InventoryReceipt = {
  id: number;
  branchId: number;
  managerId: number;
  productId: number;
  variantId: number;
  quantity: number;
  sellingPrice: number;
  importPrice: number;
  totalAmount: number;
  previousStock: number;
  newStock: number;
  note?: string | null;
  createdDate: string;
  product: {
    id: number;
    productName: string;
    thumbnailUrl?: string | null;
  } | null;
  variant: {
    id: number;
    sku?: string | null;
    color?: string | null;
    size?: string | null;
    material?: string | null;
  } | null;
  manager: {
    id: number;
    username: string;
    fullName?: string | null;
  } | null;
};

export type InventoryReceiptQueries = {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
};

export type InventoryReceiptListData = {
  branchId: number;
  items: InventoryReceipt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type InventoryReceiptListResponse =
  ApiResponse<InventoryReceiptListData>;
