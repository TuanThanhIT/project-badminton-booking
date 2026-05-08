// =========================
// commons/admin/AdminSidebar.tsx
// =========================

import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ClipboardList,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
  TicketPercent,
  Store,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import { logout, logoutLocal } from "../../../redux/slices/user/authSlice";

interface Props {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminSidebar = ({ collapsed, setCollapsed }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(logoutLocal());
    navigate("/admin/login");
  };

  const menus = [
    {
      title: "Tổng quan",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      title: "Sản phẩm",
      icon: ShoppingBag,
      path: "/admin/products",
    },
    {
      title: "Đơn hàng",
      icon: ClipboardList,
      path: "/admin/orders",
    },
    {
      title: "Đặt sân",
      icon: Calendar,
      path: "/admin/bookings",
    },
    {
      title: "Khách hàng",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "Chi nhánh",
      icon: Store,
      path: "/admin/branches",
    },
    {
      title: "Doanh thu",
      icon: Wallet,
      path: "/admin/revenue",
    },
    {
      title: "Khuyến mãi",
      icon: TicketPercent,
      path: "/admin/discounts",
    },
    {
      title: "Tin nhắn",
      icon: MessageSquare,
      path: "/admin/messages",
    },
    {
      title: "Cài đặt",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  return (
    <aside
      className={`
        relative
        transition-all duration-300
        border-r border-sky-800/40
        bg-gradient-to-b from-sky-700 via-sky-800 to-slate-900
        text-white
        shadow-2xl
        flex flex-col
        ${collapsed ? "w-24" : "w-80"}
      `}
    >
      {/* TOGGLE */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute
          -right-4
          top-8
          z-50
          w-9
          h-9
          rounded-full
          bg-sky-800
          border border-sky-600
          flex items-center justify-center
          text-slate-200
          shadow-lg
          hover:bg-sky-500
          hover:text-white
          transition
        "
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>

      {/* LOGO */}
      <div
        className={`
          h-24
          border-b border-white/10
          flex items-center
          ${collapsed ? "justify-center" : "px-6"}
        `}
      >
        <div className="flex items-center gap-4">
          <img
            src="/img/logo_badminton.jpg"
            alt="logo"
            className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-white/10"
          />

          {!collapsed && (
            <div>
              <h1 className="text-2xl font-bold tracking-wide text-white">
                B-Hub
              </h1>

              <p className="text-sm text-sky-100/70">Trang quản trị hệ thống</p>
            </div>
          )}
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                group
                flex
                items-center
                gap-4
                rounded-2xl
                transition-all
                duration-200
                relative

                ${collapsed ? "justify-center py-4 px-0" : "px-4 py-4"}

                ${
                  isActive
                    ? "bg-white text-sky-800 shadow-xl"
                    : "text-slate-100 hover:bg-white/10"
                }
              `
              }
            >
              {({ isActive }) => (
                <>
                  {/* ICON */}
                  <div
                    className={`
                      w-12 h-12
                      rounded-2xl
                      flex items-center justify-center
                      transition

                      ${
                        isActive
                          ? "bg-sky-100"
                          : "bg-white/10 group-hover:bg-white/20"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        w-5 h-5
                        ${
                          isActive
                            ? "text-sky-700"
                            : "text-white group-hover:text-white"
                        }
                      `}
                    />
                  </div>

                  {/* TEXT */}
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <p
                        className={`
                          font-semibold text-sm truncate
                          ${isActive ? "text-sky-900" : "text-white"}
                        `}
                      >
                        {item.title}
                      </p>

                      <p
                        className={`
                          text-xs mt-1 truncate
                          ${isActive ? "text-sky-600" : "text-sky-100/60"}
                        `}
                      >
                        Quản lý {item.title.toLowerCase()}
                      </p>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* USER */}
      <div className="border-t border-white/10 p-4">
        <div
          className="
            bg-white/10
            backdrop-blur-md
            rounded-3xl
            border border-white/10
            p-4
          "
        >
          <div
            className={`
              flex items-center
              ${collapsed ? "justify-center" : "gap-3"}
            `}
          >
            {/* AVATAR */}
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold shrink-0 shadow-md border border-white/10">
              {user?.username?.charAt(0).toUpperCase()}
            </div>

            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-white">
                    {user?.username}
                  </p>

                  <p className="text-sm text-sky-100/70 truncate">
                    Quản trị viên
                  </p>
                </div>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="
                    w-11 h-11
                    rounded-2xl
                    bg-white/10
                    hover:bg-red-500
                    transition
                    flex items-center justify-center
                    shrink-0
                  "
                >
                  <LogOut className="w-5 h-5 text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
