import { NavLink } from "react-router-dom";
import { SidebarElement } from "./SidebarElement";
import {
  LayoutDashboard,
  Package,
  UsersRound,
  ChevronFirst,
  ChevronLast,
  Headset,
  Grid2X2,
  Rows3,
  Wine,
  Briefcase,
} from "lucide-react";
import { createContext, useState } from "react";
type SideBarContextType = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};
export const SideBarContext = createContext<SideBarContextType | undefined>(
  undefined
);

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  return (
    <aside className="h-screen sticky top-0">
      <nav className="h-full flex flex-col border-r border-gray-200 shadow-sm">
        <div className="p-2 pb-2 flex justify-between items-center">
          <div className="flex items-center gap-2 h-20">
            <img
              src="/img/logo_badminton.jpg"
              className={
                expanded ? "w-18 border rounded-xl border-gray-200 " : "w-0"
              }
              alt=""
            />
            <h1
              className={
                expanded ? "text-xl font-bold text-blue-600" : "hidden"
              }
            >
              B-Hub
            </h1>
          </div>

          <button
            onClick={() => setExpanded((prev) => !prev)}
            className={
              expanded
                ? "p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                : "rounded-4xl bg-gray-50 hover:bg-gray-100 py-2 px-2 my-2 mx-3 cursor-pointer"
            }
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>
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
      </nav>
    </aside>
  );
};
export default Sidebar;
