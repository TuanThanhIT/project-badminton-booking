import { Route, Routes } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import DashboardPage from "../pages/admin/DashboardPage";

const AdminRoute = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardPage />}></Route>
      </Route>
    </Routes>
  );
};

export default AdminRoute;
