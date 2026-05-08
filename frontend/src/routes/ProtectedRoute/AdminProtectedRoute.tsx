import { Outlet, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hook";
import { ROLE_NAME } from "../../utils/constants/role";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const AdminProtectedRoute = () => {
  const navigate = useNavigate();

  const { user, accessToken, authInitialized } = useAppSelector(
    (state) => state.auth,
  );

  const isGetAccountLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/getAccount"],
  );

  const isLoading = !authInitialized || isGetAccountLoading;

  useEffect(() => {
    if (isLoading) return;

    // chưa login
    if (!accessToken || !user) {
      const timer = setTimeout(() => {
        navigate("/admin/login", { replace: true });
      }, 1200);

      return () => clearTimeout(timer);
    }

    // sai role
    if (user.role !== ROLE_NAME.ADMIN) {
      const timer = setTimeout(() => {
        navigate("/admin/login", { replace: true });
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isLoading, accessToken, user, navigate]);

  // LOADING AUTH
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang xác thực đăng nhập...</span>
        </div>
      </div>
    );
  }

  // LOADING REDIRECT (login)
  if (!accessToken || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang chuyển hướng đăng nhập...</span>
        </div>
      </div>
    );
  }

  // LOADING REDIRECT (forbidden)
  if (user && user.role !== ROLE_NAME.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-red-500 font-medium">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Không có quyền truy cập...</span>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
