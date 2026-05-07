import User from "./user.js";
import Role from "./role.js";
import Profile from "./profile.js";
import UserOtp from "./userOtp.js";
import UserAddress from "./userAddress.js";

import Branch from "./branch.js";
import BranchManager from "./branchManager.js";
import BranchImage from "./branchImage.js";

import Court from "./court.js";
import CourtPrice from "./courtPrice.js";

import Booking from "./booking.js";
import BookingDetail from "./bookingDetail.js";

import Cart from "./cart.js";
import CartItem from "./cartItem.js";

import Product from "./product.js";
import ProductVariant from "./productVariant.js";
import ProductImage from "./productImage.js";
import Category from "./category.js";

import Order from "./order.js";
import OrderDetail from "./orderDetail.js";
import Payment from "./payment.js";
import Discount from "./discount.js";

import DraftBooking from "./draftBooking.js";
import DraftBookingItem from "./draftBookingItem.js";
import DraftProductItem from "./draftProductItem.js";
import DraftBeverageItem from "./draftBeverageItem.js";

import OfflineBooking from "./offlineBooking.js";

import Beverage from "./beverage.js";

import Wallet from "./wallet.js";
import WalletTransaction from "./walletTransaction.js";

import Feedback from "./feedback.js";

import Post from "./post.js";
import PostLike from "./postLike.js";
import PostShare from "./postShare.js";
import Comment from "./comment.js";

import Conversation from "./conversation.js";
import ConversationParticipant from "./conversationParticipant.js";
import Message from "./message.js";

import Notification from "./notification.js";

import WorkShift from "./workShift.js";
import WorkShiftEmployee from "./workShiftEmployee.js";
import CashRegister from "./cashRegister.js";

import CoachProfile from "./coachProfile.js";
import WithdrawRequest from "./withDrawRequest.js";
import RefreshToken from "./refreshToken.js";

import OrderGroup from "./orderGroup.js";
import VariantStock from "./variantStock.js";
import OrderShippingLog from "./orderShippingLog.js";

//////////////////////////////////////////////////////
//////////////// USER SYSTEM /////////////////////////
//////////////////////////////////////////////////////

Role.hasMany(User, { foreignKey: "roleId", as: "users" });
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

User.hasOne(Profile, { foreignKey: "userId", as: "profile" });
Profile.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(UserOtp, { foreignKey: "userId", as: "otps" });
UserOtp.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(UserAddress, { foreignKey: "userId", as: "addresses" });
UserAddress.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(RefreshToken, { foreignKey: "userId", as: "tokens" });
RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });

//////////////////////////////////////////////////////
//////////////// WALLET //////////////////////////////
//////////////////////////////////////////////////////

User.hasOne(Wallet, { foreignKey: "userId", as: "wallet" });
Wallet.belongsTo(User, { foreignKey: "userId", as: "user" });

Wallet.hasMany(WalletTransaction, {
  foreignKey: "walletId",
  as: "walletTransactions",
});
WalletTransaction.belongsTo(Wallet, {
  foreignKey: "walletId",
  as: "wallet",
});

Wallet.hasMany(WithdrawRequest, {
  foreignKey: "walletId",
  as: "withdrawRequests",
});
WithdrawRequest.belongsTo(Wallet, {
  foreignKey: "walletId",
  as: "wallet",
});

Payment.hasMany(WalletTransaction, {
  foreignKey: "paymentId",
  as: "paymentTransactions",
});
WalletTransaction.belongsTo(Payment, {
  foreignKey: "paymentId",
  as: "payment",
});

WithdrawRequest.hasMany(WalletTransaction, {
  foreignKey: "withdrawRequestId",
  as: "withdrawTransactions",
});
WalletTransaction.belongsTo(WithdrawRequest, {
  foreignKey: "withdrawRequestId",
  as: "withdrawRequest",
});

//////////////////////////////////////////////////////
//////////////// BRANCH //////////////////////////////
//////////////////////////////////////////////////////

Branch.hasMany(Court, {
  foreignKey: "branchId",
  as: "courts",
});
Court.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branch",
});

Branch.hasMany(CourtPrice, {
  foreignKey: "branchId",
  as: "courtPrices",
});
CourtPrice.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branch",
});

Branch.hasMany(BranchImage, {
  foreignKey: "branchId",
  as: "images",
});
BranchImage.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branch",
});

