import type {
  VNPayCallbackRequest,
  WalletCallbackResponse,
  WalletDepositRequest,
  WalletDepositResponse,
  WalletOverviewResponse,
  WalletWithdrawCancelRequest,
  WalletWithdrawConfirmRequest,
  WalletWithdrawRequest,
  WalletWithdrawResponse,
} from "../../types/wallet";
import instance from "../../utils/axiosCustomize";

const getWalletOverviewService = () =>
  instance.get<WalletOverviewResponse>("/user/wallet");

const walletDepositService = (data: WalletDepositRequest) =>
  instance.post<WalletDepositResponse>("/user/wallet/deposit", data);

const walletCallbackService = (data: VNPayCallbackRequest) =>
  instance.patch<WalletCallbackResponse>("/user/wallet/vnpay/callback", data);

const walletWithdrawRequestService = (data: WalletWithdrawRequest) =>
  instance.post<WalletWithdrawResponse>("/user/wallet/withdraw", data);

const walletWithdrawConfirmService = (data: WalletWithdrawConfirmRequest) =>
  instance.patch<WalletWithdrawResponse>("/user/wallet/withdraw/confirm", data);

const walletWithdrawCancelService = (data: WalletWithdrawCancelRequest) =>
  instance.patch<WalletWithdrawResponse>("/user/wallet/withdraw/cancel", data);

const walletService = {
  getWalletOverviewService,
  walletDepositService,
  walletCallbackService,
  walletWithdrawRequestService,
  walletWithdrawConfirmService,
  walletWithdrawCancelService,
};

export default walletService;
