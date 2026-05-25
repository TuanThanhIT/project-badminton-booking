import { useState } from "react";
import { ArrowDownCircle, FileText, Users } from "lucide-react";
import FinanceStatsCards from "../../components/ui/admin/finance/FinanceStatsCards";
import WithdrawTab from "../../components/ui/admin/finance/WithdrawTab";
import TransactionsTab from "../../components/ui/admin/finance/TransactionsTab";
import WalletsTab from "../../components/ui/admin/finance/WalletsTab";

type TabType = "transactions" | "withdraws" | "wallets";

const FinanceManagementPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("withdraws");

  const tabs: { key: TabType; label: string; icon: typeof ArrowDownCircle }[] = [
    { key: "withdraws",    label: "Yêu cầu rút tiền", icon: ArrowDownCircle },
    { key: "transactions", label: "Lịch sử giao dịch", icon: FileText },
    { key: "wallets",      label: "Ví người dùng",     icon: Users },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-sky-700 relative inline-block">
            Quản lý Tài chính
            <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm" />
          </h1>
        </div>

        <FinanceStatsCards />

        <div className="flex gap-1 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-semibold border-b-2 transition ${
                  activeTab === tab.key
                    ? "border-sky-500 text-sky-700 bg-sky-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}>
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "withdraws"    && <WithdrawTab />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "wallets"      && <WalletsTab />}
      </div>
    </div>
  );
};

export default FinanceManagementPage;
