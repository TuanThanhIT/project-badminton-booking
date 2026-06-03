import { useEffect, useState } from "react";
import { Clock, Lock, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import adminFinanceService from "../../../../services/admin/financeService";
import type { AdminFinanceStats } from "../../../../types/admin";
import { fmtCurrency } from "../../../../utils/constants/adminConstant";

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  color: string;
}) => (
  <div className={`rounded-xl border p-4 ${color}`}>
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold opacity-75">{label}</p>
        <p className="mt-2 text-2xl font-bold">{value}</p>
        <p className="mt-1 text-xs opacity-70">{sub}</p>
      </div>
    </div>
  </div>
);

const FinanceStatsCards = () => {
  const [stats, setStats] = useState<AdminFinanceStats | null>(null);

  useEffect(() => {
    adminFinanceService
      .getFinanceStatsService()
      .then((res) => setStats((res.data as any).data))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Chờ duyệt rút tiền"
        value={`${stats.pendingWithdrawCount} yêu cầu`}
        sub={fmtCurrency(stats.pendingWithdrawAmount)}
        icon={Clock}
        color="bg-amber-50 border-amber-200 text-amber-700"
      />
      <StatCard
        label="Nạp tiền hôm nay"
        value={fmtCurrency(stats.todayDeposit)}
        sub="Tổng nạp thành công"
        icon={TrendingUp}
        color="bg-emerald-50 border-emerald-200 text-emerald-700"
      />
      <StatCard
        label="Tổng số dư hệ thống"
        value={fmtCurrency(stats.totalSystemBalance)}
        sub="Tất cả ví người dùng"
        icon={Wallet}
        color="bg-sky-50 border-sky-200 text-sky-700"
      />
      <StatCard
        label="Ví đã khóa"
        value={`${stats.lockedWalletCount || 0} ví`}
        sub="Không thể giao dịch"
        icon={Lock}
        color="bg-red-50 border-red-200 text-red-700"
      />
    </div>
  );
};

export default FinanceStatsCards;
