import { Search, Languages, LogIn, UserPlus, ShoppingCart } from "lucide-react";
import { NavLink } from "react-router-dom";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <div>
      <header className="bg-white shadow-md grid grid-rows-[75%_1fr] text-gray-700">
        <div className="grid grid-cols-[1fr_2fr_3fr] gap-x-4 py-3 px-5 items-center">
          {/* Logo */}
          <img
            src="/img/logo_badminton.jpg"
            alt="Logo"
            className="w-28 h-20 rounded-md shadow-lg"
          />

          {/* Search box */}
          <div className="flex flex-row gap-2 justify-center items-center">
            <input
              type="text"
              placeholder="Xin chào, bạn cần tìm gì hôm nay?"
              className="w-[400px] px-5 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none text-gray-700"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-md shadow-md transition cursor-pointer">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Buttons */}
          <div className="flex justify-center items-center gap-8 ">
            {/* Language */}
            <button className="border border-gray-400 text-gray-600 px-4 py-2 rounded-md shadow-sm hover:bg-gray-100 transition cursor-pointer">
              <Languages />
            </button>

            <div className="flex flex-col items-center">
              <ShoppingCart />
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `text-gray-700 hover:text-red-500 ${
                    isActive ? "text-red-700 font-bold" : ""
                  }`
                }
              >
                Cart
              </NavLink>
            </div>

            {/* Login */}
            <div className="flex flex-row gap-2 items-center">
              <LogIn className="text-gray-600 group-hover:text-orange-500" />
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `transition ${
                    isActive
                      ? "text-orange-600 font-bold"
                      : "text-gray-700 hover:text-orange-500"
                  }`
                }
              >
                Login
              </NavLink>
            </div>

            {/* Register */}
            <div className="flex flex-row gap-2 items-center">
              <UserPlus className="text-gray-600" />
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `transition ${
                    isActive
                      ? "text-orange-600 font-bold"
                      : "text-gray-700 hover:text-orange-500"
                  }`
                }
              >
                Register
              </NavLink>
            </div>
          </div>
        </div>

        {/* Navbar */}
        <Navbar />
      </header>
    </div>
  );
};

export default Header;
