import User from "./user.js";
import Role from "./role.js";
import Profile from "./profile.js";
import Role from "./role.js";
import Report from "./report.js";
import GeneralFeedback from "./generalFeedback.js";
import Booking from "./booking.js";
import Court from "./court.js";
import CourtSchedule from "./courtSchedule.js";
import Notification from "./notification.js";
import Order from "./order.js";
import Invoice from "./invoice.js";
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

// Quan hệ n-1 giữa Role và User
Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

// Quan hệ 1-1 giữa User và Profile
User.hasOne(Profile, { foreignKey: "userId" });
Profile.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-n giữa User và Report
User.hasMany(Report, { foreignKey: "userId" });
Report.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-n giữa User và GeneralFeedback
User.hasMany(GeneralFeedback, { foreignKey: "userId" });
GeneralFeedback.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-n giữa User và Booking
User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-1 giữa Booking và Court
Court.hasOne(Booking, { foreignKey: "courtId" });
Booking.belongsTo(Court, { foreignKey: "courtId" });

// Quan hệ 1-n giữa Court và CourtSchedule
Court.hasMany(CourtSchedule, { foreignKey: "courtId" });
CourtSchedule.belongsTo(Court, { foreignKey: "courtId" });

// Quan hệ 1-n giữa User và Notification
User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-n giữa User và Order
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

// Quan hệ 1-1 giữa Order và Invoice
Order.hasOne(Invoice, { foreignKey: "orderId" });
Invoice.belongsTo(Order, { foreignKey: "orderId" });

// Quan hệ 1-n giữa Discount và Order
Discount.hasMany(Order, { foreignKey: "discountId" });
Order.belongsTo(Discount, { foreignKey: "discountId" });

// Quan hệ 1-n giữa Order và OrderDetail
Order.hasMany(OrderDetail, { foreignKey: "orderId" });
OrderDetail.belongsTo(Order, { foreignKey: "orderId" });

// Quan hệ 1-n giữa Order và Payment
Order.hasMany(Payment, { foreignKey: "orderId" });
Payment.belongsTo(Order, { foreignKey: "orderId" });

//Quan hệ 1-1 giữa Product và OrderDetail
Product.hasOne(OrderDetail, { foreignKey: "productId" });
OrderDetail.belongsTo(Product, { foreignKey: "productId" });

// Quan hệ 1-n giữa Category và Product
Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

// Quan hệ 1-n giữa Cart và CartItem
Cart.hasMany(CartItem, { foreignKey: "cartId" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

// Quan hệ 1-1 giữa Product và CartItem
Product.hasOne(CartItem, { foreignKey: "productId" });
CartItem.belongsTo(Product, { foreignKey: "productId" });

// Quan hệ 1-n giữa Product và ProductVarient
Product.hasMany(ProductVarient, { foreignKey: "productId" });
ProductVarient.belongsTo(Product, { foreignKey: "productId" });

// Quan hệ 1-n giữa ProductVarient và ProductImage
ProductVarient.hasMany(ProductImage, { foreignKey: "varientId" });
ProductImage.belongsTo(ProductVarient, { foreignKey: "varientId" });

// Quan hệ n-n giữa User và Product thông qua ProductFeedback
User.belongsToMany(models.Product, {
  through: models.ProductFeedback,
  foreignKey: "userId",
  otherKey: "productId",
});
Product.belongsToMany(models.User, {
  through: models.ProductFeedback,
  foreignKey: "productId",
  otherKey: "userId",
});
export {
  Role,
  User,
  Profile,
  Role,
  Report,
  Booking,
  Court,
  CourtSchedule,
  Notification,
  Order,
  Invoice,
  Discount,
  OrderDetail,
  Payment,
  Product,
  Category,
  Cart,
  CartItem,
  ProductImage,
  ProductVarient,
};
