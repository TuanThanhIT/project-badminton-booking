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
import EditVariantPage from "../pages/Admin/EditVariantPage";
import VariantModal from "../components/commons/admin/VariantModal";
const AdminRoute = () => {
  return (
    <div>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<HomePage />}></Route>
          <Route path="/admin/users" element={<UsersPage />}></Route>
          <Route path="/admin/products" element={<ProductPage />}></Route>
          <Route path="/admin/categories" element={<CategoryPage />}></Route>
          <Route path="/admin/support" element={<SupportPage />}></Route>
          <Route path="/admin/workshift" element={<WorkShiftPage />}></Route>
          <Route path="/admin/products/variants" element={<VariantPage />} />
          <Route
            path="/admin/products/add"
            element={<AddProductPage />}
          ></Route>
          <Route
            path="/admin/products/edit/:id"
            element={<EditProductPage />}
          ></Route>
        </Route>

        <Route path="/admin/variants/edit/:id" element={<EditVariantPage />} />
        <Route path="/admin/login" element={<LoginPage />}></Route>
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </div>
  );
};
export default AdminRoute;
