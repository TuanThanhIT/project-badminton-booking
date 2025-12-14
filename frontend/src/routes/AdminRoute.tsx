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
import DiscountPage from "../pages/Admin/DiscountPage";
import AuthAdminGuard from "../components/guards/AuthAdminGuard";
import ProfilePage from "../pages/Customer/ProfilePage";
import OrderPage from "../pages/Admin/OrderPage";
import BookingPage from "../pages/Admin/BookingPage";

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
        <Route path="dashboard" element={<HomePage />}></Route>
        <Route path="users" element={<UsersPage />}></Route>
        <Route path="products" element={<ProductPage />}></Route>
        <Route path="categories" element={<CategoryPage />}></Route>
        <Route path="workshift" element={<WorkShiftPage />}></Route>
        <Route path="products/variants" element={<VariantPage />} />
        <Route path="discount" element={<DiscountPage />}></Route>
        <Route path="order" element={<OrderPage />}></Route>
        <Route path="booking" element={<BookingPage />}></Route>
        <Route path="products/add" element={<AddProductPage />}></Route>
        <Route path="products/edit/:id" element={<EditProductPage />}></Route>
        <Route path="courts" element={<CourtPage />}></Route>
        <Route path="profile" element={<ProfilePage />}></Route>
      </Route>
    </Routes>
  );
};
export default AdminRoute;
