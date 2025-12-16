export type RevenueRequest = {
  startDate?: string;
  endDate?: string;
  date?: string;
  page?: number;
  limit?: number;
};

export type RangeType = {
  start: string;
  end: string;
  type: "DAY" | "WEEK" | "MONTH";
};

export type RevenueType = {
  onlineOrder: number;
  onlineBooking: number;
  offline: number;
  total: number;
};

export type OrdersType = {
  total: number;
  completed: number;
  cancelled: number;
};

export type BookingsType = {
  total: number;
  completed: number;
  cancelled: number;
};

export type OfflineBookingsType = {
  total: number;
  paid: number;
};

export type RevenueOverviewResponse = {
  range: RangeType;
  startDate: string;
  endDate: string;
  revenue: RevenueType;
  orders: OrdersType;
  bookings: BookingsType;
  offlineBookings: OfflineBookingsType;
};

export type RevenueDateType = {
  onlineOrder: number;
  onlineBooking: number;
  offline: number;
  total: number;
};

export type RevenueDateResponse = {
  date: string;
  revenue: RevenueDateType;
};

export type RevenueBeverageItem = {
  id: number;
  name: string;
  price: number;
  totalSold: number;
  revenue: number;
  startDate: string;
  endDate: string;
};

export type RevenueBeverageResponse = {
  page: number;
  limit: number;
  total: number;
  startDate: string;
  endDate: string;
  data: RevenueBeverageItem[];
};

export type RevenueProductItem = {
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  totalSold: number;
  revenue: number;
  startDate: string;
  endDate: string;
};

export type RevenueProductResponse = {
  page: number;
  limit: number;
  total: number;
  startDate: string;
  endDate: string;
  data: RevenueProductItem[];
};

export type RevenueTransactionType =
  | "ONLINE_ORDER"
  | "ONLINE_BOOKING"
  | "OFFLINE";

export type RevenueTransactionItem = {
  id: number;
  type: RevenueTransactionType;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt: string;
  createdDate: string;
};

export type RevenueTransactionResponse = {
  total: number;
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  rows: RevenueTransactionItem[];
};
