import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Sun, Moon, BellRing, UserPlus, Search } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/authContext";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`relative w-12 h-6 flex items-center rounded-full p-1 border transition-colors ${
        darkMode ? "bg-gray-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-300 ${
          darkMode ? "translate-x-6.5 bg-black" : "translate-x-0 bg-white"
        }`}
      >
        {darkMode ? (
          <Moon size={14} className="text-white" />
        ) : (
          <Sun size={14} className="text-gray-600" />
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
    localStorage.removeItem("persist:root");
    navigate("/admin/login");
  };

  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white shadow">
      {/* LEFT */}
      <div className="flex items-center w-full max-w-md">
        <div
          className="
      flex items-center w-full
      px-4 py-2.5
      bg-white
      border border-gray-200
      rounded-xl
      shadow-sm
      transition-all
      focus-within:border-sky-500
      focus-within:shadow-md
    "
        >
          <Search className="w-5 h-5 text-gray-500 mr-3" />

          <input
            type="text"
            placeholder="Tìm kiếm nhanh trong trang..."
            className="
        flex-1
        text-sm
        text-gray-700
        placeholder-gray-400
        outline-none
        bg-transparent
      "
          />

          <div
            className="
        ml-3
        px-2 py-1
        text-xs font-medium
        bg-gray-100
        text-gray-600
        rounded-md
        border
        select-none
      "
          >
            Tìm kiếm
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <nav className="flex items-center space-x-4">
        <NavLink
          to="/#"
          className="group flex items-center gap-2 text-gray-700 hover:text-sky-600"
        >
          <BellRing className="w-6 h-6 group-hover:animate-bounce" />
          <span className="font-medium">Thông báo</span>
        </NavLink>

        <NavLink
          to="/admin/profile"
          className="group flex items-center gap-2 text-gray-700 hover:text-sky-600"
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-medium">{auth.user.username}</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-700 hover:text-sky-600"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        <div className="flex items-center gap-3">
          <div className="w-px h-6 bg-gray-300" />
          <ThemeToggle />
          <div className="w-px h-6 bg-gray-300" />
        </div>
      </nav>
    </header>
  );
};

export default Header;
