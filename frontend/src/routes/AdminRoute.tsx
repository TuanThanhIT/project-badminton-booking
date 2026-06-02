import { Route, Routes } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import DashboardPage from "../pages/admin/DashboardPage";
import AdminProtectedRoute from "./ProtectedRoute/AdminProtectedRoute";
import LoginPage from "../pages/admin/LoginPage";
import AdminPublicLayout from "../components/layouts/AdminPublicLayout";
import LandingPage from "../pages/admin/LandingPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import BranchManagementPage from "../pages/admin/BranchManagementPage";
import ManagerManagementPage from "../pages/admin/ManagerManagementPage";
import ProductManagementPage from "../pages/admin/ProductManagementPage";
import BeverageManagementPage from "../pages/admin/BeverageManagementPage";
import PostManagementPage from "../pages/admin/PostManagementPage";
import DiscountManagementPage from "../pages/admin/DiscountManagementPage";
import FeedbackManagementPage from "../pages/admin/FeedbackManagementPage";
import FinanceManagementPage from "../pages/admin/FinanceManagementPage";
import RevenueManagementPage from "../pages/admin/RevenueManagementPage";
import CategoryManagementPage from "../pages/admin/CategoryManagementPage";
import CoachApplicationManagementPage from "../pages/admin/CoachApplicationManagementPage";

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
          <Route path="users" element={<UserManagementPage />} />
          <Route path="coach-applications" element={<CoachApplicationManagementPage />} />
          <Route path="branches" element={<BranchManagementPage />} />
          <Route path="managers" element={<ManagerManagementPage />} />
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="products" element={<ProductManagementPage />} />
          <Route path="beverages" element={<BeverageManagementPage />} />
          <Route path="posts" element={<PostManagementPage />} />
          <Route path="discounts" element={<DiscountManagementPage />} />
          <Route path="feedbacks" element={<FeedbackManagementPage />} />
          <Route path="finance" element={<FinanceManagementPage />} />
          <Route path="revenue" element={<RevenueManagementPage />} />
          <Route path="suppliers" element={<SupplierManagementPage />} />
          <Route path="purchase-receipts" element={<PurchaseReceiptManagementPage />} />
          <Route path="inventory" element={<InventoryManagementPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoute;
