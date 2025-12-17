// Sidebar.tsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  UsersRound,
  ChevronFirst,
  ChevronLast,
  Grid2X2,
  Rows3,
<<<<<<< HEAD
  Percent,
  ListOrdered,
  Calendar,
  DollarSign,
=======
  Wine,
  Briefcase,
>>>>>>> dev_admin_thaitoan
} from "lucide-react";
import { useContext } from "react";
import { SideBarContext } from "../../contexts/sidebarContext";
import { SidebarElement } from "./SidebarElement";

const Sidebar = () => {
  const { expanded, setExpanded } = useContext(SideBarContext)!;

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-300 transition-all duration-300 ${
        expanded ? "w-full" : "w-20"
      }`}
    >
      <nav className="h-full flex flex-col">
        {/* LOGO + TOGGLE */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/img/logo_badminton.jpg"
              alt="logo"
              className={`transition-all duration-300 rounded-xl border ${
                expanded ? "w-12 h-12" : "w-10 h-10"
              }`}
            />
            {expanded && (
              <span className="text-lg font-extrabold text-sky-600 tracking-wide">
                B-Hub Admin
              </span>
            )}
          </div>

          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-2 rounded-lg hover:bg-sky-50 text-sky-600 transition"
          >
            {expanded ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
          </button>
        </div>
<<<<<<< HEAD

        {/* MENU */}
        <ul className="flex-1 px-3 py-4 space-y-1">
          <NavLink to="/admin/dashboard" end>
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
          <NavLink to="/admin/order">
            {({ isActive }) => (
              <SidebarElement
                icon={ListOrdered}
                text="Quản lý đơn hàng"
                active={isActive}
              />
            )}
          </NavLink>
          <NavLink to="/admin/booking">
            {({ isActive }) => (
              <SidebarElement
                icon={Calendar}
                text="Quản lý đặt sân"
                active={isActive}
              />
            )}
          </NavLink>
          <NavLink to="/admin/revenue">
            {({ isActive }) => (
              <SidebarElement
                icon={DollarSign}
                text="Quản lý doanh thu"
                active={isActive}
              />
            )}
          </NavLink>
        </ul>

        {expanded && (
          <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-200">
            © 2025 B-Hub Management
          </div>
        )}
=======
        <SideBarContext.Provider value={{ expanded, setExpanded }}>
          <ul className="flex-1 px-3 bg-white">
            <div className="">
              <NavLink to={"/admin"} end>
                {({ isActive }) => (
                  <SidebarElement
                    icon={LayoutDashboard}
                    text="Bảng điều khiển"
                    active={isActive}
                    alert={false}
                  />
                )}
              </NavLink>
              <NavLink to={"/admin/products"}>
                {({ isActive }) => (
                  <SidebarElement
                    icon={Package}
                    text="Sản phẩm"
                    active={isActive}
                  />
                )}
              </NavLink>
              <NavLink to={"/admin/categories"}>
                {({ isActive }) => (
                  <SidebarElement
                    icon={Grid2X2}
                    text="Danh mục"
                    active={isActive}
                  />
                )}
              </NavLink>
              <NavLink to={"/admin/users"}>
                {({ isActive }) => (
                  <SidebarElement
                    icon={UsersRound}
                    text="Người dùng"
                    active={isActive}
                  />
                )}
              </NavLink>
              <NavLink to={"/admin/support"} end>
                {({ isActive }) => (
                  <SidebarElement
                    icon={Headset}
                    text="Support"
                    active={isActive}
                    alert={false}
                  />
                )}
              </NavLink>
              <NavLink to={"/admin/courts"} end>
                {({ isActive }) => (
                  <SidebarElement
                    icon={Rows3}
                    text="Sân đấu"
                    active={isActive}
                    alert={false}
                  />
                )}
              </NavLink>
              <NavLink to={"/admin/beverages"} end>
                {({ isActive }) => (
                  <SidebarElement
                    icon={Wine}
                    text="Đồ uống"
                    active={isActive}
                    alert={false}
                  />
                )}
              </NavLink>
              <NavLink to={"/admin/workShift"} end>
                {({ isActive }) => (
                  <SidebarElement
                    icon={Briefcase}
                    text="Ca làm"
                    active={isActive}
                    alert={false}
                  />
                )}
              </NavLink>
            </div>
          </ul>
        </SideBarContext.Provider>
>>>>>>> dev_admin_thaitoan
      </nav>
    </aside>
  );
};

export default Sidebar;
