import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/customer/HomePage";
import ProductPage from "../pages/customer/ProductPage";
import BookingCourtPage from "../pages/customer/BookingCourtPage";
import ContactPage from "../pages/customer/ContactPage";
import AboutPage from "../pages/customer/AboutPage";
import HistoryPage from "../pages/customer/HistoryPage";
import LoginPage from "../pages/customer/LoginPage";
import RegisterPage from "../pages/customer/RegisterPage";
import ForgotPasswordPage from "../pages/customer/ForgotPasswordPage";
import OTPPage from "../pages/customer/OTPPage";
import ProfilePage from "../pages/customer/ProfilePage";
import CartPage from "../pages/customer/CartPage";
import CustomerPrivateLayout from "../components/layouts/CustomerPrivateLayout";
import CustomerPublicLayout from "../components/layouts/CustomerPublicLayout";
import AuthGuard from "../components/guards/AuthGuard";
import GuestHomePage from "../pages/customer/GuestHomePage";
import ProductDetailPage from "../pages/customer/ProductDetailPage";
import CheckoutPage from "../pages/customer/CheckoutPage";
import OrderPage from "../pages/customer/OrderPage";
import OrderSuccessPage from "../pages/customer/OrderSuccessPage";
import MomoReturnPage from "../pages/customer/MomoReturnPage";
import BookingCourtDetailPage from "../pages/customer/BooingCourtDetailPage";
import BookingSuccessPage from "../pages/customer/BookingSuccessPage";
import BookingPage from "../pages/customer/BookingPage";

const CustomerRoute = () => {
  return (
    <Routes>
      {/* Public */}
      <Route element={<CustomerPublicLayout />}>
        <Route index element={<GuestHomePage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-otp" element={<OTPPage />} />
        <Route path="forgotpass" element={<ForgotPasswordPage />} />
      </Route>

      {/* Private */}
      <Route
        element={
          <AuthGuard>
            <CustomerPrivateLayout />
          </AuthGuard>
        }
      >
        <Route path="home" element={<HomePage />} />
        <Route path="products" element={<ProductPage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
        <Route path="booking" element={<BookingCourtPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrderPage />} />
        <Route path="bookings" element={<BookingPage />} />
        <Route path="orders/success" element={<OrderSuccessPage />} />
        <Route path="booking/success" element={<BookingSuccessPage />} />
        <Route path="momo-return" element={<MomoReturnPage />} />
        <Route path="booking/:id" element={<BookingCourtDetailPage />} />
      </Route>
    </Routes>
  );
};

export default CustomerRoute;
