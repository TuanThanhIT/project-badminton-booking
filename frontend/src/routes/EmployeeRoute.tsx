import { Route, Routes } from "react-router-dom";
import EmployeeLayout from "../components/layouts/EmployeeLayout";
import EmployeePublicLayout from "../components/layouts/EmployeePublicLayout";
import LandingPage from "../pages/employee/LandingPage";
import LoginPage from "../pages/employee/LoginPage";
import CashRegisterPage from "../pages/employee/CashRegisterPage";
import EmployeeHomePage from "../pages/employee/EmployeeHomePage";
import EmployeeOrdersPage from "../pages/employee/EmployeeOrdersPage";
import EmployeeBookingsPage from "../pages/employee/EmployeeBookingsPage";
import EmployeeShiftsPage from "../pages/employee/EmployeeShiftsPage";
import EmployeeProtectedRoute from "./ProtectedRoute/EmployeeProtectedRoute";

const EmployeeRoute = () => {
  return (
    <Routes>
      <Route element={<EmployeePublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      <Route element={<EmployeeProtectedRoute />}>
        <Route element={<EmployeeLayout />}>
          <Route path="cash-register" element={<CashRegisterPage />} />
          <Route path="home" element={<EmployeeHomePage />} />
          <Route path="shifts" element={<EmployeeShiftsPage />} />
          <Route path="orders" element={<EmployeeOrdersPage />} />
          <Route path="bookings" element={<EmployeeBookingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default EmployeeRoute;
