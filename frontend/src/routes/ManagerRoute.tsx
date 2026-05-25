// routes/ManagerRoute.tsx

import { Route, Routes } from "react-router-dom";

import ManagerLayout from "../components/layouts/ManagerLayout";
import ManagerProtectedRoute from "./ProtectedRoute/ManagerProtectedRoute";

import ManagerPublicLayout from "../components/layouts/ManagerPublicLayout";

import DashboardPage from "../pages/manager/DashboardPage";
import LoginPage from "../pages/manager/LoginPage";
import LandingPage from "../pages/manager/LandingPage";
import BranchPage from "../pages/manager/BranchPage";

const ManagerRoute = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route element={<ManagerPublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      {/* PRIVATE */}
      <Route element={<ManagerProtectedRoute />}>
        <Route element={<ManagerLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="branches" element={<BranchPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default ManagerRoute;
