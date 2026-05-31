import UserAvatar from "../UserAvatar";
import AdminStatusBadge from "../AdminStatusBadge";
import type { AdminDashboardRecentItem } from "../../../../types/admin";
import { fmtCurrency, fmtDate } from "../../../../utils/constants/adminConstant";

type DashboardRecentRowProps = {
  item: AdminDashboardRecentItem;
  statusConfig: Record<string, { label: string; color: string }>;
};

const DashboardRecentRow = ({ item, statusConfig }: DashboardRecentRowProps) => {
  const statusConf = statusConfig[item.status] || {
    label: item.status,
    color: "bg-gray-50 text-gray-500 border-gray-200",
  };
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:shadow-md hover:border-slate-200 transition">
      <div className="flex items-center gap-3">
        <UserAvatar
          src={item.avatar}
          name={item.fullName || item.username || "?"}
          className="w-10 h-10 rounded-xl border border-gray-200"
        />
        <div>
          <p className="font-semibold text-slate-800 text-sm">{item.fullName || item.username || "—"}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {item.branchName || item.email || "—"} · {fmtDate(item.createdDate)}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-3">
        <p className="font-bold text-slate-800">{fmtCurrency(item.amount)}</p>
        <div className="mt-1">
          <AdminStatusBadge color={statusConf.color} label={statusConf.label} />
        </div>
      </div>
    </div>
  );
};

export default DashboardRecentRow;
