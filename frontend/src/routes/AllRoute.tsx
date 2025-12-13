import { Routes, Route } from "react-router-dom";
import CustomerRoute from "./CusRoute";
import EmployeeRoute from "./EmployeeRoute";
import AdminRoute from "./AdminRoute";
import NotFoundPage from "../pages/NotFoundPage";

const AllRoute = () => {
  return (
    <Routes>
      {/* Admin */}
      <Route path="/admin/*" element={<AdminRoute />} />

      {/* Employee */}
      <Route path="/employee/*" element={<EmployeeRoute />} />

      {/* Customer */}
      <Route path="/*" element={<CustomerRoute />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AllRoute;
