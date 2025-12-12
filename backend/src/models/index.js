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
import BookingDetail from "./bookingDetail.js";
import DraftBooking from "./draftBooking.js";
import DraftBookingItem from "./draftBookingItem.js";
import DraftProductItem from "./draftProductItem.js";
import DraftBeverageItem from "./draftBeverageItem.js";
import Beverage from "./beverage.js";
import OfflineBooking from "./offlineBooking.js";
import OfflineBookingItem from "./offlineBookingItem.js";
import OfflineProductItem from "./offlineProductItem.js";
import OfflineBeverageItem from "./offlineBeverageItem.js";
import WorkShift from "./workShift.js";
import WorkShiftEmployee from "./workShiftEmployee.js";
import CashRegister from "./cashRegister.js";

// Quan hệ n-1 giữa Role và User
Role.hasMany(User, { foreignKey: "roleId", as: "users" });
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

// Quan hệ 1-1 giữa User và Profile
User.hasOne(Profile, { foreignKey: "userId" });
Profile.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-n giữa User và Report
User.hasMany(Report, { foreignKey: "userId" });
Report.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-n User -> BookingFeedback
User.hasMany(BookingFeedback, { foreignKey: "userId", as: "bookingFeedbacks" });
BookingFeedback.belongsTo(User, { foreignKey: "userId", as: "user" });

// Quan hệ 1-1 Booking -> BookingFeedback
Booking.hasOne(BookingFeedback, { foreignKey: "bookingId" });
BookingFeedback.belongsTo(Booking, { foreignKey: "bookingId" });

// Quan hệ 1-n Court -> BookingFeedback
Court.hasMany(BookingFeedback, { foreignKey: "courtId" });
BookingFeedback.belongsTo(Court, { foreignKey: "courtId" });

// Quan hệ 1-n giữa User và Booking
User.hasMany(Booking, { foreignKey: "userId", as: "booking" });
Booking.belongsTo(User, { foreignKey: "userId", as: "user" });

// Quan hệ 1-1 giữa Booking - Discount
DiscountBooking.hasOne(Booking, { foreignKey: "discountId" });
Booking.belongsTo(DiscountBooking, { foreignKey: "discountId" });

//Quan hệ 1-1 giữa Booking - PaymentBooking
Booking.hasOne(PaymentBooking, {
  foreignKey: "bookingId",
  as: "paymentBooking",
});
PaymentBooking.belongsTo(Booking, { foreignKey: "bookingId", as: "booking" });

// Quan hệ 1-n giữa Booking và BooingDetail
Booking.hasMany(BookingDetail, {
  foreignKey: "bookingId",
  as: "bookingDetails",
});
BookingDetail.belongsTo(Booking, { foreignKey: "bookingId", as: "booking" });

// Quan hệ 1-1 giữ BookingDetail và CourtSchedule
CourtSchedule.hasOne(BookingDetail, {
  foreignKey: "courtScheduleId",
  as: "bookingDetails",
});
BookingDetail.belongsTo(CourtSchedule, {
  foreignKey: "courtScheduleId",
  as: "courtSchedule",
});

// Quan hệ 1-n giữa Court và CourtSchedule
Court.hasMany(CourtSchedule, { foreignKey: "courtId", as: "courtSchedules" });
CourtSchedule.belongsTo(Court, { foreignKey: "courtId", as: "court" });

// Quan hệ 1-n giữa User và Notification
User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-n giữa User và Order
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

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
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

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

// ======================= DRAFT =======================

// DraftBooking ↔ DraftBookingItem (1-n)
DraftBooking.hasMany(DraftBookingItem, {
  foreignKey: "draftId",
  as: "draftBookingItems",
});
DraftBookingItem.belongsTo(DraftBooking, {
  foreignKey: "draftId",
  as: "draftBooking",
});

// DraftBookingItem ↔ CourtSchedule (1-1)
CourtSchedule.hasOne(DraftBookingItem, {
  foreignKey: "courtScheduleId",
  as: "draftBookingItem",
});
DraftBookingItem.belongsTo(CourtSchedule, {
  foreignKey: "courtScheduleId",
  as: "courtSchedule",
});

// DraftBooking ↔ DraftProductItem (1-n)
DraftBooking.hasMany(DraftProductItem, {
  foreignKey: "draftId",
  as: "draftProductItems",
});
DraftProductItem.belongsTo(DraftBooking, {
  foreignKey: "draftId",
  as: "draftBooking",
});

// DraftProductItem ↔ ProductVarient (1-n)
ProductVarient.hasMany(DraftProductItem, {
  foreignKey: "productVarientId",
  as: "draftProductItems",
});
DraftProductItem.belongsTo(ProductVarient, {
  foreignKey: "productVarientId",
  as: "productVarient",
});

