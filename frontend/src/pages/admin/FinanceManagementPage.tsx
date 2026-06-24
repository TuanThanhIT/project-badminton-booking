import { useState } from "react";
import { ArrowDownCircle, FileText, RefreshCw, Users } from "lucide-react";
import FinanceStatsCards from "../../components/ui/admin/finance/FinanceStatsCards";
import WithdrawTab from "../../components/ui/admin/finance/WithdrawTab";
import TransactionsTab from "../../components/ui/admin/finance/TransactionsTab";
import WalletsTab from "../../components/ui/admin/finance/WalletsTab";
import AdminPageHeader from "../../components/ui/admin/AdminPageHeader";

type TabType = "transactions" | "withdraws" | "wallets";

const FinanceManagementPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("withdraws");
  const [refreshVersion, setRefreshVersion] = useState(0);

  const tabs: { key: TabType; label: string; icon: typeof ArrowDownCircle }[] = [
    { key: "withdraws",    label: "Yêu cầu rút tiền", icon: ArrowDownCircle },
    { key: "transactions", label: "Lịch sử giao dịch", icon: FileText },
    { key: "wallets",      label: "Ví người dùng",     icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        <AdminPageHeader
          title="Quản lý tài chính"
          subtitle="Theo dõi ví người dùng, giao dịch và các yêu cầu rút tiền."
          action={
            <button
              type="button"
              onClick={() => setRefreshVersion((value) => value + 1)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/15"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </button>
          }
        />

        <FinanceStatsCards refreshKey={refreshVersion} />

        <div className="flex gap-1 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-[13px] font-semibold border-b-2 transition ${
                  activeTab === tab.key
                    ? "border-sky-500 text-sky-700 bg-sky-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}>
                <Icon className="h-3.5 w-3.5" />{tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "withdraws" && (
          <WithdrawTab
            key={`withdraws-${refreshVersion}`}
            onProcessed={() => setRefreshVersion((value) => value + 1)}
          />
        )}
        {activeTab === "transactions" && (
          <TransactionsTab key={`transactions-${refreshVersion}`} />
        )}
        {activeTab === "wallets" && (
          <WalletsTab key={`wallets-${refreshVersion}`} />
        )}
      </div>
    </div>
  );
};

export default FinanceManagementPage;
