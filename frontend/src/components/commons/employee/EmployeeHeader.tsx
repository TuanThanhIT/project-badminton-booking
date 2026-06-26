import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCheck,
  LogOut,
  MapPin,
  UserRound,
  WalletCards,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import { logout, logoutLocal } from "../../../redux/slices/user/authSlice";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../../redux/slices/user/notificationSlice";

const formatToday = () =>
  new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const EmployeeHeader = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const session = useAppSelector((state) => state.employeeCounter.session);
  const {
    notifications,
    unreadCount,
    loading: notificationLoading,
  } = useAppSelector((state) => state.notification);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    dispatch(getNotifications({ data: { page: 1, limit: 8 } }));
  }, [dispatch, accessToken]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenNotifications = () => {
    setIsNotificationOpen((prev) => !prev);
    if (!isNotificationOpen && accessToken) {
      dispatch(getNotifications({ data: { page: 1, limit: 8 } }));
    }
  };

  const handleMarkRead = (notificationId: number) => {
    dispatch(markNotificationRead({ notificationId }));
  };

  const handleMarkAllRead = () => {
    if (!unreadCount) return;
    dispatch(markAllNotificationsRead());
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(logoutLocal());
    navigate("/employee/login");
  };

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
              <h1 className="text-lg font-bold text-slate-950">B-Hub</h1>
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
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={handleOpenNotifications}
              className={`relative grid h-10 w-10 place-items-center rounded-2xl border text-slate-600 transition ${
                isNotificationOpen
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
              title="Thông báo"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-400 px-1 text-[10px] font-bold text-white shadow">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-[min(92vw,420px)] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
                <div className="flex items-center justify-between border-b border-slate-100 p-4">
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      Thông báo
                    </p>
                    <p className="text-xs text-slate-500">
                      {unreadCount > 0
                        ? `${unreadCount} thông báo chưa đọc`
                        : "Tất cả đã đọc"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={!unreadCount}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCheck size={14} />
                    Đọc tất cả
                  </button>
                </div>

                <div className="max-h-[420px] overflow-y-auto p-2">
                  {notificationLoading ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                      Đang tải thông báo...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                        <Bell size={22} />
                      </div>
                      <p className="font-medium text-slate-800">
                        Chưa có thông báo
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Đơn hàng và lịch sân của chi nhánh sẽ hiển thị tại đây.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleMarkRead(notification.id)}
                        className={`group w-full p-3 rounded-lg text-left transition mb-1 ${
                          notification.isRead
                            ? "hover:bg-slate-50"
                            : "bg-sky-50/80 hover:bg-sky-100"
                        }`}
                      >
                        <div className="flex gap-3">
                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                              notification.isRead
                                ? "bg-slate-300"
                                : "bg-sky-500"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="line-clamp-1 font-semibold text-slate-900">
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-sky-700 ring-1 ring-sky-100">
                                  Mới
                                </span>
                              )}
                            </div>
                            <p className="mt-1 line-clamp-3 text-sm leading-5 text-slate-600">
                              {notification.message}
                            </p>
                            <p className="mt-2 text-xs text-slate-400">
                              {new Date(notification.createdAt).toLocaleString(
                                "vi-VN",
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 sm:flex">
            <UserRound className="h-4 w-4 text-sky-600" />
            {user?.username || "Nhân viên"}
          </div>
          <button
            onClick={() => navigate("/employee/cash-register")}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-sky-600 px-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <WalletCards className="h-4 w-4" />
            <span className="hidden sm:inline">Checkout</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất"
            aria-label="Đăng xuất"
            className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default EmployeeHeader;
