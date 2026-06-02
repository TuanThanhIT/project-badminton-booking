import { Link } from "react-router-dom";
import { ClipboardList, ShieldCheck } from "lucide-react";

const ManagerPublicHeader = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="flex h-[82px] w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 2xl:px-14">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img
            src="/img/logo_badminton.jpg"
            alt="B-Hub"
            className="h-[52px] w-[52px] rounded-2xl border border-sky-100 object-cover shadow-sm"
          />
          <div className="min-w-0">
            <p className="text-[1.55rem] font-bold leading-none tracking-tight text-slate-900 sm:text-[1.65rem]">
              B-Hub Manager
            </p>
            <p className="mt-1.5 hidden text-[13px] font-medium leading-snug text-slate-500 sm:block">
              Hệ thống quản lý vận hành
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          <div className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600">
            <ShieldCheck className="h-5 w-5 text-sky-600" />
            Secure Access
          </div>
          <div className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600">
            <ClipboardList className="h-5 w-5 text-sky-600" />
            Operations Control
          </div>
        </div>
      </div>
    </header>
  );
};

export default ManagerPublicHeader;
