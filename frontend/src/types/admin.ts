// ─── User Management ─────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  avatar?: string;
  gender?: string;
  role?: string;
  isVerified: boolean;
  isActive: boolean;
  createdDate: string;
}

export interface AdminUserProfile {
  fullName: string;
  phoneNumber: string;
  avatar: string;
  gender: string;
  dob: string;
  address: string;
  level: string;
}

export interface AdminUserDetail extends AdminUser {
  profile?: AdminUserProfile;
  managedBranches?: AdminManagedBranch[];
}

// ─── Manager Management ───────────────────────────────────────────────────────

export interface AdminManagedBranch {
  branchManagerId: number;
  branchId: number;
  branchName: string;
  assignedDate: string;
}

export interface AdminManager {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  avatar?: string;
  isActive: boolean;
  createdDate: string;
  managedBranches: AdminManagedBranch[];
}

// ─── Branch Management ────────────────────────────────────────────────────────

export interface AdminBranchOption {
  id: number;
  branchName: string;
}

export interface AdminBranchManager {
  id: number;
  username: string;
  email: string;
  fullName?: string;
}

export interface AdminBranch {
  id: number;
  branchName: string;
  address: string;
  districtName: string;
  provinceName: string;
  wardName?: string;
  fullAddress?: string;
  phoneNumber: string;
  isActive: boolean;
  createdDate: string;
  managers?: AdminBranchManager[];
}

// ─── Beverage Management ──────────────────────────────────────────────────────

export interface AdminBeverage {
  id: number;
  beverageName: string;
  thumbnailUrl?: string;
  price: number;
  totalStock: number;
  createdDate: string;
}

// ─── Category Management ──────────────────────────────────────────────────────

export interface AdminCategory {
  id: number;
  cateName: string;
  menuGroup: string;
  createdDate?: string;
}

// ─── Product Management ───────────────────────────────────────────────────────

export interface AdminProduct {
  id: number;
  productName: string;
  brand: string;
  description: string;
  thumbnailUrl: string;
  categoryId: number;
  cateName?: string;
  menuGroup?: string;
  variantCount: number;
  totalStock: number;
  createdDate: string;
}

// ─── Discount Management ──────────────────────────────────────────────────────

export interface AdminDiscount {
  id: number;
  code: string;
  type: string;
  applyType: string;
  value: number;
  maxDiscount?: number;
  minAmount: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdDate: string;
}

// ─── Feedback Management ──────────────────────────────────────────────────────

export interface AdminFeedback {
  id: number;
  content: string;
  rating: number;
  createdDate: string;
  feedbackType: string;
  userId?: number;
  userName?: string;
  userAvatar?: string;
  branchId?: number;
  branchName?: string;
  variantId?: number;
  productName?: string;
  productThumbnail?: string;
  variantInfo?: string;
}

// ─── Finance Management ───────────────────────────────────────────────────────

export interface AdminFinanceStats {
  pendingWithdrawCount: number;
  pendingWithdrawAmount: number;
  todayDeposit: number;
  totalSystemBalance: number;
}

export interface AdminWalletUser {
  userId?: number;
  username?: string;
  email?: string;
  fullName?: string;
  avatar?: string;
}

export interface AdminWalletTransaction extends AdminWalletUser {
  id: number;
  amount: number;
  type: string;
  status: string;
  description?: string;
  createdDate: string;
  walletId: number;
  walletBalance: number;
}

export interface AdminWithdrawRequest extends AdminWalletUser {
  id: number;
  amount: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  status: string;
  processedAt?: string;
  createdDate: string;
  walletId: number;
  walletBalance: number;
}

export interface AdminUserWallet extends AdminWalletUser {
  id: number;
  balance: number;
  status: string;
  createdDate: string;
}

// ─── Post Management ──────────────────────────────────────────────────────────

export interface AdminPost {
  id: number;
  title: string;
  type: string;
  content?: string;
  isActive: boolean;
  isDeleted: boolean;
  isRepost: boolean;
  commentCount: number;
  createdDate: string;
  authorId?: number;
  authorUsername?: string;
  authorName?: string;
  authorAvatar?: string;
}

export interface AdminComment {
  id: number;
  content: string;
  type: string;
  postId: number;
  parentId?: number;
  createdDate: string;
  authorId?: number;
  authorUsername?: string;
  authorName?: string;
  authorAvatar?: string;
  postTitle?: string;
  postType?: string;
}

// ─── Revenue Management ───────────────────────────────────────────────────────

export interface AdminRevenueOverview {
  bookingRevenue: number;
  orderRevenue: number;
  totalRevenue: number;
  bookingCount: number;
  orderCount: number;
}

export interface AdminBranchRevenue {
  branchId: number;
  branchName: string;
  bookingRevenue: number;
  bookingCount: number;
  orderRevenue: number;
  orderCount: number;
  totalRevenue: number;
}

export interface AdminDateRevenue {
  date: string;
  bookingRevenue: number;
  bookingCount: number;
  orderRevenue: number;
  orderCount: number;
  totalRevenue: number;
}

export interface AdminMonthRevenue {
  month: string;
  bookingRevenue: number;
  bookingCount: number;
  orderRevenue: number;
  orderCount: number;
  totalRevenue: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  orderCount: number;
  orderGrowth: number;
  bookingCount: number;
  bookingGrowth: number;
  userCount: number;
}

export interface AdminDashboardChartItem {
  date: string;
  label: string;
  bookingRevenue: number;
  orderRevenue: number;
  total: number;
}

export interface AdminDashboardRecentItem {
  id: number;
  status: string;
  amount: number;
  createdDate: string;
  branchName?: string;
  fullName?: string;
  username?: string;
  avatar?: string;
  email?: string;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  chart: AdminDashboardChartItem[];
  recentBookings: AdminDashboardRecentItem[];
  recentOrders: AdminDashboardRecentItem[];
}
