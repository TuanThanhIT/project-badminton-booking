import { NavLink } from "react-router-dom";
import { Calendar, Contact, History, Home, Info } from "lucide-react";
import CategoryMenu from "../../ui/user/CategoryMenu";
import { useAppSelector } from "../../../redux/hook";

const Navbar = () => {
  const { accessToken, user } = useAppSelector((state) => state.auth);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
   ${
     isActive
       ? "text-white underline underline-offset-4 decoration-2 decoration-white"
       : "text-white hover:text-white hover:bg-sky-500/40"
   }`;

  const iconClass = ({ isActive }: { isActive: boolean }) =>
    `w-5 h-5 transition-colors duration-200 ${
      isActive ? "text-white" : "text-white group-hover:text-white"
    }`;

  return (
    <nav className="relative bg-gradient-to-r from-sky-600 to-sky-700 shadow-lg">
      <ul className="flex flex-wrap justify-center items-center gap-6 py-3">
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

        {/* Sản phẩm (thay bằng CategoryMenu) */}
        <li>
          <CategoryMenu />
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

        {/* Bài đăng (feed) */}
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
    </nav>
  );
};

export default Navbar;