//////////////////////////////////////////////////////
/////////////// BRANCH MANAGER ///////////////////////
//////////////////////////////////////////////////////

User.belongsToMany(Branch, {
  through: BranchManager,
  foreignKey: "managerId",
  otherKey: "branchId",
  as: "managedBranches",
});
Branch.belongsToMany(User, {
  through: BranchManager,
  foreignKey: "branchId",
  otherKey: "managerId",
  as: "managers",
});

Branch.hasMany(BranchManager, {
  foreignKey: "branchId",
  as: "branchManagers",
});
BranchManager.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

User.hasMany(BranchManager, { foreignKey: "managerId", as: "branchManagers" });
BranchManager.belongsTo(User, { foreignKey: "managerId", as: "manager" });

//////////////////////////////////////////////////////
//////////////// BOOKING /////////////////////////////
//////////////////////////////////////////////////////

User.hasMany(Booking, {
  foreignKey: "userId",
  as: "bookings",
});
Booking.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Branch.hasMany(Booking, {
  foreignKey: "branchId",
  as: "bookings",
});
Booking.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branch",
});

Discount.hasMany(Booking, {
  foreignKey: "discountId",
  as: "bookings",
});
Booking.belongsTo(Discount, {
  foreignKey: "discountId",
  as: "discount",
});

Booking.hasMany(BookingDetail, {
  foreignKey: "bookingId",
  as: "details",
});
BookingDetail.belongsTo(Booking, {
  foreignKey: "bookingId",
  as: "booking",
});

Court.hasMany(BookingDetail, {
  foreignKey: "courtId",
  as: "bookingDetails",
});
BookingDetail.belongsTo(Court, {
  foreignKey: "courtId",
  as: "court",
});

//////////////////////////////////////////////////////
//////////////// CART ////////////////////////////////
//////////////////////////////////////////////////////

User.hasOne(Cart, {
  foreignKey: "userId",
  as: "cart",
});
Cart.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Cart.hasMany(CartItem, {
  foreignKey: "cartId",
  as: "items",
});
CartItem.belongsTo(Cart, {
  foreignKey: "cartId",
  as: "cart",
});

ProductVariant.hasMany(CartItem, {
  foreignKey: "variantId",
  as: "cartItems",
});
CartItem.belongsTo(ProductVariant, {
  foreignKey: "variantId",
  as: "variant",
});

ProductVariant.hasMany(VariantStock, {
  foreignKey: "variantId",
  as: "stocks",
});
VariantStock.belongsTo(ProductVariant, {
  foreignKey: "variantId",
  as: "variant",
});
Branch.hasMany(VariantStock, {
  foreignKey: "branchId",
  as: "variantStocks",
});
VariantStock.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branch",
});

//////////////////////////////////////////////////////
//////////////// PRODUCT /////////////////////////////
//////////////////////////////////////////////////////

Category.hasMany(Product, {
  foreignKey: "categoryId",
  as: "products",
});
Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

Product.hasMany(ProductVariant, {
  foreignKey: "productId",
  as: "variants",
});
ProductVariant.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

Product.hasMany(ProductImage, {
  foreignKey: "productId",
  as: "images",
});
ProductImage.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

//////////////////////////////////////////////////////
//////////////// ORDER ///////////////////////////////
//////////////////////////////////////////////////////

User.hasMany(OrderGroup, {
  foreignKey: "userId",
  as: "orderGroups",
});
OrderGroup.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Branch.hasMany(Order, {
  foreignKey: "branchId",
  as: "orders",
});
Order.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branch",
});

Discount.hasMany(OrderGroup, {
  foreignKey: "discountId",
  as: "orderGroup",
});
OrderGroup.belongsTo(Discount, {
  foreignKey: "discountId",
  as: "discount",
});

OrderGroup.hasMany(Order, {
  foreignKey: "orderGroupId",
  as: "orders",
});
Order.belongsTo(OrderGroup, {
  foreignKey: "orderGroupId",
  as: "orderGroup",
});

Order.hasMany(OrderDetail, {
  foreignKey: "orderId",
  as: "details",
});
OrderDetail.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

OrderShippingLog.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});
Order.hasMany(OrderShippingLog, {
  foreignKey: "orderId",
  as: "shippingLogs",
});

