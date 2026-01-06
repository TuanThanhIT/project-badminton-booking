import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import UsersPage from "../pages/admin/UsersPage";
import ProductPage from "../pages/admin/ProductPage";
import LoginPage from "../pages/admin/LoginPage";
import AddProductPage from "../pages/admin/AddProductPage";
import CategoryPage from "../pages/admin/CategoryPage";
import WorkShiftPage from "../pages/admin/WorkShiftPage";
import EditProductPage from "../pages/admin/EditProductPage";
import VariantPage from "../pages/admin/VariantPage";
import CourtPage from "../pages/admin/CourtPage";
import DiscountPage from "../pages/admin/DiscountPage";
import AuthAdminGuard from "../components/guards/AuthAdminGuard";
import ProfilePage from "../pages/customer/ProfilePage";
import OrderPage from "../pages/admin/OrderPage";
import BookingPage from "../pages/admin/BookingPage";
import RevenuePage from "../pages/admin/RevenuePage";
import DashboardPage from "../pages/admin/DashboardPage";
import WorkShiftEmployeePage from "../pages/admin/WorkShiftEmployeePage";
import BeveragePage from "../pages/admin/BeveragePage";
import MonthlySalaryPage from "../pages/admin/MonthlySalaryPage";

const AdminRoute = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />}></Route>
      {/* Protected routes */}
      <Route
        path=""
        element={
          <AuthAdminGuard>
            <AdminLayout />
          </AuthAdminGuard>
        }
      >
        <Route path="dashboard" element={<DashboardPage />}></Route>
        <Route path="users" element={<UsersPage />}></Route>
        <Route path="products" element={<ProductPage />}></Route>
        <Route path="categories" element={<CategoryPage />}></Route>
        <Route path="workshift" element={<WorkShiftPage />}></Route>
        <Route path="products/variants" element={<VariantPage />} />
        <Route path="discount" element={<DiscountPage />}></Route>
        <Route path="order" element={<OrderPage />}></Route>
        <Route path="booking" element={<BookingPage />}></Route>
        <Route path="revenue" element={<RevenuePage />}></Route>
        <Route path="products/add" element={<AddProductPage />}></Route>
        <Route path="products/edit/:id" element={<EditProductPage />}></Route>
        <Route path="courts" element={<CourtPage />}></Route>
        <Route path="profile" element={<ProfilePage />}></Route>
        <Route path="workShift" element={<WorkShiftPage />} />
        <Route
          path="workShift/employees"
          element={<WorkShiftEmployeePage />}
        ></Route>
        <Route
          path="workShift/monthly-salary"
          element={<MonthlySalaryPage />}
        ></Route>
        <Route path="beverages" element={<BeveragePage />}></Route>
      </Route>
    </Routes>
  );
};
export default AdminRoute;
