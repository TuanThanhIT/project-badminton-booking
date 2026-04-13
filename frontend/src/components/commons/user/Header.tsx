import {
  LogIn,
  UserPlus,
  ShoppingCart,
  LogOut,
  Package,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import { logout, logoutLocal } from "../../../redux/slices/user/authSlice";
import { getMyProfile } from "../../../redux/slices/user/profileSlice";

interface HeaderProps {
  cartRef: React.RefObject<HTMLDivElement | null>; // cho phép null
}

const Header = ({ cartRef }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const myProfile = useAppSelector((state) => state.profile.myProfile);
  const cart = useAppSelector((state) => state.cart.cart);
  const [countCartItem, setCountCartItem] = useState(0);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(logoutLocal());
    navigate("/login");
  };

  useEffect(() => {
    if (!cart) return;
    setCountCartItem(cart.cartItems.length);
  }, [cart]);

  useEffect(() => {
    // Đồng bộ avatar/fullName cho header qua profile slice (thunk)
    if (!accessToken || !user?.id) return;
      if (myProfile?.id) return;
      dispatch(getMyProfile());
  }, [dispatch, accessToken, user?.id, myProfile?.id]);

  const headerDisplayName =
    myProfile?.profile?.fullName?.trim() || user?.username || "Tài khoản";
  const headerAvatarUrl = myProfile?.profile?.avatar || user?.profile?.avatar || "";
  const headerAvatarLetter = headerDisplayName.charAt(0).toUpperCase();
  const isPostsPage = location.pathname.startsWith("/posts");

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto w-full max-w-screen-2xl px-3 py-3 sm:px-4 lg:px-6 flex items-center justify-between gap-3 flex-wrap">
        {/* Logo + Hotline */}
        <div
          className="flex items-center gap-3 sm:gap-6 lg:gap-10 cursor-pointer shrink-0"
          onClick={() => navigate("/")}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="/img/logo_badminton.jpg"
              alt="Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl shadow-sm"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-sky-600 tracking-wide leading-none">
              B-Hub
            </h1>
          </div>

          <div className="hidden xl:flex items-center gap-2 bg-sky-100 px-4 py-2 rounded-full shadow-sm">
            <span className="text-gray-700 font-medium text-sm 2xl:text-base">
              Hotline:
            </span>
            <a
              href="tel:0901234567"
              className="text-red-600 font-semibold text-sm 2xl:text-base hover:text-red-700"
            >
              0901 234 567
            </a>
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
          <NavLink
            to="/create-post"
            className="flex items-center gap-2 px-2.5 sm:px-3 lg:px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-sm lg:text-base font-medium"
          >
            <div className="relative">
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-sky-600" />
              {/* <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {countBookingItems}
              </span> */}
            </div>
            <span className="hidden xl:inline">Đăng bài</span>
          </NavLink>

          <NavLink
            to="/orders"
            className="flex items-center gap-2 px-2.5 sm:px-3 lg:px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-sm lg:text-base font-medium"
          >
            <div className="relative">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-sky-600" />
              {/* <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {countOrderItems}
              </span> */}
            </div>
            <span className="hidden xl:inline">Đơn hàng</span>
          </NavLink>

          <NavLink
            to="/messages"
            className="flex items-center gap-2 px-2.5 sm:px-3 lg:px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-sm lg:text-base font-medium"
          >
            <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 text-sky-600" />
            <span className="hidden xl:inline">Tin nhắn</span>
          </NavLink>

          {/* Cart */}
          <NavLink
            to="/cart"
            className="flex items-center gap-2 px-2.5 sm:px-3 lg:px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-sm lg:text-base font-medium"
          >
            <div ref={cartRef} className="relative">
              <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-sky-600" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {countCartItem}
              </span>
            </div>
            <span className="hidden xl:inline">Giỏ hàng</span>
          </NavLink>

          {!accessToken && !user ? (
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
                className="flex items-center gap-2 px-2.5 sm:px-3 lg:px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-sm lg:text-base font-medium min-w-0"
              >
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-sky-100 overflow-hidden flex items-center justify-center shrink-0">
                  {headerAvatarUrl ? (
                    <img
                      src={headerAvatarUrl}
                      alt={headerDisplayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sky-700 font-semibold">
                      {headerAvatarLetter}
                    </span>
                  )}
                </div>
                <div className="hidden lg:flex flex-col leading-tight min-w-0">
                  <span className="text-sm font-semibold text-gray-900 max-w-[160px] truncate">
                    {headerDisplayName}
                  </span>
                  <span className="text-xs text-gray-500">@{user?.username}</span>
                </div>
              </NavLink>

              {/* Notification Icon + Popup */}
              <div className="relative">
                <button
                  onClick={() => setIsOpen((prev) => !prev)}
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
                className="flex items-center gap-2 px-2.5 sm:px-3 lg:px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 transition text-sm lg:text-base font-medium"
              >
                <LogOut className="w-5 h-5 lg:w-6 lg:h-6" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {isPostsPage ? (
        <div className="group relative">
          {/* Vung kich hoat: chi can re chuot vao mep duoi header la navbar hien */}
          <div className="absolute left-0 right-0 -bottom-2 h-4 z-10" />
          <div className="max-h-0 overflow-hidden opacity-0 -translate-y-2 pointer-events-none transition-all duration-200 ease-out group-hover:max-h-28 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:max-h-28 group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto">
            <Navbar />
          </div>
        </div>
      ) : (
        <Navbar />
      )}
    </header>
  );
};

export default Header;
