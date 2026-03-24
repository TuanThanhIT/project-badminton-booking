import type { ApiResponse } from "./api";

export type WalletDepositResponse = ApiResponse<string>;

export type WalletDepositRequest = {
  amount: number;
};

export type WalletCallbackRequest = {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
};

export type WalletCallbackResponse = ApiResponse<null>;
