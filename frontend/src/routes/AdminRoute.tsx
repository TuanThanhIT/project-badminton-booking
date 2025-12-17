import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import HomePage from "../pages/Admin/HomePage";
import UsersPage from "../pages/Admin/UsersPage";
import ProductPage from "../pages/Admin/ProductPage";
import LoginPage from "../pages/Admin/LoginPage";
import AddProductPage from "../pages/Admin/AddProductPage";
import CategoryPage from "../pages/Admin/CategoryPage";
import WorkShiftPage from "../pages/Admin/WorkShiftPage";
import EditProductPage from "../pages/Admin/EditProductPage";
import VariantPage from "../pages/Admin/VariantPage";
import CourtPage from "../pages/Admin/CourtPage";
<<<<<<< HEAD
import DiscountPage from "../pages/Admin/DiscountPage";
import AuthAdminGuard from "../components/guards/AuthAdminGuard";
import ProfilePage from "../pages/Customer/ProfilePage";
import OrderPage from "../pages/Admin/OrderPage";
import BookingPage from "../pages/Admin/BookingPage";
import RevenuePage from "../pages/Admin/RevenuePage";
import DashboardPage from "../pages/Admin/DashboardPage";

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
      </Route>
    </Routes>
=======
import BeveragePage from "../pages/Admin/BeveragePage";
import AddBeveragePage from "../pages/Admin/AddBeveragePage";
import EditBeveragePage from "../pages/Admin/EditBeveragePage";
import WorkShiftEmployeePage from "../pages/Admin/WorkShiftEmployeePage";
const AdminRoute = () => {
  return (
    <div>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<HomePage />} />

          <Route path="users" element={<UsersPage />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="support" element={<SupportPage />} />

          {/* ================= WORK SHIFT ================= */}
          <Route path="workShift" element={<WorkShiftPage />} />
          <Route
            path="workShift/employees"
            element={<WorkShiftEmployeePage />}
          />

          {/* ================= PRODUCTS ================= */}
          <Route path="products/add" element={<AddProductPage />} />
          <Route path="products/edit/:id" element={<EditProductPage />} />
          <Route path="products/variants" element={<VariantPage />} />

          {/* ================= COURTS ================= */}
          <Route path="courts" element={<CourtPage />} />

          {/* ================= BEVERAGES ================= */}
          <Route path="beverages" element={<BeveragePage />} />
          <Route path="beverages/add" element={<AddBeveragePage />} />
          <Route path="beverages/edit/:id" element={<EditBeveragePage />} />
        </Route>

        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
>>>>>>> dev_admin_thaitoan
  );
};
export default AdminRoute;
