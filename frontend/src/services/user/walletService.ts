import type {
  VNPayCallbackRequest,
  WalletCallbackResponse,
  WalletDepositRequest,
  WalletDepositResponse,
  WalletWithdrawConfirmRequest,
  WalletWithdrawRequest,
  WalletWithdrawResponse,
} from "../../types/wallet";
import instance from "../../utils/axiosCustomize";

const walletDepositService = (data: WalletDepositRequest) =>
  instance.post<WalletDepositResponse>("/user/wallet/deposit", data);

const walletCallbackService = (data: VNPayCallbackRequest) =>
  instance.patch<WalletCallbackResponse>("/user/wallet/vnpay/callback", data);

const walletWithdrawRequestService = (data: WalletWithdrawRequest) =>
  instance.post<WalletWithdrawResponse>("/user/wallet/withdraw", data);

const walletWithdrawConfirmService = (data: WalletWithdrawConfirmRequest) =>
  instance.patch<WalletWithdrawResponse>("/user/wallet/withdraw/confirm", data);

const walletService = {
  walletDepositService,
  walletCallbackService,
  walletWithdrawRequestService,
  walletWithdrawConfirmService,
};

export default walletService;
