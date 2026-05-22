import { type RefObject, useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarCheck,
  CalendarPlus,
  CheckCheck,
  LogOut,
  MessageCircle,
  Package,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import { logout, logoutLocal } from "../../../redux/slices/user/authSlice";
import { getMyBookings } from "../../../redux/slices/user/bookingSlice";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../../redux/slices/user/notificationSlice";
import { getUserOrders } from "../../../redux/slices/user/orderSlice";
import { getMyProfile } from "../../../redux/slices/user/profileSlice";

interface HeaderProps {
  cartRef: RefObject<HTMLDivElement | null>;
}

const Header = ({ cartRef }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const { user, accessToken } = useAppSelector((state) => state.auth);
  const myProfile = useAppSelector((state) => state.profile.myProfile);
  const cart = useAppSelector((state) => state.cart.cart);
  const { userOrderPagination } = useAppSelector((state) => state.order);
  const totalBookings = useAppSelector((state) => state.booking.totalBookings);
  const {
    notifications,
    unreadCount,
    loading: notificationLoading,
  } = useAppSelector((state) => state.notification);

  const [countCartItem, setCountCartItem] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const orderCount = userOrderPagination?.total || 0;
  const bookingCount = totalBookings || 0;

  useEffect(() => {
    if (!cart) return;
    setCountCartItem(cart.cartItems.length);
  }, [cart]);

  useEffect(() => {
    if (!accessToken || !user?.id || myProfile?.id) return;
    dispatch(getMyProfile());
  }, [dispatch, accessToken, user?.id, myProfile?.id]);

  useEffect(() => {
    if (!accessToken) return;
    dispatch(getUserOrders({ data: { page: 1, limit: 1, status: "ALL" } }));
    dispatch(getMyBookings({ data: { page: 1, limit: 1 } }));
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

  const handleLogout = () => {
    dispatch(logout());
    dispatch(logoutLocal());
    navigate("/login");
  };

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

  const displayName =
    myProfile?.profile?.fullName?.trim() || user?.username || "Tài khoản";
  const avatarUrl = myProfile?.profile?.avatar || user?.profile?.avatar || "";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const actionLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-all ${
      isActive
        ? "border-sky-200 bg-sky-50 text-sky-800"
        : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
    }`;

  const badgeClass =
    "absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-400 px-1 text-[10px] font-bold text-white shadow";

  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-10 2xl:px-14">
        <button
          type="button"
          className="flex shrink-0 items-center gap-3 text-left"
          onClick={() => navigate(accessToken ? "/home" : "/")}
        >
          <img
            src="/img/logo_badminton.jpg"
            alt="B-Hub"
            className="h-[52px] w-[52px] rounded-2xl border border-sky-100 object-cover shadow-sm"
          />
          <div className="min-w-0">
            <p className="text-[1.55rem] font-extrabold leading-none tracking-tight text-slate-900 sm:text-[1.65rem]">
              B-Hub
            </p>
            <p className="mt-1.5 hidden text-[13px] font-medium leading-snug text-slate-500 sm:block">
              Đặt sân, mua sắm, kết nối cầu lông
            </p>
          </div>
        </button>

        <div className="flex min-w-0 items-center justify-end gap-2">
          {accessToken && user ? (
            <>
              <NavLink
                to="/create-post"
                className={(state) =>
                  `${actionLinkClass(state)} hidden md:flex`
                }
                title="Đăng bài"
              >
                <CalendarPlus className="h-5 w-5 text-sky-600" />
                <span className="hidden xl:inline">Đăng bài</span>
              </NavLink>

              <NavLink
                to="/bookings"
                className={actionLinkClass}
                title="Lịch sân"
              >
                <span className="relative">
                  <CalendarCheck className="h-5 w-5 text-sky-600" />
                  {bookingCount > 0 && (
                    <span className={badgeClass}>
                      {bookingCount > 99 ? "99+" : bookingCount}
                    </span>
                  )}
                </span>
                <span className="hidden xl:inline">Lịch sân</span>
              </NavLink>

              <NavLink
                to="/orders"
                className={actionLinkClass}
                title="Đơn hàng"
              >
                <span className="relative">
                  <Package className="h-5 w-5 text-sky-600" />
                  {orderCount > 0 && (
                    <span className={badgeClass}>
                      {orderCount > 99 ? "99+" : orderCount}
                    </span>
                  )}
                </span>
                <span className="hidden xl:inline">Đơn hàng</span>
              </NavLink>

              <NavLink
                to="/messages"
                className={(state) =>
                  `${actionLinkClass(state)} hidden sm:flex`
                }
                title="Tin nhắn"
              >
                <MessageCircle className="h-5 w-5 text-sky-600" />
                <span className="hidden xl:inline">Tin nhắn</span>
              </NavLink>

              <NavLink to="/cart" className={actionLinkClass} title="Giỏ hàng">
                <span ref={cartRef} className="relative">
                  <ShoppingCart className="h-5 w-5 text-sky-600" />
                  {countCartItem > 0 && (
                    <span className={badgeClass}>
                      {countCartItem > 99 ? "99+" : countCartItem}
                    </span>
                  )}
                </span>
                <span className="hidden xl:inline">Giỏ hàng</span>
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex h-11 min-w-0 items-center gap-2 rounded-full border px-3 transition-all ${
                    isActive
                      ? "border-sky-200 bg-sky-50"
                      : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50"
                  }`
                }
                title="Hồ sơ"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-sm font-semibold text-sky-800">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarLetter
                  )}
                </div>
                <span className="hidden max-w-36 truncate text-sm font-medium text-slate-700 lg:block">
                  {displayName}
                </span>
              </NavLink>

              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={handleOpenNotifications}
                  className={`relative flex h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-all ${
                    isNotificationOpen
                      ? "border-sky-200 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
                  }`}
                  title="Thông báo"
                >
                  <Bell className="h-5 w-5 text-sky-600" />
                  {unreadCount > 0 && (
                    <span className={badgeClass}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 top-14 z-50 w-[min(92vw,420px)] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
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
                            Các cập nhật đơn hàng, lịch sân và ví sẽ hiển thị ở
                            đây.
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
                                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
                                  {notification.message}
                                </p>
                                <p className="mt-2 text-xs text-slate-400">
                                  {new Date(
                                    notification.createdDate,
                                  ).toLocaleString("vi-VN")}
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

              <button
                type="button"
                onClick={handleLogout}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="hidden rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 sm:inline-flex"
              >
                Đăng nhập
              </NavLink>
              <NavLink
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-500"
              >
                <UserRound className="h-4 w-4" />
                Đăng ký
              </NavLink>
            </div>
          )}
        </div>
      </div>

      <Navbar />
    </header>
  );
};

export default Header;
