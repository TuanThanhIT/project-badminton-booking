import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import adminFinanceService from "../../services/admin/financeService.js";

const getWalletTransactionsController = asyncHandler(async (req, res) => {
  const result = await adminFinanceService.getAdminWalletTransactionsService(req.query);
  return res.status(200).json(new SuccessResponse("Lấy danh sách giao dịch thành công", result));
});

const getWithdrawRequestsController = asyncHandler(async (req, res) => {
  const result = await adminFinanceService.getAdminWithdrawRequestsService(req.query);
  return res.status(200).json(new SuccessResponse("Lấy danh sách yêu cầu rút tiền thành công", result));
});

const getUserWalletsController = asyncHandler(async (req, res) => {
  const result = await adminFinanceService.getAdminUserWalletsService(req.query);
  return res.status(200).json(new SuccessResponse("Lấy danh sách ví người dùng thành công", result));
});

// P0
const approveWithdrawRequestController = asyncHandler(async (req, res) => {
  await adminFinanceService.approveWithdrawRequestService(Number(req.params.id));
  return res.status(200).json(new SuccessResponse("Duyệt yêu cầu rút tiền thành công"));
});

const rejectWithdrawRequestController = asyncHandler(async (req, res) => {
  await adminFinanceService.rejectWithdrawRequestService(Number(req.params.id));
  return res.status(200).json(new SuccessResponse("Từ chối yêu cầu rút tiền thành công"));
});

// P1
const toggleWalletStatusController = asyncHandler(async (req, res) => {
  const result = await adminFinanceService.toggleWalletStatusService(
    Number(req.params.id),
    req.body.status,
  );
  return res.status(200).json(new SuccessResponse("Cập nhật trạng thái ví thành công", result));
});

// P2
const getFinanceStatsController = asyncHandler(async (req, res) => {
  const result = await adminFinanceService.getAdminFinanceStatsService();
  return res.status(200).json(new SuccessResponse("Lấy thống kê tài chính thành công", result));
});

const adminFinanceController = {
  getWalletTransactionsController,
  getWithdrawRequestsController,
  getUserWalletsController,
  approveWithdrawRequestController,
  rejectWithdrawRequestController,
  toggleWalletStatusController,
  getFinanceStatsController,
};

export default adminFinanceController;
