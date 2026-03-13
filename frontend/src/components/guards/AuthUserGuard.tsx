import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../redux/hook";
import Spinner from "../ui/customer+employee/SpinnerLoad";

const AuthUserGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { token } = useAppSelector((state) => state.auth);
  const loading = useAppSelector((state) => state.ui.loadingCount > 0);

  if (loading) return <Spinner />;

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthUserGuard;
