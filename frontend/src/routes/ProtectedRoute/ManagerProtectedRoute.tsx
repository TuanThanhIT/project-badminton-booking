import { Outlet, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hook";
import { ROLE_NAME } from "../../utils/constants/role";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const ManagerProtectedRoute = () => {
  const navigate = useNavigate();

  const { user, accessToken, authInitialized } = useAppSelector(
    (state) => state.auth,
  );

  const isGetAccountLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/getAccount"],
  );

  const isLoading = !authInitialized || isGetAccountLoading;

  const isNotLoggedIn = !accessToken || !user;
  const isWrongRole = user && user.role !== ROLE_NAME.MANAGER;

  useEffect(() => {
    if (isLoading) return;

    // chưa login
    if (isNotLoggedIn) {
      const timer = setTimeout(() => {
        navigate("/manager/login", { replace: true });
      }, 1200);

      return () => clearTimeout(timer);
    }

    // sai role
    if (isWrongRole) {
      const timer = setTimeout(() => {
        navigate("/manager/login", { replace: true });
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isNotLoggedIn, isWrongRole, navigate]);

  // LOADING AUTH
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang xác thực đăng nhập...</span>
        </div>
      </div>
    );
  }

  // LOADING LOGIN REDIRECT
  if (isNotLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang chuyển hướng đăng nhập...</span>
        </div>
      </div>
    );
  }

  // LOADING FORBIDDEN REDIRECT
  if (isWrongRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-red-500 font-medium">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Không có quyền truy cập...</span>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ManagerProtectedRoute;
