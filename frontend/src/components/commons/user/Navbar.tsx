import { NavLink } from "react-router-dom";
import {
  Calendar,
  Contact,
  History,
  Home,
  Info,
  Store,
  Menu,
  X,
} from "lucide-react";
import CategoryMenu from "../../ui/user/category/CategoryMenu";
import { useAppSelector } from "../../../redux/hook";
import { useState } from "react";

const Navbar = () => {
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
    ${
      isActive
        ? "text-white underline underline-offset-4 decoration-2 decoration-white"
        : "text-white hover:bg-sky-500/40"
    }`;

  const iconClass = ({ isActive }: { isActive: boolean }) =>
    `w-5 h-5 ${isActive ? "text-white" : "text-white group-hover:text-white"}`;

  return (
    <nav className="relative bg-gradient-to-r from-sky-600 to-sky-700 shadow-lg">
      {/* CONTAINER */}
      <div className="max-w-screen-xl mx-auto">
        {/* MOBILE HEADER */}
        <div className="lg:hidden flex justify-between items-center px-4 py-3">
          <span className="text-white font-semibold text-lg">Menu</span>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white hover:bg-sky-500/40 p-2 rounded-lg transition"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* MENU */}
        <ul
          className={`
          flex flex-col lg:flex-row
          items-start lg:items-center
          justify-start lg:justify-center
          gap-4 lg:gap-8
          px-6 lg:px-4
          py-4 lg:py-3
          min-h-[64px]
          transition-all duration-300

          ${isOpen ? "flex" : "hidden"}
          lg:flex
        `}
        >
          {/* Trang chủ */}
          <li>
            {!accessToken && !user ? (
              <NavLink to="/" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Home className={iconClass({ isActive })} />
                    TRANG CHỦ
                  </>
                )}
              </NavLink>
            ) : (
              <NavLink to="/home" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Home className={iconClass({ isActive })} />
                    TRANG CHỦ
                  </>
                )}
              </NavLink>
            )}
          </li>

          {/* Sản phẩm */}
          <li>
            <CategoryMenu />
          </li>

          {/* Hệ thống cửa hàng */}
          <li>
            <NavLink to="/branches" className={linkClass}>
              {({ isActive }) => (
                <>
                  <Store className={iconClass({ isActive })} />
                  CỬA HÀNG
                </>
              )}
            </NavLink>
          </li>

          {/* Đặt sân */}
          <li>
            <NavLink to="/booking" className={linkClass}>
              {({ isActive }) => (
                <>
                  <Calendar className={iconClass({ isActive })} />
                  ĐẶT SÂN
                </>
              )}
            </NavLink>
          </li>

          {/* Thảo luận */}
          <li>
            <NavLink to="/posts" className={linkClass}>
              {({ isActive }) => (
                <>
                  <History className={iconClass({ isActive })} />
                  THẢO LUẬN
                </>
              )}
            </NavLink>
          </li>

          {/* Liên hệ */}
          <li>
            <NavLink to="/contact" className={linkClass}>
              {({ isActive }) => (
                <>
                  <Contact className={iconClass({ isActive })} />
                  LIÊN HỆ
                </>
              )}
            </NavLink>
          </li>

          {/* Giới thiệu */}
          <li>
            <NavLink to="/about" className={linkClass}>
              {({ isActive }) => (
                <>
                  <Info className={iconClass({ isActive })} />
                  GIỚI THIỆU
                </>
              )}
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
