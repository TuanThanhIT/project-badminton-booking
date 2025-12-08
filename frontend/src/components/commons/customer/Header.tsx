import {
  LogIn,
  UserPlus,
  ShoppingCart,
  LogOut,
  Package,
  Calendar,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/authContext";
import { useAppDispatch, useAppSelector } from "../../../store/hook";
import { clearCart, fetchCart } from "../../../store/slices/customer/cartSlice";
import {
  clearOrders,
  getOrders,
} from "../../../store/slices/customer/orderSlice";
import {
  clearBookings,
  getBookings,
} from "../../../store/slices/customer/bookingSlice";
import { useRealtime } from "../../../hooks/useRealtime";
import { toast } from "react-toastify";
import {
  addLocalNotification,
  clearNotificationError,
  getNotifications,
  updateAllLocalNotification,
  updateAllNotification,
  updateLocalNotification,
  updateNotification,
} from "../../../store/slices/customer/notificationSlice";

const Header = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationId, setNotificationId] = useState(0);

  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.cart);
  const orders = useAppSelector((state) => state.order.orders);
  const bookings = useAppSelector((state) => state.booking.bookings);

  const notifications = useAppSelector(
    (state) => state.notification.notifications
  );
  const notificationError = useAppSelector((state) => state.notification.error);

  const token = localStorage.getItem("access_token");
  const { notification } = useRealtime(token ?? "");
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Hàm toggle hiển thị popup
  const toggleNotifications = () => setIsOpen(!isOpen);

  const ods = orders.filter(
    (order) =>
      order.orderStatus === "Pending" ||
      order.orderStatus === "Paid" ||
      order.orderStatus === "Confirmed"
  );

  const bks = bookings.filter(
    (booking) =>
      booking.bookingStatus === "Pending" ||
      booking.bookingStatus === "Paid" ||
      booking.bookingStatus === "Confirmed"
  );

  const countCartItems = cart?.cartItems.length || 0;
  const countOrderItems = ods.length;
  const countBookingItems = bks.length;

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (!notification) return;
    dispatch(addLocalNotification({ notification }));
  }, [dispatch, notification]);

  useEffect(() => {
    const error = notificationError;
    if (error) {
      toast.error(error);

      if (notificationError) {
        const data = { notificationId };
        dispatch(updateLocalNotification(data));
        dispatch(clearNotificationError());
      }
    }
  }, [dispatch, notificationError, notificationId]);

  const handleLogout = () => {
    dispatch(clearCart());
    dispatch(clearOrders());
    dispatch(clearBookings());

    setAuth({
      isAuthenticated: false,
      user: { id: 0, email: "", username: "", role: "" },
    });

    localStorage.clear();
    localStorage.removeItem("persist:root");
    navigate("/login");
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      dispatch(fetchCart());
      dispatch(getOrders());
      dispatch(getBookings());
    }
  }, [auth.isAuthenticated, dispatch]);

  const markRead = async (notificationId: number) => {
    try {
      setNotificationId(notificationId);
      const data = { notificationId };
      dispatch(updateLocalNotification(data));
      const res = await dispatch(updateNotification({ data })).unwrap();
      toast.success(res.message);
    } catch {
      // không xử lý lỗi ở đây
    }
  };

  const markReadAll = async () => {
    try {
      dispatch(updateAllLocalNotification());
      const res = await dispatch(updateAllNotification()).unwrap();
      toast.success(res.message);
    } catch {
      // không xử lý lỗi ở đây
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-10 py-5">
        {/* Logo + Hotline */}
        <div
          className="flex items-center gap-24 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="flex items-center gap-4">
            <img
              src="/img/logo_badminton.jpg"
              alt="Logo"
              className="w-14 h-14 rounded-xl shadow-sm"
            />
            <h1 className="text-3xl font-bold text-sky-600 tracking-wide">
              B-Hub
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-sky-100 px-4 py-2 rounded-full shadow-sm">
            <span className="text-gray-700 font-medium text-base">
              Hotline:
            </span>
            <a
              href="tel:0901234567"
              className="text-red-600 font-semibold text-base hover:text-red-700"
            >
              0901 234 567
            </a>
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center">
          <NavLink
            to="/bookings"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-base font-medium"
          >
            <div className="relative">
              <Calendar className="w-6 h-6 text-sky-600" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {countBookingItems}
              </span>
            </div>
            <span>Lịch sân</span>
          </NavLink>

          <NavLink
            to="/orders"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-base font-medium"
          >
            <div className="relative">
              <Package className="w-6 h-6 text-sky-600" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {countOrderItems}
              </span>
            </div>
            <span>Đơn hàng</span>
          </NavLink>

          {/* Cart */}
          <NavLink
            to="/cart"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-base font-medium"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-sky-600" />

              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {countCartItems}
              </span>
            </div>
            <span>Giỏ hàng</span>
          </NavLink>

          {!auth.isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NavLink
                to="/login"
                className="flex items-center gap-2 px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-base font-medium"
              >
                <LogIn className="w-6 h-6" />
                Đăng nhập
              </NavLink>

              <NavLink
                to="/register"
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition text-base font-medium shadow"
              >
                <UserPlus className="w-6 h-6" />
                Đăng ký
              </NavLink>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink
                to="/profile"
                className="flex items-center gap-2 px-5 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-base font-medium"
              >
                <UserPlus className="w-6 h-6 text-sky-600" />
                {auth.user.username}
              </NavLink>

              {/* Notification Icon + Popup */}
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="relative p-2 rounded-full hover:bg-white/20 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-sky-600" // ✔ đổi sang màu sky
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C8.67 6.165 7 8.388 7 11v3.159c0 .538-.214 1.055-.595 1.436L5 17h5m0 0v1a3 3 0 006 0v-1m-6 0h6"
                    />
                  </svg>

                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-md">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Popup thông báo */}
                {isOpen && (
                  <div className="absolute -right-20 mt-2 w-80 bg-white shadow-xl rounded-xl overflow-hidden z-50 border border-gray-200">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300">
                      <p className="font-medium text-gray-700">Thông báo</p>
                      <button
                        onClick={markReadAll}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 && (
                        <p className="p-4 text-gray-500 text-sm text-center">
                          Không có thông báo
                        </p>
                      )}

                      {notifications.map((n, idx) => {
                        const isUnread = !n.isRead;

                        return (
                          <div
                            key={idx}
                            onClick={
                              isUnread ? () => markRead(n.id) : undefined
                            }
                            className={`
                      flex flex-col gap-1 px-4 py-3 transition group relative border-b border-gray-300
                      ${
                        isUnread
                          ? "cursor-pointer bg-sky-50 hover:bg-sky-100"
                          : "cursor-default bg-white"
                      }
                    `}
                          >
                            {isUnread && (
                              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                              </div>
                            )}

                            {!isUnread && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}

                            <div className={isUnread ? "ml-4" : "ml-0"}>
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                                {n.title || "Thông báo"}
                              </p>
                              <p className="text-xs text-gray-600">
                                {n.message}
                              </p>
                              <span className="text-xs text-gray-400">
                                {new Date(n.createdDate).toLocaleString(
                                  "vi-VN",
                                  {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 transition text-base font-medium"
              >
                <LogOut className="w-6 h-6" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <Navbar />
    </header>
  );
};

export default Header;
