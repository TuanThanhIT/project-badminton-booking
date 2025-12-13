import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Customer/HomePage";
import ProductPage from "../pages/Customer/ProductPage";
import BookingCourtPage from "../pages/Customer/BookingCourtPage";
import ContactPage from "../pages/Customer/ContactPage";
import AboutPage from "../pages/Customer/AboutPage";
import HistoryPage from "../pages/Customer/HistoryPage";
import LoginPage from "../pages/Customer/LoginPage";
import RegisterPage from "../pages/Customer/RegisterPage";
import ForgotPasswordPage from "../pages/Customer/ForgotPasswordPage";
import OTPPage from "../pages/Customer/OTPPage";
import ProfilePage from "../pages/Customer/ProfilePage";
import CartPage from "../pages/Customer/CartPage";
import CustomerPrivateLayout from "../components/layouts/CustomerPrivateLayout";
import CustomerPublicLayout from "../components/layouts/CustomerPublicLayout";
import AuthGuard from "../components/guards/AuthGuard";
import GuestHomePage from "../pages/Customer/GuestHomePage";
import ProductDetailPage from "../pages/Customer/ProductDetailPage";
import CheckoutPage from "../pages/Customer/CheckoutPage";
import OrderPage from "../pages/Customer/OrderPage";
import OrderSuccessPage from "../pages/Customer/OrderSuccessPage";
import MomoReturnPage from "../pages/Customer/MomoReturnPage";
import BookingCourtDetailPage from "../pages/Customer/BooingCourtDetailPage";
import BookingSuccessPage from "../pages/Customer/BookingSuccessPage";
import BookingPage from "../pages/Customer/BookingPage";

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
