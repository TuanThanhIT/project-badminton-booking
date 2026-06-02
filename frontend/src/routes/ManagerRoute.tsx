// routes/ManagerRoute.tsx

import { Route, Routes } from "react-router-dom";

import ManagerLayout from "../components/layouts/ManagerLayout";
import ManagerProtectedRoute from "./ProtectedRoute/ManagerProtectedRoute";

import ManagerPublicLayout from "../components/layouts/ManagerPublicLayout";

import DashboardPage from "../pages/manager/DashboardPage";
import LoginPage from "../pages/manager/LoginPage";
import LandingPage from "../pages/manager/LandingPage";
import BranchPage from "../pages/manager/BranchPage";
import StaffPage from "../pages/manager/StaffPage";
import ProductPagae from "../pages/manager/ProductPage";
import WorkShiftPage from "../pages/manager/WorkShiftPage";
import SalaryPage from "../pages/manager/SalaryPage";
import RevenuePage from "../pages/manager/RevenuePage";
import OrderPage from "../pages/manager/OrderPage";
import ConversationPage from "../pages/manager/ConversationPage";
import InventoryPage from "../pages/manager/InventoryPage";

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
          {/* ///MANAGER */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bookings" element={<BranchPage />} />
          <Route path="products" element={<ProductPagae />} />
          <Route path="staffs" element={<StaffPage />} />
          <Route path="work-shifts" element={<WorkShiftPage />} />
          <Route path="salaries" element={<SalaryPage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="orders" element={<OrderPage />} />
          <Route path="order" element={<OrderPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="messages" element={<ConversationPage />} />
          <Route
            path="messages/:conversationId"
            element={<ConversationPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default ManagerRoute;
