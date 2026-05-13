import { type RefObject, useEffect, useState } from "react";
import {
  CalendarPlus,
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
import { getUserOrders } from "../../../redux/slices/user/orderSlice";
import { getMyProfile } from "../../../redux/slices/user/profileSlice";

interface HeaderProps {
  cartRef: RefObject<HTMLDivElement | null>;
}

const Header = ({ cartRef }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, accessToken } = useAppSelector((state) => state.auth);
  const myProfile = useAppSelector((state) => state.profile.myProfile);
  const cart = useAppSelector((state) => state.cart.cart);
  const { userOrderPagination } = useAppSelector((state) => state.order);

  const [countCartItem, setCountCartItem] = useState(0);
  const orderCount = userOrderPagination?.total || 0;

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
  }, [dispatch, accessToken]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(logoutLocal());
    navigate("/login");
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
                className={(state) => `${actionLinkClass(state)} hidden md:flex`}
                title="Đăng bài"
              >
                <CalendarPlus className="h-5 w-5 text-sky-600" />
                <span className="hidden xl:inline">Đăng bài</span>
              </NavLink>

              <NavLink to="/orders" className={actionLinkClass} title="Đơn hàng">
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
                className={(state) => `${actionLinkClass(state)} hidden sm:flex`}
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
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    avatarLetter
                  )}
                </div>
                <span className="hidden max-w-36 truncate text-sm font-medium text-slate-700 lg:block">
                  {displayName}
                </span>
              </NavLink>

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
