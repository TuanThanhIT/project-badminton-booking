import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hook";
import { ROLE_NAME } from "../../utils/constants/role";

const EmployeeProtectedRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, accessToken, authInitialized } = useAppSelector(
    (state) => state.auth,
  );

  const isGetAccountLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/getAccount"],
  );

  const isLoading = !authInitialized || isGetAccountLoading;
  const isNotLoggedIn = !accessToken || !user;
  const isWrongRole = user && user.role !== ROLE_NAME.EMPLOYEE;

  useEffect(() => {
    if (isLoading) return;

    if (isNotLoggedIn || isWrongRole) {
      const timer = setTimeout(() => {
        navigate("/employee/login", {
          replace: true,
          state: isNotLoggedIn ? { from: location } : undefined,
        });
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isNotLoggedIn, isWrongRole, navigate, location]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang xác thực đăng nhập...</span>
        </div>
      </div>
    );
  }

  if (isNotLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang chuyển hướng đăng nhập...</span>
        </div>
      </div>
    );
  }

  if (isWrongRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 font-medium text-rose-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Không có quyền truy cập...</span>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default EmployeeProtectedRoute;
