import { Bell, Mail, Search } from "lucide-react";
import { useAppSelector } from "../../../redux/hook";

const ManagerHeader = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h2 className="truncate text-2xl font-extrabold tracking-tight text-slate-900">
          Quản lý cửa hàng
        </h2>
        <p className="mt-1 hidden text-sm font-medium text-slate-500 sm:block">
          Theo dõi hoạt động chi nhánh B-Hub trong ngày
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden xl:block">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="h-12 w-80 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-5 text-sm font-medium outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:bg-sky-50">
          <Mail className="h-5 w-5 text-sky-700" />
          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500" />
        </button>

        <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:bg-sky-50">
          <Bell className="h-5 w-5 text-sky-700" />
          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500" />
        </button>

        <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm lg:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 font-bold text-white">
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">{user?.username}</p>
            <p className="text-xs font-medium text-slate-500">Quản lý cửa hàng</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ManagerHeader;
