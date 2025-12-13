import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  UsersRound,
  ChevronFirst,
  ChevronLast,
  Grid2X2,
  Rows3,
  Percent,
} from "lucide-react";
import { useContext } from "react";
import { SideBarContext } from "../../contexts/sidebarContext";
import { SidebarElement } from "./SidebarElement";

const Sidebar = () => {
  const { expanded, setExpanded } = useContext(SideBarContext)!;

  return (
    <aside className="h-screen bg-white border-r border-gray-200 overflow-hidden">
      <nav className="h-full flex flex-col">
        {/* LOGO + TOGGLE */}
        <div className="flex items-center justify-between px-3 py-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              src="/img/logo_badminton.jpg"
              alt="logo"
              className={`transition-all duration-300 rounded-xl border ${
                expanded ? "w-12 h-12" : "w-10 h-10"
              }`}
            />
            {expanded && (
              <span className="text-lg font-bold text-blue-600 whitespace-nowrap">
                B-Hub
              </span>
            )}
          </div>

          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        {/* MENU */}
        <ul className="px-3 space-y-1">
          <NavLink to="/admin" end>
            {({ isActive }) => (
              <SidebarElement
                icon={LayoutDashboard}
                text="Dashboard"
                active={isActive}
              />
            )}
          </NavLink>

          <NavLink to="/admin/products">
            {({ isActive }) => (
              <SidebarElement
                icon={Package}
                text="Quản lý sản phẩm"
                active={isActive}
              />
            )}
          </NavLink>

          <NavLink to="/admin/categories">
            {({ isActive }) => (
              <SidebarElement
                icon={Grid2X2}
                text="Quản lý danh mục"
                active={isActive}
              />
            )}
          </NavLink>

          <NavLink to="/admin/users">
            {({ isActive }) => (
              <SidebarElement
                icon={UsersRound}
                text="Quản lý người dùng"
                active={isActive}
              />
            )}
          </NavLink>

          <NavLink to="/admin/courts">
            {({ isActive }) => (
              <SidebarElement
                icon={Rows3}
                text="Quản lý sân"
                active={isActive}
              />
            )}
          </NavLink>

          <NavLink to="/admin/discount">
            {({ isActive }) => (
              <SidebarElement
                icon={Percent}
                text="Quản lý khuyến mãi"
                active={isActive}
              />
            )}
          </NavLink>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
