import type { ApiResponse } from "./api";

export type WalletTransactionType = "DEPOSIT" | "WITHDRAW" | "PAYMENT" | "REFUND";

export type WalletTransactionStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

export type WalletOverviewWallet = {
  id: number;
  balance: number;
  availableBalance: number;
  pendingWithdrawAmount: number;
  status: string;
  createdDate: string;
  updatedDate: string;
};

export type WalletOverviewSummary = {
  totalDeposit: number;
  totalWithdraw: number;
  totalPayment: number;
  totalRefund: number;
  pendingCount: number;
};

export type WalletChartItem = {
  date: string;
  label: string;
  deposit: number;
  withdraw: number;
  payment: number;
  refund: number;
};

export type WalletTransaction = {
  id: number;
  amount: number;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  description?: string | null;
  createdDate: string;
  updatedDate: string;
  expiredAt?: string | null;
  payment?: {
    id: number;
    paymentMethod: string;
    paymentStatus: string;
    targetPaymentType: string;
    targetPaymentId: number;
    transId?: string | null;
    paidAt?: string | null;
  } | null;
  withdrawRequest?: {
    id: number;
    bankName: string;
    bankAccount: string;
    accountHolder: string;
    status: string;
    processedAt?: string | null;
    createdDate: string;
  } | null;
};

export type WalletOverviewData = {
  wallet: WalletOverviewWallet;
  summary: WalletOverviewSummary;
  chart: WalletChartItem[];
  transactions: WalletTransaction[];
};

export type WalletOverviewResponse = ApiResponse<WalletOverviewData>;

export type WalletDepositResponse = ApiResponse<string>;

export type WalletDepositRequest = {
  amount: number;
};

export type VNPayCallbackRequest = {
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

export type WalletWithdrawRequest = {
  amount: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
};

export type WalletWithdrawConfirmRequest = {
  withdrawRequestId: number;
  otpCode: string;
  email: string;
};

export type WalletWithdrawData = {
  id: 2;
  amount: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  status: string;
  createdDate: string;
};

export type WalletWithdrawResponse = ApiResponse<WalletWithdrawData>;
