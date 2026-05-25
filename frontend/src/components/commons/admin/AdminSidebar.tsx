import { NavLink, useNavigate } from "react-router-dom";
import UserAvatar from "../../ui/admin/UserAvatar";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
  TicketPercent,
  Store,
  Shield,
  Coffee,
  FileText,
  Star,
  TrendingUp,
  Tag,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import { logout, logoutLocal } from "../../../redux/slices/user/authSlice";

interface Props {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  children?: { title: string; path: string }[];
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

  const menuGroups: { group: string; items: MenuItem[] }[] = [
    {
      group: "Tổng quan",
      items: [
        { title: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
        { title: "Doanh thu", icon: TrendingUp, path: "/admin/revenue" },
        { title: "Tài chính", icon: Wallet, path: "/admin/finance" },
      ],
    },
    {
      group: "Hàng hoá",
      items: [
        { title: "Danh mục", icon: Tag, path: "/admin/categories" },
        { title: "Sản phẩm", icon: ShoppingBag, path: "/admin/products" },
        { title: "Đồ uống", icon: Coffee, path: "/admin/beverages" },
        { title: "Khuyến mãi", icon: TicketPercent, path: "/admin/discounts" },
      ],
    },
    {
      group: "Người dùng",
      items: [
        { title: "Tài khoản", icon: Users, path: "/admin/users" },
        { title: "Chi nhánh", icon: Store, path: "/admin/branches" },
        { title: "Manager", icon: Shield, path: "/admin/managers" },
      ],
    },
    {
      group: "Nội dung",
      items: [
        { title: "Bài đăng", icon: FileText, path: "/admin/posts" },
        { title: "Feedback", icon: Star, path: "/admin/feedbacks" },
      ],
    },
  ];

  return (
    <aside
      className={`
        relative transition-all duration-300
        border-r border-sky-800/40
        bg-gradient-to-b from-sky-700 via-sky-800 to-slate-900
        text-white shadow-2xl flex flex-col
        ${collapsed ? "w-20" : "w-72"}
      `}
    >
      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-8 z-50 w-8 h-8 rounded-full bg-sky-800 border border-sky-600 flex items-center justify-center text-slate-200 shadow-lg hover:bg-sky-500 hover:text-white transition"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo */}
      <div className={`h-20 border-b border-white/10 flex items-center shrink-0 ${collapsed ? "justify-center px-3" : "px-5"}`}>
        <div className="flex items-center gap-3">
          <img src="/img/logo_badminton.jpg" alt="logo"
            className="w-11 h-11 rounded-xl object-cover shadow-lg border border-white/10 shrink-0" />
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white leading-tight">B-Hub</h1>
              <p className="text-xs text-sky-100/60">Quản trị hệ thống</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {menuGroups.map((group) => (
          <div key={group.group}>
            {/* Group Label */}
            {!collapsed && (
              <p className="px-4 py-1.5 text-xs font-semibold text-sky-200/50 uppercase tracking-widest">
                {group.group}
              </p>
            )}
            {collapsed && <div className="mx-3 my-2 border-t border-white/10" />}

            {/* Group Items */}
            {group.items.map((item) => {
              const Icon = item.icon;
              if (item.path) {
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      group flex items-center gap-3 mx-2 rounded-xl transition-all duration-150
                      ${collapsed ? "justify-center py-3 px-2" : "px-3 py-2.5"}
                      ${isActive
                        ? "bg-white text-sky-800 shadow-lg"
                        : "text-sky-100/80 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`
                          w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition
                          ${isActive ? "bg-sky-100" : "bg-white/10 group-hover:bg-white/20"}
                        `}>
                          <Icon className={`w-[18px] h-[18px] ${isActive ? "text-sky-700" : "text-white"}`} />
                        </div>
                        {!collapsed && (
                          <span className={`text-sm font-medium truncate ${isActive ? "text-sky-900" : "text-white"}`}>
                            {item.title}
                          </span>
                        )}
                        {!collapsed && isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>

      {/* User */}
      <div className="border-t border-white/10 p-3 shrink-0">
        <div className={`bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-3 flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <UserAvatar
            src={user?.profile?.avatar}
            name={user?.username || "?"}
            className="w-10 h-10 rounded-xl shadow border border-white/20"
          />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-white">{user?.username}</p>
                <p className="text-xs text-sky-100/60">Quản trị viên</p>
              </div>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-500 transition flex items-center justify-center shrink-0"
              >
                <LogOut className="w-4 h-4 text-white" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
