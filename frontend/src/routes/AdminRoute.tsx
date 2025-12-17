import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import HomePage from "../pages/Admin/HomePage";
import UsersPage from "../pages/Admin/UsersPage";
import ProductPage from "../pages/Admin/ProductPage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/Admin/LoginPage";
import SupportPage from "../pages/Admin/SupportPage";
import AddProductPage from "../pages/Admin/AddProductPage";
import CategoryPage from "../pages/Admin/CategoryPage";
import WorkShiftPage from "../pages/Admin/WorkShiftPage";
import EditProductPage from "../pages/Admin/EditProductPage";
import VariantPage from "../pages/Admin/VariantPage";
import CourtPage from "../pages/Admin/CourtPage";
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
  );
};
export default AdminRoute;
