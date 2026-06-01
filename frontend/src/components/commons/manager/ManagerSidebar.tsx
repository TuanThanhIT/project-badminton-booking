import { NavLink, useNavigate } from "react-router-dom";
import {
  BadgeDollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  ShoppingBag,
  Users,
  Warehouse,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import { logout, logoutLocal } from "../../../redux/slices/user/authSlice";

interface Props {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const menus = [
  { title: "Tổng quan", icon: LayoutDashboard, path: "/manager/dashboard" },
  { title: "Sản phẩm", icon: ShoppingBag, path: "/manager/products" },
  { title: "Đơn hàng", icon: ClipboardList, path: "/manager/orders" },
  { title: "Đặt sân", icon: Calendar, path: "/manager/bookings" },
  { title: "Kho hàng", icon: Warehouse, path: "/manager/inventory" },
  { title: "Nhân viên", icon: Users, path: "/manager/staffs" },
  { title: "Phân ca", icon: Calendar, path: "/manager/work-shifts" },
  { title: "Doanh thu", icon: BadgeDollarSign, path: "/manager/revenue" },
  { title: "Lương", icon: BadgeDollarSign, path: "/manager/salaries" },
  { title: "Tin nhắn", icon: MessageSquare, path: "/manager/messages" },
];

const ManagerSidebar = ({ collapsed, setCollapsed }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(logoutLocal());
    navigate("/manager/login");
  };

  return (
    <aside
      className={`relative flex shrink-0 flex-col border-r border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 ${
        collapsed ? "w-24" : "w-80"
      }`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-8 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
        aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
      >
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>

      <div
        className={`flex h-24 items-center border-b border-slate-100 ${
          collapsed ? "justify-center" : "px-6"
        }`}
      >
        <div className="flex items-center gap-4">
          <img
            src="/img/logo_badminton.jpg"
            alt="B-Hub"
            className="h-14 w-14 rounded-2xl border border-slate-100 object-cover shadow-sm"
          />

          {!collapsed && (
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">B-Hub</h1>
              <p className="text-sm font-medium text-slate-500">Quản lý cửa hàng</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "border-sky-100 bg-sky-50 text-sky-700 shadow-sm"
                    : "border-transparent text-slate-600 hover:border-slate-100 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                      isActive ? "bg-white text-sky-700 shadow-sm" : "bg-slate-100 text-slate-500 group-hover:bg-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  {!collapsed && (
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{item.title}</span>
                      <span className={`mt-0.5 block truncate text-xs ${isActive ? "text-sky-600" : "text-slate-400"}`}>
                        Quản lý {item.title.toLowerCase()}
                      </span>
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-lg font-bold text-white shadow-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </div>

            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{user?.username}</p>
                  <p className="truncate text-xs font-medium text-slate-500">Quản lý cửa hàng</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ManagerSidebar;
