import type {
  WalletCallbackRequest,
  WalletCallbackResponse,
  WalletDepositRequest,
  WalletDepositResponse,
} from "../../types/wallet";
import instance from "../../utils/axiosCustomize";

const walletDepositService = (data: WalletDepositRequest) =>
  instance.post<WalletDepositResponse>("/user/wallet/deposit", data);

const walletCallbackService = (data: WalletCallbackRequest) =>
  instance.patch<WalletCallbackResponse>("/user/wallet/vnpay/callback", data);

const walletService = {
  walletDepositService,
  walletCallbackService,
};

export default walletService;
