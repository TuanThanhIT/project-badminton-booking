import instance from "../../utils/axiosCustomize";

const getFinanceStatsService = () =>
  instance.get("/admin/finance/stats");

const getWalletTransactionsService = (params: {
  page?: number; limit?: number; search?: string; type?: string; status?: string;
  dateFrom?: string; dateTo?: string;
}) => instance.get("/admin/finance/transactions", { params });

const getWithdrawRequestsService = (params: {
  page?: number; limit?: number; search?: string; status?: string;
}) => instance.get("/admin/finance/withdraws", { params });

const getUserWalletsService = (params: {
  page?: number; limit?: number; search?: string; status?: string;
}) => instance.get("/admin/finance/wallets", { params });

const approveWithdrawRequestService = (id: number) =>
  instance.patch(`/admin/finance/withdraws/${id}/approve`);

const rejectWithdrawRequestService = (id: number) =>
  instance.patch(`/admin/finance/withdraws/${id}/reject`);

const toggleWalletStatusService = (id: number, status: "ACTIVE" | "LOCKED") =>
  instance.patch(`/admin/finance/wallets/${id}/status`, { status });

const adminFinanceService = {
  getFinanceStatsService,
  getWalletTransactionsService,
  getWithdrawRequestsService,
  getUserWalletsService,
  approveWithdrawRequestService,
  rejectWithdrawRequestService,
  toggleWalletStatusService,
};

export default adminFinanceService;