ProductVariant.hasMany(OrderDetail, {
  foreignKey: "variantId",
  as: "orderDetails",
});
OrderDetail.belongsTo(ProductVariant, {
  foreignKey: "variantId",
  as: "variant",
});

//////////////////////////////////////////////////////
//////////////// DRAFT BOOKING ///////////////////////
//////////////////////////////////////////////////////

User.hasMany(DraftBooking, {
  foreignKey: "employeeId",
  as: "draftBookings",
});
DraftBooking.belongsTo(User, {
  foreignKey: "employeeId",
  as: "employee",
});

Branch.hasMany(DraftBooking, {
  foreignKey: "branchId",
  as: "draftBookings",
});
DraftBooking.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branch",
});

DraftBooking.hasMany(DraftBookingItem, {
  foreignKey: "draftId",
  as: "courtItems",
});
DraftBookingItem.belongsTo(DraftBooking, {
  foreignKey: "draftId",
  as: "draft",
});

Court.hasMany(DraftBookingItem, {
  foreignKey: "courtId",
  as: "draftItems",
});
DraftBookingItem.belongsTo(Court, {
  foreignKey: "courtId",
  as: "court",
});

DraftBooking.hasMany(DraftProductItem, {
  foreignKey: "draftId",
  as: "productItems",
});
DraftProductItem.belongsTo(DraftBooking, {
  foreignKey: "draftId",
  as: "draft",
});

ProductVariant.hasMany(DraftProductItem, {
  foreignKey: "productVariantId",
  as: "draftItems",
});
DraftProductItem.belongsTo(ProductVariant, {
  foreignKey: "productVariantId",
  as: "variant",
});

DraftBooking.hasMany(DraftBeverageItem, {
  foreignKey: "draftId",
  as: "beverageItems",
});
DraftBeverageItem.belongsTo(DraftBooking, {
  foreignKey: "draftId",
  as: "draft",
});

Beverage.hasMany(DraftBeverageItem, {
  foreignKey: "beverageId",
  as: "draftItems",
});
DraftBeverageItem.belongsTo(Beverage, {
  foreignKey: "beverageId",
  as: "beverage",
});

//////////////////////////////////////////////////////
//////////////// OFFLINE BOOKING /////////////////////
//////////////////////////////////////////////////////

DraftBooking.hasOne(OfflineBooking, {
  foreignKey: "draftId",
  as: "offlineBooking",
});

OfflineBooking.belongsTo(DraftBooking, {
  foreignKey: "draftId",
  as: "draft",
});

//////////////////////////////////////////////////////
//////////////// SOCIAL //////////////////////////////
//////////////////////////////////////////////////////

User.hasMany(Post, { foreignKey: "authorId", as: "posts" });
Post.belongsTo(User, { foreignKey: "authorId", as: "author" });

// Repost relationship (self-reference)
Post.belongsTo(Post, { foreignKey: "repostOfPostId", as: "repostOf" });
Post.hasMany(Post, { foreignKey: "repostOfPostId", as: "reposts" });

Post.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" });

User.hasMany(Comment, { foreignKey: "authorId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "authorId", as: "author" });

Comment.hasMany(Comment, { foreignKey: "parentId", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "parentId", as: "parent" });

User.belongsToMany(Post, {
  through: PostLike,
  foreignKey: "userId",
  otherKey: "postId",
  as: "likedPosts",
});
Post.belongsToMany(User, {
  through: PostLike,
  foreignKey: "postId",
  otherKey: "userId",
  as: "likedUsers",
});

User.hasMany(PostLike, {
  foreignKey: "userId",
  as: "likes",
});
PostLike.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Post.hasMany(PostLike, {
  foreignKey: "postId",
  as: "likes",
});
PostLike.belongsTo(Post, {
  foreignKey: "postId",
  as: "post",
});

User.belongsToMany(Post, {
  through: PostShare,
  foreignKey: "userId",
  otherKey: "postId",
  as: "sharedPosts",
});
Post.belongsToMany(User, {
  through: PostShare,
  foreignKey: "postId",
  otherKey: "userId",
  as: "sharedUsers",
});

User.hasMany(PostShare, {
  foreignKey: "userId",
  as: "shares",
});
PostShare.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Post.hasMany(PostShare, {
  foreignKey: "postId",
  as: "shares",
});
PostShare.belongsTo(Post, {
  foreignKey: "postId",
  as: "post",
});

//////////////////////////////////////////////////////
//////////////// CHAT ////////////////////////////////
//////////////////////////////////////////////////////

Conversation.belongsToMany(User, {
  through: ConversationParticipant,
  foreignKey: "conversationId",
  otherKey: "userId",
  as: "participants",
});
User.belongsToMany(Conversation, {
  through: ConversationParticipant,
  foreignKey: "userId",
  otherKey: "conversationId",
  as: "conversations",
});

Conversation.hasMany(ConversationParticipant, {
  foreignKey: "conversationId",
  as: "conversationParticipants",
});
ConversationParticipant.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

User.hasMany(ConversationParticipant, {
  foreignKey: "userId",
  as: "conversationParticipants",
});
ConversationParticipant.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  as: "messages",
});
Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

