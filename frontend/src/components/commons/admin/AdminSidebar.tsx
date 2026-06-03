import { NavLink, useNavigate } from "react-router-dom";
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
  GraduationCap,
  PackageCheck,
  Warehouse,
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
  description?: string;
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
        { title: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", description: "Tổng quan hệ thống" },
        { title: "Doanh thu", icon: TrendingUp, path: "/admin/revenue", description: "Báo cáo kinh doanh" },
        { title: "Tài chính", icon: Wallet, path: "/admin/finance", description: "Ví và giao dịch" },
      ],
    },
    {
      group: "Hàng hoá",
      items: [
        { title: "Danh mục", icon: Tag, path: "/admin/categories", description: "Nhóm sản phẩm" },
        { title: "Sản phẩm", icon: ShoppingBag, path: "/admin/products", description: "Hàng hóa toàn hệ thống" },
        { title: "Đồ uống", icon: Coffee, path: "/admin/beverages", description: "Menu quầy nước" },
        { title: "Nhà cung cấp", icon: Store, path: "/admin/suppliers", description: "Đối tác nhập hàng" },
        {
          title: "Phiếu nhập",
          icon: PackageCheck,
          path: "/admin/purchase-receipts",
          description: "Duyệt nhập kho",
        },
        { title: "Tồn kho", icon: Warehouse, path: "/admin/inventory", description: "Theo dõi tồn toàn hệ thống" },
        { title: "Khuyến mãi", icon: TicketPercent, path: "/admin/discounts", description: "Mã giảm giá" },
      ],
    },
    {
      group: "Người dùng",
      items: [
        { title: "Tài khoản", icon: Users, path: "/admin/users", description: "Quản lý người dùng" },
        {
          title: "Yêu cầu dạy cầu lông",
          icon: GraduationCap,
          path: "/admin/coach-applications",
          description: "Duyệt hồ sơ huấn luyện viên",
        },
        { title: "Chi nhánh", icon: Store, path: "/admin/branches", description: "Quản lý cơ sở sân" },
        { title: "Manager", icon: Shield, path: "/admin/managers", description: "Phân quyền quản lý" },
      ],
    },
    {
      group: "Nội dung",
      items: [
        { title: "Bài đăng", icon: FileText, path: "/admin/posts", description: "Nội dung cộng đồng" },
        { title: "Feedback", icon: Star, path: "/admin/feedbacks", description: "Đánh giá khách hàng" },
      ],
    },
  ];

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
        className={`flex h-20 items-center border-b border-slate-200 ${
          collapsed ? "justify-center" : "px-6"
        }`}
      >
        <div className="flex items-center gap-4">
          <img
            src="/img/logo_badminton.jpg"
            alt="B-Hub"
            className="h-12 w-12 shrink-0 rounded-2xl border border-slate-100 object-cover shadow-sm"
          />
          {!collapsed && (
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                B-Hub
              </h1>
              <p className="text-sm font-normal text-slate-500">
                Quản trị hệ thống
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
                  if (!item.path) return null;
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
                      }
                    `}
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
                        {!collapsed && isActive && (
                          <span className="h-2 w-2 rounded-full bg-sky-500" />
                        )}
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
        <div
          className={`rounded-2xl border border-slate-100 bg-slate-50 p-3 ${collapsed ? "" : ""}`}
        >
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 font-semibold text-white">
                {(user?.username || "A").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {user?.username}
                </p>
                <p className="truncate text-xs font-medium text-slate-500">
                  Quản trị viên
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600"
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

export default AdminSidebar;
