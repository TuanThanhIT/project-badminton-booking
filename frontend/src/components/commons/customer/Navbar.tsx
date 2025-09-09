import { NavLink } from "react-router-dom";
import { Calendar, Contact, History, Home, Info, Package } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="p-2 text-center bg-green-700 shadow-md">
      <ul className="flex justify-center items-center gap-10 list-none m-0 p-0 text-base font-medium">
        {/* Home */}
        <li>
          <NavLink
            to="/customer/home"
            className={({ isActive }) =>
              `flex items-center gap-1 transition ${
                isActive
                  ? "text-yellow-300 font-semibold underline underline-offset-4"
                  : "text-white hover:text-orange-300"
              }`
            }
          >
            <Home className="w-5 h-5" />
            Home
          </NavLink>
        </li>

        {/* Product */}
        <li>
          <NavLink
            to="/customer/product"
            className={({ isActive }) =>
              `flex items-center gap-1 transition ${
                isActive
                  ? "text-yellow-300 font-semibold underline underline-offset-4"
                  : "text-white hover:text-orange-300"
              }`
            }
          >
            <Package className="w-5 h-5" />
            Product
          </NavLink>
        </li>

        {/* Booking */}
        <li>
          <NavLink
            to="/customer/booking"
            className={({ isActive }) =>
              `flex items-center gap-1 transition ${
                isActive
                  ? "text-yellow-300 font-semibold underline underline-offset-4"
                  : "text-white hover:text-orange-300"
              }`
            }
          >
            <Calendar className="w-5 h-5" />
            Booking
          </NavLink>
        </li>

        {/* History */}
        <li>
          <NavLink
            to="/customer/history"
            className={({ isActive }) =>
              `flex items-center gap-1 transition ${
                isActive
                  ? "text-yellow-300 font-semibold underline underline-offset-4"
                  : "text-white hover:text-orange-300"
              }`
            }
          >
            <History className="w-5 h-5" />
            History
          </NavLink>
        </li>

        {/* Contact */}
        <li>
          <NavLink
            to="/customer/contact"
            className={({ isActive }) =>
              `flex items-center gap-1 transition ${
                isActive
                  ? "text-yellow-300 font-semibold underline underline-offset-4"
                  : "text-white hover:text-orange-300"
              }`
            }
          >
            <Contact className="w-5 h-5" />
            Contact
          </NavLink>
        </li>

        {/* About */}
        <li>
          <NavLink
            to="/customer/about"
            className={({ isActive }) =>
              `flex items-center gap-1 transition ${
                isActive
                  ? "text-yellow-300 font-semibold underline underline-offset-4"
                  : "text-white hover:text-orange-300"
              }`
            }
          >
            <Info className="w-5 h-5" />
            About
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