User.hasMany(Message, {
  foreignKey: "senderId",
  as: "sentMessages",
});
Message.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
});

Message.belongsTo(Message, { foreignKey: "replyToId", as: "replyToMessage" });
Message.hasMany(Message, { foreignKey: "replyToId", as: "replies" });

//////////////////////////////////////////////////////
//////////////// NOTIFICATION ////////////////////////
//////////////////////////////////////////////////////

User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications",
});
Notification.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

//////////////////////////////////////////////////////
//////////////// WORKSHIFT ///////////////////////////
//////////////////////////////////////////////////////

Branch.hasMany(WorkShift, {
  foreignKey: "branchId",
  as: "workShifts",
});
WorkShift.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branch",
});

WorkShift.hasMany(WorkShiftEmployee, {
  foreignKey: "workShiftId",
  as: "workShiftEmployees",
});
WorkShiftEmployee.belongsTo(WorkShift, {
  foreignKey: "workShiftId",
  as: "workShift",
});

User.hasMany(WorkShiftEmployee, {
  foreignKey: "employeeId",
  as: "workShiftAssignments",
});
WorkShiftEmployee.belongsTo(User, {
  foreignKey: "employeeId",
  as: "employee",
});

WorkShiftEmployee.hasOne(CashRegister, {
  foreignKey: "workShiftEmployeeId",
  as: "cashRegister",
});
CashRegister.belongsTo(WorkShiftEmployee, {
  foreignKey: "workShiftEmployeeId",
  as: "workShiftEmployee",
});

//////////////////////////////////////////////////////
//////////////// COACH ///////////////////////////////
//////////////////////////////////////////////////////

User.hasOne(CoachProfile, {
  foreignKey: "userId",
  as: "coachProfile",
});

CoachProfile.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

//////////////////////////////////////////////////////
//////////////// FEEDBACK ///////////////////////////////
//////////////////////////////////////////////////////
User.hasMany(Feedback, { foreignKey: "userId", as: "feedbacks" });
Feedback.belongsTo(User, { foreignKey: "userId", as: "user" });

Order.hasMany(Feedback, { foreignKey: "orderId", as: "feedbacks" });
Feedback.belongsTo(Order, { foreignKey: "orderId", as: "order" });

ProductVariant.hasMany(Feedback, {
  foreignKey: "productVariantId",
  as: "feedbacks",
});
Feedback.belongsTo(ProductVariant, {
  foreignKey: "productVariantId",
  as: "variant",
});

Branch.hasMany(Feedback, { foreignKey: "branchId", as: "feedbacks" });
Feedback.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

//////////////////////////////////////////////////////

export {
  User,
  Role,
  Profile,
  UserOtp,
  UserAddress,
  Branch,
  BranchManager,
  BranchImage,
  Court,
  CourtPrice,
  Booking,
  BookingDetail,
  Cart,
  CartItem,
  Product,
  ProductVariant,
  ProductImage,
  Category,
  OrderGroup,
  Order,
  OrderDetail,
  OrderShippingLog,
  Payment,
  Discount,
  DraftBooking,
  DraftBookingItem,
  DraftProductItem,
  DraftBeverageItem,
  OfflineBooking,
  Beverage,
  Wallet,
  WalletTransaction,
  WithdrawRequest,
  Feedback,
  Post,
  PostLike,
  PostShare,
  Comment,
  Conversation,
  ConversationParticipant,
  Message,
  Notification,
  WorkShift,
  WorkShiftEmployee,
  CashRegister,
  CoachProfile,
  VariantStock,
  RefreshToken,
};
