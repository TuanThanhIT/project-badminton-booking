import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

type DashboardStatCardProps = {
  title: string;
  value: string;
  growth: number;
  icon: ReactNode;
  color: string;
};

const DashboardStatCard = ({ title, value, growth, icon, color }: DashboardStatCardProps) => {
  const isPositive = growth >= 0;
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-xl transition">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-3 break-all">{value}</h3>
        </div>
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className={`flex items-center gap-1.5 text-sm font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span>{isPositive ? "+" : ""}{growth}% so với tháng trước</span>
      </div>
    </div>
  );
};

export default DashboardStatCard;
