import User from "./user.js";
import Role from "./role.js";
import Profile from "./profile.js";
import Report from "./report.js";
import Booking from "./booking.js";
import Court from "./court.js";
import CourtSchedule from "./courtSchedule.js";
import Notification from "./notification.js";
import Order from "./order.js";
import Discount from "./discount.js";
import OrderDetail from "./orderDetail.js";
import Payment from "./payment.js";
import Product from "./product.js";
import Category from "./category.js";
import Cart from "./cart.js";
import CartItem from "./cartItem.js";
import ProductVarient from "./productVarient.js";
import ProductImage from "./productImage.js";
import ProductFeedback from "./productFeedback.js";
import UserOtp from "./userOtp.js";
import DiscountBooking from "./discountBooking.js";
import PaymentBooking from "./paymentBooking.js";
import BookingFeedback from "./bookingFeedback.js";
import CourtPrice from "./courtPrice.js";

// Quan hệ n-1 giữa Role và User
Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

// Quan hệ 1-1 giữa User và Profile
User.hasOne(Profile, { foreignKey: "userId" });
Profile.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-n giữa User và Report
User.hasMany(Report, { foreignKey: "userId" });
Report.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-n User -> BookingFeedback
User.hasMany(BookingFeedback, { foreignKey: "userId" });
BookingFeedback.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-1 Booking -> BookingFeedback
Booking.hasOne(BookingFeedback, { foreignKey: "bookingId" });
BookingFeedback.belongsTo(Booking, { foreignKey: "bookingId" });

// Quan hệ 1-n Court -> BookingFeedback
Court.hasMany(BookingFeedback, { foreignKey: "courtId" });
BookingFeedback.belongsTo(Court, { foreignKey: "courtId" });

// Quan hệ 1-n giữa User và Booking
User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-1 giữa Booking và Court
Court.hasMany(Booking, { foreignKey: "courtId" });
Booking.belongsTo(Court, { foreignKey: "courtId" });

// Quan hệ 1-1 giữa Booking - Discount
DiscountBooking.hasOne(Booking, { foreignKey: "discountId" });
Booking.belongsTo(DiscountBooking, { foreignKey: "discountId" });

//Quan hệ 1-1 giữa Booking - PaymentBooking
Booking.hasOne(PaymentBooking, { foreignKey: "bookingId", as: "payment" });
PaymentBooking.belongsTo(Booking, { foreignKey: "bookingId", as: "booking" });

// Quan hệ 1-n giữa Court và CourtSchedule
Court.hasMany(CourtSchedule, { foreignKey: "courtId", as: "courtSchedules" });
CourtSchedule.belongsTo(Court, { foreignKey: "courtId", as: "court" });

// Quan hệ 1-n giữa User và Notification
User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-n giữa User và Order
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-1 giữa Discount và Order
Discount.hasOne(Order, { foreignKey: "discountId" });
Order.belongsTo(Discount, { foreignKey: "discountId" });

// Quan hệ 1-n giữa Order và OrderDetail
Order.hasMany(OrderDetail, { foreignKey: "orderId", as: "orderDetails" });
OrderDetail.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// Quan hệ 1-n giữa Order và Payment
Order.hasOne(Payment, { foreignKey: "orderId", as: "payment" });
Payment.belongsTo(Order, { foreignKey: "orderId", as: "orders" });

//Quan hệ 1-1 giữa ProductVarient và OrderDetail
ProductVarient.hasOne(OrderDetail, {
  foreignKey: "varientId",
  as: "orderDetail",
});
OrderDetail.belongsTo(ProductVarient, {
  foreignKey: "varientId",
  as: "varient",
});

// Quan hệ 1-n giữa Category và Product
Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

// Quan hệ 1-n giữa Cart và CartItem
Cart.hasMany(CartItem, { foreignKey: "cartId" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

// Quan hệ 1-1 giữa Card và User
User.hasOne(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-1 giữa Product và CartItem
ProductVarient.hasOne(CartItem, { foreignKey: "varientId", as: "cartItem" });
CartItem.belongsTo(ProductVarient, { foreignKey: "varientId", as: "varient" });

// Quan hệ 1-n giữa Product và ProductVarient
Product.hasMany(ProductVarient, { foreignKey: "productId", as: "varients" });
ProductVarient.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Quan hệ 1-n giữa ProductVarient và ProductImage
Product.hasMany(ProductImage, { foreignKey: "productId", as: "images" });
ProductImage.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Quan hệ 1-n giữa User và UserOtp
User.hasMany(UserOtp, { foreignKey: "userId" });
UserOtp.belongsTo(User, { foreignKey: "userId" });

// Quan hệ n-n giữa User và Product thông qua ProductFeedback
User.belongsToMany(ProductVarient, {
  through: ProductFeedback,
  foreignKey: "userId",
  otherKey: "varientId",
});
ProductVarient.belongsToMany(User, {
  through: ProductFeedback,
  foreignKey: "varientId",
  otherKey: "userId",
});

// Quan hệ 1-1 giữa ProductFeedback và OrderDetail
ProductFeedback.belongsTo(OrderDetail, {
  foreignKey: "orderDetailId",
  as: "orderDetail",
});
OrderDetail.hasOne(ProductFeedback, {
  foreignKey: "orderDetailId",
  as: "feedback",
});

export {
  Role,
  User,
  Profile,
  Report,
  Booking,
  Court,
  CourtSchedule,
  PaymentBooking,
  DiscountBooking,
  Notification,
  Order,
  Discount,
  OrderDetail,
  Payment,
  Product,
  Category,
  Cart,
  CartItem,
  ProductImage,
  ProductVarient,
  ProductFeedback,
  BookingFeedback,
  CourtPrice,
};