// DraftBooking ↔ DraftBeverageItem (1-n)
DraftBooking.hasMany(DraftBeverageItem, {
  foreignKey: "draftId",
  as: "draftBeverageItems",
});
DraftBeverageItem.belongsTo(DraftBooking, {
  foreignKey: "draftId",
  as: "draftBooking",
});

// DraftBeverageItem ↔ Beverage (1-n)
Beverage.hasMany(DraftBeverageItem, {
  foreignKey: "beverageId",
  as: "draftBeverageItems",
});
DraftBeverageItem.belongsTo(Beverage, {
  foreignKey: "beverageId",
  as: "beverage",
});

// ======================= OFFLINE =======================

// OfflineBooking ↔ OfflineBookingItem (1-n)
OfflineBooking.hasMany(OfflineBookingItem, {
  foreignKey: "offlineBookingId",
  as: "offlineBookingItems",
});
OfflineBookingItem.belongsTo(OfflineBooking, {
  foreignKey: "offlineBookingId",
  as: "offlineBooking",
});

// OfflineBookingItem ↔ CourtSchedule (1-1)
CourtSchedule.hasOne(OfflineBookingItem, {
  foreignKey: "courtScheduleId",
  as: "offlineBookingItem",
});
OfflineBookingItem.belongsTo(CourtSchedule, {
  foreignKey: "courtScheduleId",
  as: "courtSchedule",
});

// OfflineBooking ↔ OfflineProductItem (1-n)
OfflineBooking.hasMany(OfflineProductItem, {
  foreignKey: "offlineBookingId",
  as: "offlineProductItems",
});
OfflineProductItem.belongsTo(OfflineBooking, {
  foreignKey: "offlineBookingId",
  as: "offlineBooking",
});

// OfflineProductItem ↔ ProductVarient (1-n)
ProductVarient.hasMany(OfflineProductItem, {
  foreignKey: "productVarientId",
  as: "offlineProductItems",
});
OfflineProductItem.belongsTo(ProductVarient, {
  foreignKey: "productVarientId",
  as: "productVarient",
});

// OfflineBooking ↔ OfflineBeverageItem (1-n)
OfflineBooking.hasMany(OfflineBeverageItem, {
  foreignKey: "offlineBookingId",
  as: "offlineBeverageItems",
});
OfflineBeverageItem.belongsTo(OfflineBooking, {
  foreignKey: "offlineBookingId",
  as: "offlineBooking",
});

// OfflineBeverageItem ↔ Beverage (1-n)
Beverage.hasMany(OfflineBeverageItem, {
  foreignKey: "beverageId",
  as: "offlineBeverageItems",
});
OfflineBeverageItem.belongsTo(Beverage, {
  foreignKey: "beverageId",
  as: "beverage",
});

// ======================= WORKSHIFT =======================

// WorkShift ↔ WorkShiftEmployee (1-n)
WorkShift.hasMany(WorkShiftEmployee, {
  foreignKey: "workShiftId",
  as: "workShiftEmployees",
});
WorkShiftEmployee.belongsTo(WorkShift, {
  foreignKey: "workShiftId",
  as: "workShift",
});

// WorkShiftEmployee ↔ CashRegister (1-1)
WorkShiftEmployee.hasOne(CashRegister, {
  foreignKey: "workShiftEmployeeId",
  as: "cashRegister",
});
CashRegister.belongsTo(WorkShiftEmployee, {
  foreignKey: "workShiftEmployeeId",
  as: "workShiftEmployee",
});

// ======================= USER =======================

// User ↔ DraftBooking (1-n)
User.hasMany(DraftBooking, { foreignKey: "employeeId", as: "draftBookings" });
DraftBooking.belongsTo(User, { foreignKey: "employeeId", as: "employee" });

// User ↔ OfflineBooking (1-n)
User.hasMany(OfflineBooking, {
  foreignKey: "employeeId",
  as: "offlineBookings",
});
OfflineBooking.belongsTo(User, { foreignKey: "employeeId", as: "employee" });

// User ↔ WorkShiftEmployee (1-n)
User.hasMany(WorkShiftEmployee, {
  foreignKey: "employeeId",
  as: "workShiftAssignments",
});
WorkShiftEmployee.belongsTo(User, { foreignKey: "employeeId", as: "employee" });

// ======================= DRAFT ↔ OFFLINE =======================

// DraftBooking ↔ OfflineBooking (1-1)
DraftBooking.hasOne(OfflineBooking, {
  foreignKey: "draftId",
  as: "offlineBooking",
});
OfflineBooking.belongsTo(DraftBooking, {
  foreignKey: "draftId",
  as: "draftBooking",
});

export {
  Role,
  User,
  Profile,
  Report,
  Booking,
  Beverage,
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
  BookingDetail,
  DraftBooking,
  DraftBeverageItem,
  DraftProductItem,
  DraftBookingItem,
  OfflineBooking,
  OfflineBeverageItem,
  OfflineProductItem,
  OfflineBookingItem,
  WorkShift,
  WorkShiftEmployee,
  CashRegister,
};
