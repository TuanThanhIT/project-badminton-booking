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
import NotFoundPage from "../pages/NotFoundPage";
import OTPPage from "../pages/Customer/OTPPage";
import ProfilePage from "../pages/Customer/ProfilePage";
import CartPage from "../pages/Customer/CartPage";
import CustomerPrivateLayout from "../components/layouts/CustomerPrivateLayout";
import CustomerPublicLayout from "../components/layouts/CustomerPublicLayout";
import AuthGuard from "../components/guards/AuthGuard";
import GuestHomePage from "../pages/Customer/GuestHomePage";
import ProductDetailPage from "../pages/Customer/ProductDetailPage";
import PaymentResultPage from "../pages/Customer/PaymentResultPage";
import CheckoutPage from "../pages/Customer/CheckoutPage";
import OrderPage from "../pages/Customer/OrderPage";
import OrderSuccessPage from "../pages/Customer/OrderSuccessPage";
import MomoReturnPage from "../pages/Customer/MomoReturnPage";

const CustomerRoute = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<CustomerPublicLayout />}>
          <Route index element={<GuestHomePage />}></Route>
          <Route path="contact" element={<ContactPage />}></Route>
          <Route path="about" element={<AboutPage />}></Route>
          <Route path="login" element={<LoginPage />}></Route>
          <Route path="register" element={<RegisterPage />}></Route>
          <Route path="verify-otp" element={<OTPPage />}></Route>
          <Route path="forgotpass" element={<ForgotPasswordPage />}></Route>
        </Route>
        <Route
          path="/"
          element={
            <AuthGuard>
              <CustomerPrivateLayout />
            </AuthGuard>
          }
        >
          <Route path="home" element={<HomePage />}></Route>
          <Route path="products" element={<ProductPage />}></Route>
          <Route path="product/:id" element={<ProductDetailPage />}></Route>
          <Route path="booking" element={<BookingCourtPage />}></Route>
          <Route path="history" element={<HistoryPage />}></Route>
          <Route path="profile" element={<ProfilePage />}></Route>
          <Route path="cart" element={<CartPage />}></Route>
          <Route path="payment-result" element={<PaymentResultPage />}></Route>
          <Route path="checkout" element={<CheckoutPage />}></Route>
          <Route path="orders" element={<OrderPage />}></Route>
          <Route path="orders/success" element={<OrderSuccessPage />}></Route>
          <Route path="orders/momo-return" element={<MomoReturnPage />}></Route>
        </Route>

        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </div>
  );
};
export default CustomerRoute;
