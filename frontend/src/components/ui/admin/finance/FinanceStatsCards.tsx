import { useState, useEffect } from "react";
import { Clock, TrendingUp, Wallet } from "lucide-react";
import adminFinanceService from "../../../../services/admin/financeService";
import type { AdminFinanceStats } from "../../../../types/admin";
import { fmtCurrency } from "../../../../utils/constants/adminConstant";

const FinanceStatsCards = () => {
  const [stats, setStats] = useState<AdminFinanceStats | null>(null);

  useEffect(() => {
    adminFinanceService.getFinanceStatsService()
      .then((res) => setStats((res.data as any).data))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const cards = [
    {
      label: "Chờ duyệt rút tiền",
      value: `${stats.pendingWithdrawCount} yêu cầu`,
      sub: fmtCurrency(stats.pendingWithdrawAmount),
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      bg: "bg-orange-50 border-orange-200",
      textColor: "text-orange-700",
    },
    {
      label: "Nạp tiền hôm nay",
      value: fmtCurrency(stats.todayDeposit),
      sub: "Tổng nạp thành công",
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      bg: "bg-green-50 border-green-200",
      textColor: "text-green-700",
    },
    {
      label: "Tổng số dư hệ thống",
      value: fmtCurrency(stats.totalSystemBalance),
      sub: "Tất cả ví người dùng",
      icon: <Wallet className="w-5 h-5 text-sky-500" />,
      bg: "bg-sky-50 border-sky-200",
      textColor: "text-sky-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-xl border p-4 flex items-center gap-4 ${c.bg}`}>
          <div className="p-2 bg-white rounded-lg shadow-sm">{c.icon}</div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{c.label}</p>
            <p className={`text-lg font-bold ${c.textColor}`}>{c.value}</p>
            <p className="text-xs text-gray-400">{c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinanceStatsCards;
