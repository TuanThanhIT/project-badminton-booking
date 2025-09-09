import { Routes, Route } from "react-router-dom";
import CustomerLayout from "../components/layouts/CustomerLayout";
import HomePage from "../pages/Customer/HomePage";
import ProductPage from "../pages/Customer/ProductPage";
import BookingCourtPage from "../pages/Customer/BookingCourtPage";
import ContactPage from "../pages/Customer/ContactPage";
import AboutPage from "../pages/Customer/AboutPage";
import HistoryPage from "../pages/Customer/HistoryPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import NotFoundPage from "../pages/NotFoundPage";

const CustomerRoute = () => {
  return (
    <div>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/customer/home" element={<HomePage />}></Route>
          <Route path="/customer/product" element={<ProductPage />}></Route>
          <Route
            path="/customer/booking"
            element={<BookingCourtPage />}
          ></Route>
          <Route path="/customer/history" element={<HistoryPage />}></Route>
          <Route path="/customer/contact" element={<ContactPage />}></Route>
          <Route path="/customer/about" element={<AboutPage />}></Route>
        </Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/register" element={<RegisterPage />}></Route>
        <Route path="/forgotpass" element={<ForgotPasswordPage />}></Route>
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </div>
  );
};
export default CustomerRoute;
