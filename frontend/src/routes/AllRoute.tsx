import { Route, Routes } from "react-router-dom";
import CustomerRoute from "./CusRoute";
import EmployeeRoute from "./EmployeeRoute";
import NotFoundPage from "../pages/NotFoundPage";

const AllRoute = () => {
  return (
    <div>
      <Routes>
        {/* Route khách */}
        <Route path="/*" element={<CustomerRoute />} />

        {/* Route nhân viên */}
        <Route path="/employee/*" element={<EmployeeRoute />} />

        {/* 404 chung */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};
export default AllRoute;
