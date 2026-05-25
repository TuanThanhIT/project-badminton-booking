import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

const AdminPageHeader = ({ title, subtitle, action }: AdminPageHeaderProps) => (
  <div className="flex items-start justify-between mb-10">
    <div>
      <h1 className="text-2xl font-bold text-sky-700 relative inline-block">
        {title}
        <span className="absolute left-0 -bottom-3 w-1/2 h-1 bg-sky-400 rounded-sm" />
      </h1>
      {subtitle && <p className="text-sm text-gray-400 mt-4">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default AdminPageHeader;
