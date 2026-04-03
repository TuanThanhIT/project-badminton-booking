import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  RefreshCcw,
  Lock,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import type { formWalletDeposit } from "../../schemas/FormWalletDepositSchema";
import type {
  WalletDepositRequest,
  WalletWithdrawRequest,
} from "../../types/wallet";
import {
  walletDeposit,
  walletWithdrawRequest,
} from "../../redux/slices/user/walletSlice";
import DepositForm from "../../components/ui/user/DepositForm";
import { showConfirmDialog } from "../../utils/swalHelper";
import type { formWithdrawRequest } from "../../schemas/FormWithdrawRequestSchema";
import WithdrawRequestForm from "../../components/ui/user/WithdrawRequestForm";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { setOtpFlow } from "../../redux/slices/user/authSlice";
import type { OtpFlowData } from "../../types/auth";
import { OTP_TYPE } from "../../constants/otpType";

type TabType = "deposit" | "withdraw" | "payment" | "refund";
type Status = "success" | "pending";

interface Transaction {
  id: number;
  type: TabType;
  amount: number;
  date: string; // yyyy-mm-dd
  time: string;
  note: string;
  status: Status;
}

const WalletPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const paymentUrl = useAppSelector((state) => state.wallet.paymentUrl);
  const user = useAppSelector((state) => state.auth.user);
  const withdrawLoading = useAppSelector(
    (state) => state.ui.loadingMap["wallet/walletWithdrawRequest"],
  );
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("deposit");
  const [search, setSearch] = useState("");
  const [openDeposit, setOpenDeposit] = useState<boolean>(false);
  const [openWithdraw, setOpenWithdraw] = useState<boolean>(false);

  useEffect(() => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  }, [paymentUrl]);

  const handleWalletDeposit = async (dt: formWalletDeposit) => {
    const confirmed = await showConfirmDialog(
      "Xác nhận nạp tiền",
      "Bạn có chắc chắn muốn nạp số tiền này vào ví ?",
      "Chắc chắn",
      "Hủy",
    );
    if (!confirmed) return;
    const data: WalletDepositRequest = {
      amount: dt.amount,
    };
    await dispatch(walletDeposit({ data }));
  };

  const handleWithdrawRequest = async (dt: formWithdrawRequest) => {
    const confirmed = await showConfirmDialog(
      "Xác nhận rút tiền",
      "Bạn có chắc chắn muốn rút số tiền này khỏi ví ?",
      "Chắc chắn",
      "Hủy",
    );
    if (!confirmed) return;
    const data: WalletWithdrawRequest = {
      amount: dt.amount,
      bankName: dt.bankName,
      bankAccount: dt.bankAccount,
      accountHolder: dt.accountHolder,
    };
    await dispatch(walletWithdrawRequest({ data }))
      .unwrap()
      .then((res) => {
        const dta: OtpFlowData = {
          withdrawRequestId: res.data.id,
          email: user?.email,
          type: OTP_TYPE.WITHDRAW_REQUEST,
        };
        toast.success("Gửi yêu cầu rút tiền thành công");
        dispatch(setOtpFlow({ data: dta }));
        setTimeout(() => {
          navigate("/verify-otp");
        }, 2000);
      });
  };

  // MOCK DATA
  const transactions: Transaction[] = Array.from({ length: 40 }, (_, i) => {
    const types: TabType[] = ["deposit", "withdraw", "payment", "refund"];
    const type = types[i % 4];

    return {
      id: i,
      type,
      amount: Math.floor(Math.random() * 1000000) + 100000,
      date: i < 20 ? "2026-03-24" : "2026-03-23",
      time: `${10 + (i % 10)}:${(i % 60).toString().padStart(2, "0")}`,
      status: i % 3 === 0 ? "pending" : "success",
      note:
        type === "deposit"
          ? "Nạp tiền VNPay"
          : type === "withdraw"
            ? "Rút về ngân hàng"
            : type === "payment"
              ? `Thanh toán đơn #${100 + i}`
              : `Hoàn tiền đơn #${100 + i}`,
    };
  });

  // CHART DATA
  const chartData = [
    {
      day: "Mon",
      deposit: 500000,
      withdraw: 200000,
      payment: 300000,
      refund: 100000,
    },
    {
      day: "Tue",
      deposit: 700000,
      withdraw: 100000,
      payment: 400000,
      refund: 150000,
    },
    {
      day: "Wed",
      deposit: 600000,
      withdraw: 300000,
      payment: 200000,
      refund: 50000,
    },
    {
      day: "Thu",
      deposit: 900000,
      withdraw: 200000,
      payment: 500000,
      refund: 200000,
    },
    {
      day: "Fri",
      deposit: 1200000,
      withdraw: 400000,
      payment: 600000,
      refund: 100000,
    },
    {
      day: "Sat",
      deposit: 1000000,
      withdraw: 300000,
      payment: 400000,
      refund: 150000,
    },
    {
      day: "Sun",
      deposit: 1100000,
      withdraw: 200000,
      payment: 500000,
      refund: 200000,
    },
  ];

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => t.type === activeTab)
      .filter((t) => t.note.toLowerCase().includes(search.toLowerCase()));
  }, [transactions, activeTab, search]);

  const grouped = useMemo(() => {
    const group: Record<string, Transaction[]> = {};
    filtered.forEach((t) => {
      if (!group[t.date]) group[t.date] = [];
      group[t.date].push(t);
    });
    return group;
  }, [filtered]);

  const tabs = [
    { key: "deposit", label: "Nạp tiền" },
    { key: "withdraw", label: "Rút tiền" },
    { key: "payment", label: "Thanh toán" },
    { key: "refund", label: "Hoàn tiền" },
  ];

  const getIcon = (type: TabType) => {
    const cls = "w-5 h-5";
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className={`${cls} text-green-500`} />;
      case "withdraw":
        return <ArrowUpCircle className={`${cls} text-red-500`} />;
      case "payment":
        return <CreditCard className={`${cls} text-blue-500`} />;
      case "refund":
        return <RefreshCcw className={`${cls} text-cyan-500`} />;
    }
  };

  const formatDateLabel = (date: string) => {
    if (date === "2026-03-24") return "Hôm nay";
    if (date === "2026-03-23") return "Hôm qua";
    return date;
  };

  return (
    <div className="max-w-5xl mx-auto p-8 my-10 bg-white rounded-2xl border border-gray-300">
      {/* HEADER */}
      <header className="flex items-center gap-3 mb-6">
        <Wallet className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl font-semibold text-gray-800 underline">
          Ví thanh toán
        </h1>
      </header>

      {/* BALANCE + CHART */}
      <div className="mb-6 p-6 rounded-2xl bg-gradient-to-t from-white to-sky-50 shadow-sm">
        <div className="flex justify-between items-start">
          {/* LEFT */}
          <div>
            <p className="text-sm text-gray-500 font-bold">Số dư</p>
            <p className="text-3xl font-bold text-green-600">1,200,000 VND</p>

            <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Lock className="w-4 h-4" />
              Khả dụng: 1,000,000 VND
            </p>
          </div>

          {/* RIGHT - ACTION BUTTONS */}
          <div className="flex gap-3">
            {/* NẠP */}
            <button
              onClick={() => setOpenDeposit(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium shadow-sm transition"
            >
              <ArrowDownCircle className="w-5 h-5" />
              Nạp tiền
            </button>

            {/* RÚT */}
            <button
              onClick={() => setOpenWithdraw(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium shadow-sm transition"
            >
              <ArrowUpCircle className="w-5 h-5" />
              Rút tiền
            </button>
          </div>
        </div>

        {/* CHART */}
        <div className="mt-4 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Tooltip
                formatter={(value: number) => value.toLocaleString() + " VND"}
              />
              <Legend />

              <Line
                type="monotone"
                dataKey="deposit"
                stroke="#22c55e"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="withdraw"
                stroke="#ef4444"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="payment"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="refund"
                stroke="#06b6d4"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Tìm giao dịch..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-5 p-3 rounded-xl bg-gray-100 focus:outline-none"
      />

      {/* TABS */}
      <div className="flex gap-6 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as TabType)}
            className={`pb-2 text-sm font-medium ${
              activeTab === t.key
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="max-h-[500px] overflow-y-auto space-y-4">
        {Object.entries(grouped).map(([date, list]) => (
          <div key={date}>
            <p className="text-sm text-gray-400 mb-2">
              {formatDateLabel(date)} ({date})
            </p>

            <div className="space-y-2">
              {list.map((t) => {
                const isIncome = t.type === "deposit" || t.type === "refund";

                return (
                  <div
                    key={t.id}
                    className="flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        {getIcon(t.type)}
                      </div>

                      <div>
                        <p className="font-medium">{t.note}</p>
                        <p className="text-xs text-gray-400">
                          {t.time} •{" "}
                          {t.status === "pending" ? "Đang xử lý" : "Thành công"}
                        </p>
                      </div>
                    </div>

                    <p
                      className={`font-semibold ${
                        isIncome ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {t.amount.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
    </div>
  );
};

export default WalletPage;
