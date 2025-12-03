import { Routes, Route } from "react-router-dom";
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
      {/* Public route */}
      <Route path="login" element={<LoginPage />}></Route>

      {/* Protected routes */}
      <Route
        path=""
        element={
          <AuthEmployeeGuard>
            <EmployeeLayout />
          </AuthEmployeeGuard>
        }
      >
        <Route path="home" element={<EmployeePage />}></Route>
        <Route path="cash-register" element={<CashRegisterPage />}></Route>
        <Route path="profile" element={<ProfilePage />}></Route>
        <Route path="bookings" element={<BookingPage />}></Route>
        <Route path="orders" element={<OrderPage />}></Route>
        <Route path="check-out" element={<CheckOutPage />}></Route>
      </Route>
    </Routes>
  );
};

export default EmployeeRoute;
