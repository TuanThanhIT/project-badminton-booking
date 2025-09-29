import { NavLink } from "react-router-dom";
import {
  CircleUserRound,
  Settings,
  LogOut,
  Sun,
  Moon,
  BellRing,
  Search,
} from "lucide-react";
import { useState } from "react";
const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`relative w-12 h-6 flex items-center rounded-full p-1 border-1 border-gray-700 transition-colors ${
        darkMode ? "bg-gray-600" : "bg-gray-200"
      } hover:border-blue-500`}
    >
      <span
        className={`absolute flex left-0 items-center justify-center w-5 h-5 rounded-full transition-transform duration-300 ${
          darkMode ? "translate-x-6.5 bg-black" : "translate-x-0 bg-gray-100"
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
const SearchBar = () => {
  return (
    <button className="flex items-center w-full max-w-md border-solid rounded-lg px-3 py-2 bg-white shadow-sm hover:border-blue-500 hover:border">
      <Search className="w-5 h-5 text-gray-800 mr-2"></Search>
      <label className=" outline-none text-gray-700 text-gray-400">
        Search your page...
      </label>
      <div className="ml-auto px-2 py-1 text-xs front-medium bg-gray-100 text-gray-600 rounded-md border">
        Search
      </div>
    </button>
  );
};
const Header = () => {
  return (
    <div>
      <header className="flex justify-between items-center p-4 bg-white shadow ">
        {/* <h1 className="text-xl font-bold text-blue-600">
          The Logo will be there
        </h1> */}
        <SearchBar />
        <nav className="flex items-center space-x-4">
          <div className="">
            <NavLink
              to="/#"
              className={({ isActive }) =>
                `group flex items-center gap-2 transition-colors ${
                  isActive
                    ? "text-blue-700"
                    : "text-gray-700 hover:text-blue-600"
                }`
              }
            >
              <BellRing className="w-6 h-6 group-hover:animate-bounce group-hover:text-blue-600" />
              <span>Notification</span>
            </NavLink>
          </div>
          <div className="">
            <NavLink
              to="/#"
              className={({ isActive }) =>
                `flex items-center gap-2 transition-colors ${
                  isActive
                    ? "text-blue-700"
                    : "text-gray-700 hover:text-blue-600"
                }`
              }
            >
              <CircleUserRound />
              <span>Edit PF</span>
            </NavLink>
          </div>
          <div className="">
            <NavLink
              to="/#"
              className={({ isActive }) =>
                `group flex items-center gap-2 transition-colors ${
                  isActive
                    ? "text-blue-700"
                    : "text-gray-700 hover:text-blue-600"
                }`
              }
            >
              <Settings className="w-6 h-6 text-gray-700 group-hover:animate-spin group-hover:text-blue-600" />
              <span>Setting</span>
            </NavLink>
          </div>
          <div className="">
            <NavLink
              to="/#"
              className={({ isActive }) =>
                `flex items-center gap-2 transition-colors ${
                  isActive
                    ? "text-blue-700"
                    : "text-gray-700 hover:text-blue-600"
                }`
              }
            >
              <LogOut />
              <span>Logout</span>
            </NavLink>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-px h-6 bg-gray-400"></div>
            <ThemeToggle />
            <div className="w-px h-6 bg-gray-400"></div>
          </div>
        </nav>
      </header>
    </div>
  );
};
export default Header;
