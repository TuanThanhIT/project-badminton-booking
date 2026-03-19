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
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import { logout } from "../../../redux/slices/user/authSlice";

interface HeaderProps {
  cartRef: React.RefObject<HTMLDivElement | null>; // cho phép null
}

const Header = ({ cartRef }: HeaderProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const cart = useAppSelector((state) => state.cart.cart);
  const [countCartItem, setCountCartItem] = useState(0);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    if (!cart) return;
    setCountCartItem(cart.cartItems.length);
  }, [cart]);

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
              {/* <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {countBookingItems}
              </span> */}
            </div>
            <span>Lịch sân</span>
          </NavLink>

          <NavLink
            to="/orders"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-base font-medium"
          >
            <div className="relative">
              <Package className="w-6 h-6 text-sky-600" />
              {/* <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {countOrderItems}
              </span> */}
            </div>
            <span>Đơn hàng</span>
          </NavLink>

          {/* Cart */}
          <NavLink
            to="/cart"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-base font-medium"
          >
            <div ref={cartRef} className="relative">
              <ShoppingCart className="w-6 h-6 text-sky-600" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {countCartItem}
              </span>
            </div>
            <span>Giỏ hàng</span>
          </NavLink>

          {!token && !user ? (
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
                {user?.username}
              </NavLink>

              {/* Notification Icon + Popup */}
              <div className="relative">
                <button
                  // onClick={toggleNotifications}
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

                  {/* {unreadCount > 0 && (
                    <span className="absolute -top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                      {unreadCount}
                    </span>
                  )} */}
                </button>

                {/* Popup thông báo */}
                {isOpen && (
                  <div className="absolute -right-20 mt-2 w-80 bg-white shadow-xl rounded-xl overflow-hidden z-50 border border-gray-200">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300">
                      <p className="font-medium text-gray-700">Thông báo</p>
                      <button
                        // onClick={markReadAll}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {/* {notifications.length === 0 && (
                        <p className="p-4 text-gray-500 text-sm text-center">
                          Không có thông báo
                        </p>
                      )} */}
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
