import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Calendar,
  Contact,
  Home,
  Info,
  Menu,
  MessageSquareText,
  Store,
  X,
} from "lucide-react";
import CategoryMenu from "../../ui/user/category/CategoryMenu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group relative flex h-11 items-center gap-2 rounded-full px-[18px] text-[15px] font-medium leading-none transition-all whitespace-nowrap after:absolute after:left-[18px] after:right-[18px] after:bottom-2.5 after:h-[2px] after:rounded-full after:transition-all ${
      isActive
        ? "text-yellow-200 after:bg-yellow-200"
        : "text-white after:bg-transparent hover:text-yellow-100"
    }`;

  const iconClass = ({ isActive }: { isActive: boolean }) =>
    `h-5 w-5 ${
      isActive ? "text-yellow-200" : "text-white group-hover:text-yellow-100"
    }`;

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="max-w-full overflow-x-hidden border-t border-sky-600 bg-sky-700">
      <div className="w-full px-3 sm:px-5 lg:px-8 2xl:px-12">
        <div className="flex items-center justify-between py-2 lg:hidden">
          <span className="text-sm font-semibold text-white">Menu</span>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/15"
            title="Mở menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <ul
          className={`${
            isOpen ? "flex" : "hidden"
          } max-w-full flex-col gap-1 pb-2.5 lg:flex lg:min-h-[54px] lg:flex-row lg:items-center lg:justify-center lg:gap-2.5 lg:pb-0`}
        >
          <li>
            <NavLink to="/" className={linkClass} onClick={closeMenu}>
              {({ isActive }) => (
                <>
                  <Home className={iconClass({ isActive })} />
                  Trang chủ
                </>
              )}
            </NavLink>
          </li>

          <li>
            <CategoryMenu />
          </li>

          <li>
            <NavLink to="/branches" className={linkClass} onClick={closeMenu}>
              {({ isActive }) => (
                <>
                  <Store className={iconClass({ isActive })} />
                  Chi nhánh
                </>
              )}
            </NavLink>
          </li>

          <li>
            <NavLink to="/courts" className={linkClass} onClick={closeMenu}>
              {({ isActive }) => (
                <>
                  <Calendar className={iconClass({ isActive })} />
                  Đặt sân
                </>
              )}
            </NavLink>
          </li>

          <li>
            <NavLink to="/posts" className={linkClass} onClick={closeMenu}>
              {({ isActive }) => (
                <>
                  <MessageSquareText className={iconClass({ isActive })} />
                  Thảo luận
                </>
              )}
            </NavLink>
          </li>

          <li>
            <NavLink to="/contact" className={linkClass} onClick={closeMenu}>
              {({ isActive }) => (
                <>
                  <Contact className={iconClass({ isActive })} />
                  Liên hệ
                </>
              )}
            </NavLink>
          </li>

          <li>
            <NavLink to="/about" className={linkClass} onClick={closeMenu}>
              {({ isActive }) => (
                <>
                  <Info className={iconClass({ isActive })} />
                  Giới thiệu
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
