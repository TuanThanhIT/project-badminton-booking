import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/user/HomePage";
import ProductPage from "../pages/user/ProductPage";
import ContactPage from "../pages/user/ContactPage";
import AboutPage from "../pages/user/AboutPage";
import HistoryPage from "../pages/user/HistoryPage";
import LoginPage from "../pages/user/LoginPage";
import RegisterPage from "../pages/user/RegisterPage";
import ForgotPasswordPage from "../pages/user/ForgotPasswordPage";
import OTPPage from "../pages/user/OTPPage";
import ProfilePage from "../pages/user/ProfilePage";
import CartPage from "../pages/user/CartPage";
import GuestHomePage from "../pages/user/GuestHomePage";
import ProductDetailPage from "../pages/user/ProductDetailPage";
import CheckoutPage from "../pages/user/CheckoutPage";
import OrderPage from "../pages/user/OrderPage";
import UserPublicLayout from "../components/layouts/UserPublicLayout";
import UserPrivateLayout from "../components/layouts/UserPrivateLayout";
import BookingCourtPage from "../pages/user/BookingCourtPage";
import BookingPage from "../pages/user/BookingPage";
import CreatePostPage from "../pages/user/CreatePostPage";
import PostListPage from "../pages/user/postList/PostListPage";

const UserRoute = () => {
  return (
    <Routes>
      {/* Public */}
      <Route element={<UserPublicLayout />}>
        <Route index element={<GuestHomePage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-otp" element={<OTPPage />} />
        <Route path="forgot-pass" element={<ForgotPasswordPage />} />
      </Route>

      {/* Private */}
      <Route element={<UserPrivateLayout />}>
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
        <Route path="create-post" element={<CreatePostPage />} />
        <Route path="posts" element={<PostListPage />} />
      </Route>
    </Routes>
  );
};

export default UserRoute;
