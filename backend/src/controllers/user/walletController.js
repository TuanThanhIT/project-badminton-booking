import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import walletService from "../../services/user/walletService.js";

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
    .json(new SuccessResponse("Rút tiền khỏi ví thành công", withDrawRequest));
});

const walletController = {
  walletDepositController,
  walletCallbackController,
  walletWithdrawRequestController,
};

export default walletController;
