import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Spinner from "../ui/customer+employee/SpinnerLoad";
import { AuthContext } from "../contexts/authContext";
import { toast } from "react-toastify";
import type { ApiErrorType } from "../../types/error";
import authService from "../../services/admin/authService";

const AuthAdminGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { auth, setAuth, appLoading, setAppLoading } = useContext(AuthContext);
  const [checked, setChecked] = useState(false); // để đảm bảo check xong mới render

  useEffect(() => {
    const fetchAccount = async () => {
      setAppLoading(true);
      try {
        const res = await authService.getAdminAccountService();
        setAuth({
          isAuthenticated: true,
          user: {
            id: res.data.id,
            email: res.data.email,
            username: res.data.username,
            role: res.data.role,
          },
        });
      } catch (error) {
        const apiError = error as ApiErrorType;
        toast.error(apiError.userMessage);
        localStorage.removeItem("access_token"); // 👈 token lỗi thì xoá luôn
        setAuth({
          isAuthenticated: false,
          user: { id: 0, email: "", username: "", role: "" },
        });
      } finally {
        setAppLoading(false);
        setChecked(true);
      }
    };
    fetchAccount();
  }, [setAuth, setAppLoading]);

  if (appLoading || !checked) return <Spinner />;

  if (!auth.isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthAdminGuard;
