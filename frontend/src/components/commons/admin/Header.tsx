import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Sun, Moon, BellRing, User, Search } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/authContext";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`relative w-12 h-6 flex items-center rounded-full p-1 border transition-colors
        ${
          darkMode
            ? "bg-gray-700 border-gray-600"
            : "bg-gray-200 border-gray-300"
        }
      `}
    >
      <span
        className={`absolute flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-300
          ${darkMode ? "translate-x-6 bg-gray-900" : "translate-x-0 bg-white"}
        `}
      >
        {darkMode ? (
          <Moon size={13} className="text-white" />
        ) : (
          <Sun size={13} className="text-yellow-500" />
        )}
      </span>
    </button>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      user: { id: 0, email: "", username: "", role: "" },
    });
    localStorage.clear();
    navigate("/admin/login");
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-20 bg-white text-gray-800 border-b border-gray-300">
      <div className="flex items-center w-full max-w-md">
        <div className="flex items-center w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm transition-all focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-300">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <nav className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl text-gray-800 hover:text-sky-600 hover:bg-sky-50 transition">
          <BellRing className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <NavLink
          to="/admin/profile"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-800 font-medium hover:bg-sky-50 hover:text-sky-600 transition"
        >
          <User className="w-5 h-5" />
          <span className="hidden sm:block">{auth.user.username}</span>
        </NavLink>

        <div className="w-px h-6 bg-gray-300" />

        <ThemeToggle />

        <div className="w-px h-6 bg-gray-300" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-800 font-medium hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:block">Đăng xuất</span>
        </button>
      </nav>
    </header>
  );
};

export default Header;
