import {
  Search,
  Languages,
  LogIn,
  UserPlus,
  ShoppingCart,
  LogOut,
  User,
  Package,
  Calendar,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useContext } from "react";
import { AuthContext } from "../../contexts/authContext";

const Header = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-8 py-4">
        {/* Logo + Hotline */}
        <div
          className="flex items-center gap-20 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="flex items-center gap-3">
            <img
              src="/img/logo_badminton.jpg"
              alt="Logo"
              className="w-12 h-12 rounded-xl shadow-sm"
            />
            <h1 className="text-2xl font-bold text-sky-600 tracking-wide">
              B-Hub
            </h1>
          </div>

          {/* Hotline nổi bật */}
          <div className="hidden md:flex items-center gap-2 bg-sky-100 px-3 py-1 rounded-full shadow-sm">
            <span className="text-gray-700 font-normal">Hotline:</span>
            <a
              href="tel:0901234567"
              className="text-red-600 font-bold text-sm hover:text-red-700"
            >
              0901 234 567
            </a>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 shadow-inner w-[400px] border border-gray-200">
          <input
            type="text"
            placeholder="Tìm sân hoặc dụng cụ..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
          <button className="ml-2 p-2 rounded-full bg-sky-500 hover:bg-sky-600 transition">
            <Search className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <NavLink
            to="/bookings"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-gray-700 hover:bg-gray-100 transition text-sm font-medium"
          >
            <Calendar className="w-5 h-5 text-sky-600" />
            <span>Lịch sân</span>
          </NavLink>

          <NavLink
            to="/orders"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-gray-700 hover:bg-gray-100 transition text-sm font-medium"
          >
            <Package className="w-5 h-5 text-sky-600" />
            <span>Đơn hàng</span>
          </NavLink>

          {/* Giỏ hàng */}
          <NavLink
            to="/cart"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-gray-700 hover:bg-gray-100 transition text-sm font-medium"
          >
            <ShoppingCart className="w-5 h-5 text-sky-600" />
            Giỏ hàng
          </NavLink>

          {/* Auth */}
          {!auth.isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NavLink
                to="/login"
                className="flex items-center gap-1 px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm font-medium"
              >
                <LogIn className="w-5 h-5" />
                Đăng nhập
              </NavLink>
              <NavLink
                to="/register"
                className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition text-sm font-medium shadow-sm"
              >
                <UserPlus className="w-5 h-5" />
                Đăng ký
              </NavLink>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink
                to="/profile"
                className="flex items-center gap-1 px-4 py-1.5 rounded-full text-gray-700 hover:bg-gray-100 transition text-sm font-medium"
              >
                <User className="w-5 h-5 text-sky-600" />
                {auth?.user?.username}
              </NavLink>
              <button
                onClick={() => {
                  localStorage.clear(); // Xóa toàn bộ
                  setAuth({
                    isAuthenticated: false,
                    user: { id: 0, email: "", username: "" },
                  });
                  navigate("/login");
                }}
                className="flex items-center gap-1 px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 transition text-sm font-medium"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navbar dưới */}
      <Navbar />
    </header>
  );
};

export default Header;
