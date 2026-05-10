import { Route, Routes } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import DashboardPage from "../pages/admin/DashboardPage";
import AdminProtectedRoute from "./ProtectedRoute/AdminProtectedRoute";
import LoginPage from "../pages/admin/LoginPage";
import AdminPublicLayout from "../components/layouts/AdminPublicLayout";
import LandingPage from "../pages/admin/LandingPage";

const AdminRoute = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route element={<AdminPublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      {/* PRIVATE */}
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoute;
