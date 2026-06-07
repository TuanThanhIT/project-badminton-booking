import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import walletService from "../../services/user/walletService.js";

const getWalletOverviewController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  const wallet = await walletService.getWalletOverviewService(data);
  return res.status(200).json(new SuccessResponse("Lấy dữ liệu ví thành công", wallet));
});

const walletDepositController = asyncHandler(async (req, res) => {
  const data = { ...req.body, userId: req.user.id, ip: req.ip };
  const paymentUrl = await walletService.walletDepositService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse("Tạo link thanh toán VNPay thành công", paymentUrl),
    );
});

const walletCallbackController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  await walletService.walletCallbackService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Nạp tiền vào ví thành công"));
});

const walletWithdrawRequestController = asyncHandler(async (req, res) => {
  const data = { ...req.body, userId: req.user.id };
  const withDrawRequest =
    await walletService.walletWithdrawRequestService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse(
        "Gửi yêu cầu rút tiền khỏi ví thành công",
        withDrawRequest,
      ),
    );
});

const walletWithdrawConfirmController = asyncHandler(async (req, res) => {
  const data = { ...req.body, userId: req.user.id };
  const withDrawRequest =
    await walletService.walletWithdrawConfirmService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Xác nhận rút tiền khỏi ví thành công",
        withDrawRequest,
      ),
    );
});

const walletWithdrawCancelController = asyncHandler(async (req, res) => {
  const data = { ...req.body, userId: req.user.id };
  const withDrawRequest =
    await walletService.walletWithdrawCancelService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Yêu cầu rút tiền đã thất bại do thoát xác thực OTP",
        withDrawRequest,
      ),
    );
});

const walletController = {
  getWalletOverviewController,
  walletDepositController,
  walletCallbackController,
  walletWithdrawRequestController,
  walletWithdrawConfirmController,
  walletWithdrawCancelController,
};

export default walletController;
