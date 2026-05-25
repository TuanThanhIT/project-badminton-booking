// components/commons/admin/AdminPublicFooter.tsx

import { LayoutDashboard, LockKeyhole, ShieldCheck } from "lucide-react";

const AdminPublicFooter = () => {
  return (
    <footer className="shrink-0 border-t border-slate-200 bg-white text-slate-700">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-10 2xl:px-14">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
            B-Hub Admin System
          </h3>
          <p className="mt-1 hidden text-xs leading-relaxed text-slate-500 sm:block">
            Nền tảng quản trị và vận hành hệ thống với bảo mật tập trung.
          </p>
        </div>

        <div className="hidden flex-wrap items-center justify-center gap-2 sm:flex">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 sm:px-4 sm:text-sm">
            <ShieldCheck className="h-4 w-4 text-sky-600" />
            Security
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 sm:px-4 sm:text-sm">
            <LockKeyhole className="h-4 w-4 text-sky-600" />
            Authentication
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 sm:px-4 sm:text-sm">
            <LayoutDashboard className="h-4 w-4 text-sky-600" />
            Management
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminPublicFooter;
