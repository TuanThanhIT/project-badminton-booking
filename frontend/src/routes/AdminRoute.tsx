import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import HomePage from "../pages/Admin/HomePage";
import UsersPage from "../pages/Admin/UsersPage";
import ProductPage from "../pages/Admin/ProductPage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/Admin/LoginPage";
const AdminRoute = () => {
  return (
    <div>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<HomePage />}></Route>
          <Route path="/admin/users" element={<UsersPage />}></Route>
          <Route path="/admin/products" element={<ProductPage />}></Route>
        </Route>
        <Route path="/admin/login" element={<LoginPage />}></Route>
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </div>
  );
};
export default AdminRoute;
