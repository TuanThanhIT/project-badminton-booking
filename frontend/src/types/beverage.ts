import type { ApiResponse } from "./api";

///MANAGER
export type ManagerBeverage = {
  id: number;
  beverageName: string;
  thumbnailUrl?: string | null;
  price: number;
  stockId: number | null;
  branchId: number;
  stock: number;
  createdDate: string;
};

///MANAGER
export type ManagerBeverageStockUpdateData = ManagerBeverage & {
  totalStock: number;
};

///MANAGER
export type ManagerBeverageStockUpdateRequest = {
  beverageId: number;
  stock: number;
};

///MANAGER
export type ManagerBeverageListData = {
  branchId: number;
  beverages: ManagerBeverage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

///MANAGER
export type ManagerBeverageQueries = {
  page?: number;
  limit?: number;
  search?: string;
};

///MANAGER
export type ManagerBeveragesResponse = ApiResponse<ManagerBeverageListData>;
export type ManagerBeverageStockUpdateResponse =
  ApiResponse<ManagerBeverageStockUpdateData>;
