import {
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Lock,
  RefreshCcw,
  Search,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { otpSend, setOtpFlow } from "../../../../redux/slices/user/authSlice";
import {
  getWalletOverview,
  walletDeposit,
  walletWithdrawRequest,
} from "../../../../redux/slices/user/walletSlice";
import type { formWalletDeposit } from "../../../../schemas/FormWalletDepositSchema";
import type { formWithdrawRequest } from "../../../../schemas/FormWithdrawRequestSchema";
import type {
  WalletDepositRequest,
  WalletTransaction,
  WalletTransactionType,
  WalletWithdrawRequest,
} from "../../../../types/wallet";
import type { OtpFlowData, OtpSendRequest } from "../../../../types/auth";
import { OTP_TYPE } from "../../../../utils/constants/otpType";
import { showConfirmDialog } from "../../../../utils/swalHelper";
import DepositForm from "./DepositForm";
import WithdrawRequestForm from "./WithdrawRequestForm";

type TabType = WalletTransactionType;

const tabs: { key: TabType; label: string }[] = [
  { key: "DEPOSIT", label: "Nạp tiền" },
  { key: "WITHDRAW", label: "Rút tiền" },
  { key: "PAYMENT", label: "Thanh toán" },
  { key: "REFUND", label: "Hoàn tiền" },
];

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const typeMeta: Record<
  TabType,
  {
    icon: typeof ArrowDownCircle;
    className: string;
    sign: "+" | "-";
    label: string;
  }
> = {
  DEPOSIT: {
    icon: ArrowDownCircle,
    className: "text-emerald-600 bg-emerald-50",
    sign: "+",
    label: "Nạp tiền",
  },
  WITHDRAW: {
    icon: ArrowUpCircle,
    className: "text-rose-600 bg-rose-50",
    sign: "-",
    label: "Rút tiền",
  },
  PAYMENT: {
    icon: CreditCard,
    className: "text-sky-600 bg-sky-50",
    sign: "-",
    label: "Thanh toán",
  },
  REFUND: {
    icon: RefreshCcw,
    className: "text-cyan-600 bg-cyan-50",
    sign: "+",
    label: "Hoàn tiền",
  },
};

const statusLabel: Record<string, string> = {
  PENDING: "Đang xử lý",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
};

const statusClass: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  SUCCESS: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-rose-50 text-rose-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

const WalletPanel = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const overview = useAppSelector((state) => state.wallet.overview);
  const paymentUrl = useAppSelector((state) => state.wallet.paymentUrl);
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["wallet/getWalletOverview"]),
  );
  const withdrawLoading = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["wallet/walletWithdrawRequest"]),
  );

  const [activeTab, setActiveTab] = useState<TabType>("DEPOSIT");
  const [search, setSearch] = useState("");
  const [openDeposit, setOpenDeposit] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);

  useEffect(() => {
    dispatch(getWalletOverview());
  }, [dispatch]);

  useEffect(() => {
    if (paymentUrl) window.location.href = paymentUrl;
  }, [paymentUrl]);

  const handleWalletDeposit = async (dt: formWalletDeposit) => {
    const confirmed = await showConfirmDialog(
      "Xác nhận nạp tiền",
      "Bạn sẽ được chuyển đến cổng thanh toán VNPay. Tiếp tục?",
      "Xác nhận",
      "Hủy",
    );
    if (!confirmed) return;

    const data: WalletDepositRequest = { amount: dt.amount };
    await dispatch(walletDeposit({ data }));
  };

  const handleWithdrawRequest = async (dt: formWithdrawRequest) => {
    const confirmed = await showConfirmDialog(
      "Xác nhận rút tiền",
      "Bạn có chắc chắn muốn rút số tiền này khỏi ví?",
      "Chắc chắn",
      "Hủy",
    );
    if (!confirmed || !user) return;

    const data: WalletWithdrawRequest = {
      amount: dt.amount,
      bankName: dt.bankName,
      bankAccount: dt.bankAccount,
      accountHolder: dt.accountHolder,
    };

    await dispatch(walletWithdrawRequest({ data }))
      .unwrap()
      .then((res) => {
        const flowData: OtpFlowData = {
          withdrawRequestId: res.data.id,
          email: user.email,
          type: OTP_TYPE.WITHDRAW_REQUEST,
        };
        const otpData: OtpSendRequest = {
          email: user.email,
          type: OTP_TYPE.WITHDRAW_REQUEST,
        };
        toast.success("Gửi yêu cầu rút tiền thành công");
        dispatch(otpSend({ data: otpData }));
        dispatch(setOtpFlow({ data: flowData }));
        navigate("/verify-otp");
      });
  };

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (overview?.transactions || [])
      .filter((item) => item.type === activeTab)
      .filter((item) => {
        if (!keyword) return true;
        return (
          item.description?.toLowerCase().includes(keyword) ||
          item.withdrawRequest?.bankName.toLowerCase().includes(keyword) ||
          item.payment?.transId?.toLowerCase().includes(keyword)
        );
      });
  }, [activeTab, overview?.transactions, search]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, WalletTransaction[]>>((acc, item) => {
      const key = new Date(item.createdDate).toLocaleDateString("vi-VN");
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filtered]);

  const transactionCounts = useMemo(() => {
    const fallback = (overview?.transactions || []).reduce<
      Record<TabType, number>
    >(
      (acc, item) => {
        acc[item.type] += 1;
        return acc;
      },
      { DEPOSIT: 0, WITHDRAW: 0, PAYMENT: 0, REFUND: 0 },
    );

    return {
      ...fallback,
      ...(overview?.summary.transactionCounts || {}),
    };
  }, [overview?.summary.transactionCounts, overview?.transactions]);

  const statCards = [
    {
      label: "Đã nạp",
      value: overview?.summary.totalDeposit,
      className: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Đã thanh toán",
      value: overview?.summary.totalPayment,
      className: "text-sky-700 bg-sky-50",
    },
    {
      label: "Đang chờ",
      value: overview?.summary.pendingCount,
      className: "text-amber-700 bg-amber-50",
      isCount: true,
    },
  ];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Wallet size={23} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Ví thanh toán
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Theo dõi số dư, giao dịch nạp tiền, rút tiền và thanh toán.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setOpenDeposit(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 active:scale-[0.98]"
            >
              <ArrowDownCircle size={18} />
              Nạp tiền
            </button>
            <button
              type="button"
              onClick={() => setOpenWithdraw(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98]"
            >
              <ArrowUpCircle size={18} />
              Rút tiền
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5 bg-slate-100/60 p-3 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.35fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Số dư hiện tại</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {loading ? "..." : formatCurrency(overview?.wallet.balance)}
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
              <Lock size={15} />
              Khả dụng: {formatCurrency(overview?.wallet.availableBalance)}
            </p>

            <div className="mt-5 grid gap-3">
              {statCards.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl px-4 py-3 ${item.className}`}
                >
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold">
                    {item.isCount
                      ? `${item.value || 0} giao dịch`
                      : formatCurrency(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Dòng tiền 7 ngày
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tổng hợp từ giao dịch ví đã thành công.
                </p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overview?.chart || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `Ngày ${label}`}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      Number(value) >= 1000000
                        ? `${Number(value) / 1000000}tr`
                        : `${Number(value) / 1000}k`
                    }
                    width={54}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="deposit"
                    name="Nạp"
                    stroke="#059669"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="withdraw"
                    name="Rút"
                    stroke="#e11d48"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="payment"
                    name="Thanh toán"
                    stroke="#0284c7"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="refund"
                    name="Hoàn"
                    stroke="#0891b2"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Lịch sử giao dịch
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Dữ liệu lấy trực tiếp từ ví của tài khoản hiện tại.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm giao dịch..."
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "border-sky-500 bg-sky-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                }`}
              >
                {tab.label} ({transactionCounts[tab.key] || 0})
              </button>
            ))}
          </div>

          <div className="max-h-[520px] space-y-5 overflow-y-auto pr-1">
            {Object.entries(grouped).length > 0 ? (
              Object.entries(grouped).map(([date, list]) => (
                <div key={date}>
                  <p className="mb-2 text-sm font-medium text-slate-400">
                    {date}
                  </p>
                  <div className="space-y-2">
                    {list.map((tx) => {
                      const meta = typeMeta[tx.type];
                      const Icon = meta.icon;
                      return (
                        <div
                          key={tx.id}
                          className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-sky-100 hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${meta.className}`}
                            >
                              <Icon size={20} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {tx.description || meta.label}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {formatDateTime(tx.createdDate)}
                              </p>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <p
                              className={`font-semibold ${
                                meta.sign === "+"
                                  ? "text-emerald-600"
                                  : "text-rose-600"
                              }`}
                            >
                              {meta.sign}
                              {formatCurrency(tx.amount)}
                            </p>
                            <span
                              className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                statusClass[tx.status] || statusClass.CANCELLED
                              }`}
                            >
                              {statusLabel[tx.status] || tx.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-sm font-medium text-slate-500">
                Chưa có giao dịch phù hợp.
              </div>
            )}
          </div>
        </div>
      </div>

      {openDeposit && (
        <DepositForm
          setOpenDeposit={setOpenDeposit}
          onSubmit={handleWalletDeposit}
        />
      )}

      {openWithdraw && (
        <WithdrawRequestForm
          setOpenWithdraw={setOpenWithdraw}
          onSubmit={handleWithdrawRequest}
          loading={withdrawLoading}
        />
      )}
    </section>
  );
};

export default WalletPanel;
