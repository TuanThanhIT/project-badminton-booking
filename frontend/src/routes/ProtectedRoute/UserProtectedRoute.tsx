import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hook";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const UserProtectedRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, accessToken, authInitialized } = useAppSelector(
    (state) => state.auth,
  );

  const isGetAccountLoading = useAppSelector(
    (state) => state.ui.loadingMap["auth/getAccount"],
  );

  const isLoading = !authInitialized || isGetAccountLoading;

  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!accessToken || !user) {
      setRedirecting(true);

      const timer = setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { from: location },
        });
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isLoading, accessToken, user, navigate, location]);

  // LOADING
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

  // REDIRECT UI (hiển thị trước khi chuyển)
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang chuyển hướng đăng nhập...</span>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default UserProtectedRoute;
