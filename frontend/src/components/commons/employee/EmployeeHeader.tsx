import { Bell, CalendarDays, LogOut, MapPin, UserRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../redux/hook";

const formatToday = () =>
  new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const EmployeeHeader = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const session = useAppSelector((state) => state.employeeCounter.session);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/img/logo_badminton.jpg"
            alt="B-Hub"
            className="h-11 w-11 rounded-2xl border border-slate-200 object-cover"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-950">B-Hub</h1>
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">
                {session?.roleInShift || "EMPLOYEE"}
              </span>
            </div>
            <div className="mt-1 flex max-w-[520px] items-center gap-3 truncate text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 truncate">
                <CalendarDays className="h-3.5 w-3.5" />
                {session?.workShift.shiftName || formatToday()}
              </span>
              {session?.branch && (
                <span className="hidden min-w-0 items-center gap-1 truncate sm:inline-flex">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{session.branch.branchName}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="hidden items-center rounded-2xl bg-slate-100 p-1 lg:flex">
          <NavLink
            to="/employee/home"
            className={({ isActive }) =>
              `rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`
            }
          >
            Màn hình chính
          </NavLink>
          <NavLink
            to="/employee/bookings"
            className={({ isActive }) =>
              `rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`
            }
          >
            Lịch sân
          </NavLink>
          <NavLink
            to="/employee/shifts"
            className={({ isActive }) =>
              `rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`
            }
          >
            Ca làm
          </NavLink>
          <NavLink
            to="/employee/orders"
            className={({ isActive }) =>
              `rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`
            }
          >
            Đơn hàng
          </NavLink>
          <NavLink
            to="/employee/cash-register"
            className={({ isActive }) =>
              `rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`
            }
          >
            Tiền đầu ca
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50">
            <Bell className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 sm:flex">
            <UserRound className="h-4 w-4 text-sky-600" />
            {user?.username || "Nhân viên"}
          </div>
          <button
            onClick={() => navigate("/employee/cash-register")}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Checkout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default EmployeeHeader;
