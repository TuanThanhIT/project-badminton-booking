import { useEffect } from "react";
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
import { getMyBranch } from "../../../redux/slices/manager/branchSlice";
import { logout, logoutLocal } from "../../../redux/slices/user/authSlice";

interface Props {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

type MenuItem = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  description: string;
};

const menuGroups: { group: string; items: MenuItem[] }[] = [
  {
    group: "Tổng quan",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/manager/dashboard",
        description: "Tổng quan chi nhánh",
      },
      {
        title: "Doanh thu",
        icon: BadgeDollarSign,
        path: "/manager/revenue",
        description: "Báo cáo kinh doanh",
      },
    ],
  },
  {
    group: "Vận hành",
    items: [
      {
        title: "Lịch sân",
        icon: Calendar,
        path: "/manager/bookings",
        description: "Lịch đặt sân",
      },
      {
        title: "Sân cầu lông",
        icon: Calendar,
        path: "/manager/courts",
        description: "Sân và bảng giá",
      },
      {
        title: "Đơn hàng",
        icon: ClipboardList,
        path: "/manager/orders",
        description: "Đơn bán hàng",
      },
      {
        title: "Tin nhắn",
        icon: MessageSquare,
        path: "/manager/messages",
        description: "Trao đổi khách hàng",
      },
    ],
  },
  {
    group: "Hàng hóa",
    items: [
      {
        title: "Sản phẩm",
        icon: ShoppingBag,
        path: "/manager/products",
        description: "Xem hàng hóa",
      },
      {
        title: "Kho hàng",
        icon: Warehouse,
        path: "/manager/inventory",
        description: "Phiếu nhập và tồn kho",
      },
    ],
  },
  {
    group: "Nhân sự",
    items: [
      {
        title: "Nhân viên",
        icon: Users,
        path: "/manager/staffs",
        description: "Quản lý nhân viên",
      },
      {
        title: "Phân ca",
        icon: Calendar,
        path: "/manager/work-shifts",
        description: "Lịch làm việc",
      },
      {
        title: "Lương",
        icon: BadgeDollarSign,
        path: "/manager/salaries",
        description: "Lương nhân viên",
      },
    ],
  },
];

const ManagerSidebar = ({ collapsed, setCollapsed }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const { branch } = useAppSelector((state) => state.managerBranch);

  const displayName = user?.username || "Manager";
  const initial = displayName.charAt(0).toUpperCase();
  const branchName = branch?.branchName;

  useEffect(() => {
    if (!accessToken) return;
    dispatch(getMyBranch());
  }, [dispatch, accessToken]);

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
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-7 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
        aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
      >
        {collapsed ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <ChevronLeft className="h-5 w-5" />
        )}
      </button>

      <div
        className={`flex min-h-20 items-center border-b border-slate-200 py-3 ${
          collapsed ? "justify-center px-2" : "px-6"
        }`}
      >
        <div
          className={`flex ${collapsed ? "flex-col items-center" : "items-start gap-4"}`}
        >
          <div
            className={`flex flex-col ${collapsed ? "items-center" : "shrink-0"}`}
          >
            <img
              src="/img/logo_badminton.jpg"
              alt="B-Hub"
              className="h-12 w-12 shrink-0 rounded-2xl border border-slate-100 object-cover shadow-sm"
            />

            {branchName && (
              <p
                className={`mt-1.5 text-center font-semibold text-sky-700 ${
                  collapsed
                    ? "max-w-[4.5rem] truncate text-[10px] leading-tight"
                    : "max-w-24 line-clamp-2 text-xs leading-snug"
                }`}
                title={branchName}
              >
                {branchName}
              </p>
            )}
          </div>

          {!collapsed && (
            <div className="flex h-12 flex-col justify-center">
              <h1 className="text-2xl font-semibold leading-none text-slate-900">
                B-Hub
              </h1>
              <p className="mt-1 text-sm font-normal leading-none text-slate-500">
                Quản lý cửa hàng
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-4">
          {menuGroups.map((group) => (
            <div key={group.group}>
              {!collapsed ? (
                <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {group.group}
                </p>
              ) : (
                <div className="mx-3 my-2 border-t border-slate-200" />
              )}

              <div className="space-y-1.5">
                {group.items.map((item) => {
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
                              isActive
                                ? "bg-white text-sky-700 shadow-sm"
                                : "bg-slate-100 text-slate-500 group-hover:bg-white"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>

                          {!collapsed && (
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-bold">
                                {item.title}
                              </span>
                              <span
                                className={`mt-0.5 block truncate text-xs ${
                                  isActive ? "text-sky-600" : "text-slate-400"
                                }`}
                              >
                                {item.description}
                              </span>
                            </span>
                          )}

                          {!collapsed && isActive ? (
                            <span className="h-2 w-2 rounded-full bg-sky-500" />
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
          >
            {collapsed ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 font-semibold text-white">
                    {initial}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {displayName}
                    </p>

                    <p className="truncate text-xs font-medium text-slate-500">
                      Quản lý cửa hàng
                    </p>
                  </div>
                </div>

                <button
                  type="button"
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
