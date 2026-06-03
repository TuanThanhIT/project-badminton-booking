import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "../../redux/hook";
import { ROLE_NAME } from "../../utils/constants/role";

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
  const isNotLoggedIn = !accessToken || !user;
  const canUseUserArea =
    user?.role === ROLE_NAME.USER || user?.role === ROLE_NAME.COACH;
  const isWrongRole = Boolean(user && !canUseUserArea);

  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (isNotLoggedIn || isWrongRole) {
      setRedirecting(true);

      const timer = setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: isNotLoggedIn ? { from: location } : undefined,
        });
      }, 1200);

      return () => clearTimeout(timer);
    }

    setRedirecting(false);
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

  if (redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang chuyển hướng đăng nhập...</span>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default UserProtectedRoute;
