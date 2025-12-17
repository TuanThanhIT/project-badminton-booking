import { Routes, Route, Outlet } from "react-router-dom";
import LoginPage from "../pages/Employee/LoginPage";
import EmployeeLayout from "../components/layouts/EmployeeLayout";
import CashRegisterPage from "../pages/Employee/CashRegisterPage";
import EmployeePage from "../pages/Employee/EmployeePage";
import AuthEmployeeGuard from "../components/guards/AuthEmployeeGuard";
import ProfilePage from "../pages/Customer/ProfilePage";
import BookingPage from "../pages/Employee/BookingPage";
import OrderPage from "../pages/Employee/OrderPage";
import CheckOutPage from "../pages/Employee/CheckOutPage";

const EmployeeRoute = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />

      <Route
        element={
          <AuthEmployeeGuard>
            <EmployeeLayout />
          </AuthEmployeeGuard>
        }
      >
        <Route path="home" element={<EmployeePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="bookings" element={<BookingPage />} />
        <Route path="orders" element={<OrderPage />} />
      </Route>

      <Route
        element={
          <AuthEmployeeGuard>
            <Outlet />
          </AuthEmployeeGuard>
        }
      >
        <Route path="cash-register" element={<CashRegisterPage />} />
        <Route path="check-out" element={<CheckOutPage />} />
      </Route>
    </Routes>
  );
};

export default EmployeeRoute;
