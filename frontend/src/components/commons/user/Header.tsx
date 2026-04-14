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
    if (!accessToken || !user?.id) return;
    if (myProfile?.id) return;
    dispatch(getMyProfile());
  }, [dispatch, accessToken, user?.id, myProfile?.id]);

  const headerDisplayName =
    myProfile?.profile?.fullName?.trim() || user?.username || "Tài khoản";
  const headerAvatarUrl =
    myProfile?.profile?.avatar || user?.profile?.avatar || "";
  const headerAvatarLetter = headerDisplayName.charAt(0).toUpperCase();
  const isPostsPage = location.pathname.startsWith("/posts");

  return (
    <header className="bg-white shadow-sm">
      <div className="w-full px-4 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* LEFT - Logo + Hotline */}
        <div
          className="flex items-center gap-4 lg:gap-8 cursor-pointer shrink-0"
          onClick={() => navigate("/")}
        >
          <div className="flex items-center gap-3">
            <img
              src="/img/logo_badminton.jpg"
              alt="Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl shadow-sm object-cover"
            />

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sky-600 tracking-wide">
              B-Hub
            </h1>
          </div>

          {/* Hotline */}
          <div className="hidden xl:flex items-center gap-2 bg-sky-100 px-4 py-1.5 rounded-full">
            <span className="text-gray-700 text-sm">Hotline:</span>
            <a
              href="tel:0901234567"
              className="text-red-600 font-semibold text-sm hover:text-red-700"
            >
              0901 234 567
            </a>
          </div>
        </div>

        {/* RIGHT - ACTIONS */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Create Post */}
          <NavLink
            to="/create-post"
            className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 text-sm font-medium"
          >
            <Calendar className="w-5 h-5 text-sky-600" />
            <span className="hidden xl:inline">Đăng bài</span>
          </NavLink>

          {/* Orders */}
          <NavLink
            to="/orders"
            className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 text-sm font-medium"
          >
            <Package className="w-5 h-5 text-sky-600" />
            <span className="hidden xl:inline">Đơn hàng</span>
          </NavLink>

          {/* Messages */}
          <NavLink
            to="/messages"
            className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 text-sm font-medium"
          >
            <MessageCircle className="w-5 h-5 text-sky-600" />
            <span className="hidden xl:inline">Tin nhắn</span>
          </NavLink>

          {/* Cart */}
          <NavLink
            to="/cart"
            className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 text-sm font-medium"
          >
            <div ref={cartRef} className="relative">
              <ShoppingCart className="w-5 h-5 text-sky-600" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {countCartItem}
              </span>
            </div>
            <span className="hidden xl:inline">Giỏ hàng</span>
          </NavLink>

          {/* AUTH */}
          {!accessToken && !user ? (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-gray-700 hover:bg-gray-100 text-sm font-medium"
              >
                <LogIn className="w-5 h-5" />
                Đăng nhập
              </NavLink>

              <NavLink
                to="/register"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 text-sm font-medium"
              >
                <UserPlus className="w-5 h-5" />
                Đăng ký
              </NavLink>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <NavLink
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100"
              >
                <div className="w-9 h-9 rounded-full bg-sky-100 overflow-hidden flex items-center justify-center">
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

                <span className="hidden lg:block text-sm font-semibold text-gray-900">
                  {headerDisplayName}
                </span>
              </NavLink>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-full border text-gray-700 hover:bg-red-50 hover:text-red-600 text-sm font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {isPostsPage ? (
        <div className="group relative">
          <div className="absolute left-0 right-0 -bottom-2 h-4 z-10" />
          <div className="max-h-0 overflow-hidden opacity-0 -translate-y-2 pointer-events-none transition-all duration-200 group-hover:max-h-28 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
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
