import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import HomePage from "../pages/Admin/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
const AdminRoute = () => {
  return (
    <div>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/admin/home" element={<HomePage />}></Route>
        </Route>
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </div>
  );
};
export default AdminRoute;
