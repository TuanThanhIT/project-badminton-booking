export type DashboardBookingResponse = {
  online: number;
  offline: number;
  total: number;
};

export type DashboardRevenue7DaysResponse = {
  date: string;
  total: number;
}[];

export type DashboardRetailOrderResponse = {
  onlineOrders: number;
  onlineItems: number;
  offlineItems: number;
};

export type DashboardTopBeveragesResponse = {
  range: {
    start: string; // ISO date string
    end: string; // ISO date string
  };
  total: number;
  data: {
    beverageId: number;
    name: string;
    totalSold: number;
    revenue: number;
  }[];
};

export type DashboardTopProductsResponse = {
  range: {
    start: string; // ISO date string
    end: string; // ISO date string
  };
  total: number;
  data: {
    varientId: number;
    productName: string;
    color: string;
    size: string;
    totalSold: number;
    revenue: number;
  }[];
};

export type DashboardLowStockResponse = {
  products: {
    id: number;
    color: string;
    size: string;
    stock: number;
    product: {
      id: number;
      productName: string;
    };
  }[];
  beverages: {
    id: number;
    name: string;
    stock: number;
  }[];
};
