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
import { useContext, useEffect } from "react";
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

const Header = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.cart);
  const orders = useAppSelector((state) => state.order.orders);
  const bookings = useAppSelector((state) => state.booking.bookings);

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
        <div className="flex items-center gap-5">
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
            <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-4">
              <NavLink
                to="/profile"
                className="flex items-center gap-2 px-5 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-base font-medium"
              >
                <UserPlus className="w-6 h-6 text-sky-600" />
                {auth.user.username}
              </NavLink>

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
