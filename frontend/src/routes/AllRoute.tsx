import { Routes, Route } from "react-router-dom";
import UserRoute from "./UserRoute";
import NotFoundPage from "../pages/NotFoundPage";
import AdminRoute from "./AdminRoute";
import ManagerRoute from "./ManagerRoute";

const AllRoute = () => {
  return (
    <Routes>
      {/* Admin */}
      <Route path="/admin/*" element={<AdminRoute />} />

      {/* Manager */}
      <Route path="/manager/*" element={<ManagerRoute />} />

      {/* Customer */}
      <Route path="/*" element={<UserRoute />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AllRoute;
