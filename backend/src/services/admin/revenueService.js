import { Op, fn, col } from "sequelize";
import sequelize from "../../config/db.js";
import { Booking, Order, Branch, User, Profile, Role, OrderGroup } from "../../models/index.js";
import { BOOKING_STATUS } from "../../constants/bookingConstant.js";
import { ORDER_STATUS } from "../../constants/orderConstant.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const PAID_BOOKING_STATUSES = [
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.CHECKED_IN,
  BOOKING_STATUS.COMPLETED,
];
const PAID_ORDER_STATUSES = [
  ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY_TO_SHIP,
  ORDER_STATUS.SHIPPING, ORDER_STATUS.COMPLETED,
];

const buildDateRange = (startDate, endDate) => {
  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt[Op.lte] = end;
    }
  }
  return where;
};

const getRevenueOverviewService = async (startDate, endDate) => {
  const dateFilter = buildDateRange(startDate, endDate);

  const [bookingResult, orderResult, bookingCount, orderCount] = await Promise.all([
    Booking.findOne({
      attributes: [[fn("SUM", col("totalAmount")), "total"]],
      where: { bookingStatus: { [Op.in]: PAID_BOOKING_STATUSES }, ...dateFilter },
      raw: true,
    }),
    Order.findOne({
      attributes: [[fn("SUM", col("totalAmount")), "total"]],
      where: { orderStatus: { [Op.in]: PAID_ORDER_STATUSES }, ...dateFilter },
      raw: true,
    }),
    Booking.count({
      where: { bookingStatus: { [Op.in]: PAID_BOOKING_STATUSES }, ...dateFilter },
    }),
    Order.count({
      where: { orderStatus: { [Op.in]: PAID_ORDER_STATUSES }, ...dateFilter },
    }),
  ]);

  const bookingRevenue = Number(bookingResult?.total || 0);
  const orderRevenue = Number(orderResult?.total || 0);

  return {
    bookingRevenue,
    orderRevenue,
    totalRevenue: bookingRevenue + orderRevenue,
    bookingCount,
    orderCount,
  };
};

const getRevenueByBranchService = async (startDate, endDate) => {
  const dateFilter = buildDateRange(startDate, endDate);

  const branches = await Branch.findAll({ attributes: ["id", "branchName"], raw: true });

  const [bookingsByBranch, ordersByBranch] = await Promise.all([
    Booking.findAll({
      attributes: ["branchId", [fn("SUM", col("totalAmount")), "revenue"], [fn("COUNT", col("Booking.id")), "count"]],
      where: { bookingStatus: { [Op.in]: PAID_BOOKING_STATUSES }, ...dateFilter },
      group: ["branchId"],
      raw: true,
    }),
    Order.findAll({
      attributes: ["branchId", [fn("SUM", col("totalAmount")), "revenue"], [fn("COUNT", col("Order.id")), "count"]],
      where: { orderStatus: { [Op.in]: PAID_ORDER_STATUSES }, ...dateFilter },
      group: ["branchId"],
      raw: true,
    }),
  ]);

  const bookingMap = {};
  bookingsByBranch.forEach((b) => { bookingMap[b.branchId] = { revenue: Number(b.revenue), count: Number(b.count) }; });

  const orderMap = {};
  ordersByBranch.forEach((o) => { orderMap[o.branchId] = { revenue: Number(o.revenue), count: Number(o.count) }; });

  return branches.map((branch) => {
    const booking = bookingMap[branch.id] || { revenue: 0, count: 0 };
    const order = orderMap[branch.id] || { revenue: 0, count: 0 };
    return {
      branchId: branch.id,
      branchName: branch.branchName,
      bookingRevenue: booking.revenue,
      bookingCount: booking.count,
      orderRevenue: order.revenue,
      orderCount: order.count,
      totalRevenue: booking.revenue + order.revenue,
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);
};

const getRevenueByDateService = async (startDate, endDate) => {
  const dateFilter = buildDateRange(startDate, endDate);

  const dateExpr = fn("DATE", col("createdAt"));

  const [bookingsByDate, ordersByDate] = await Promise.all([
    Booking.findAll({
      attributes: [[dateExpr, "date"], [fn("SUM", col("totalAmount")), "revenue"], [fn("COUNT", col("Booking.id")), "count"]],
      where: { bookingStatus: { [Op.in]: PAID_BOOKING_STATUSES }, ...dateFilter },
      group: [fn("DATE", col("createdAt"))],
      order: [[fn("DATE", col("createdAt")), "ASC"]],
      raw: true,
    }),
    Order.findAll({
      attributes: [[dateExpr, "date"], [fn("SUM", col("totalAmount")), "revenue"], [fn("COUNT", col("Order.id")), "count"]],
      where: { orderStatus: { [Op.in]: PAID_ORDER_STATUSES }, ...dateFilter },
      group: [fn("DATE", col("createdAt"))],
      order: [[fn("DATE", col("createdAt")), "ASC"]],
      raw: true,
    }),
  ]);

  const allDates = new Set([
    ...bookingsByDate.map((b) => b.date),
    ...ordersByDate.map((o) => o.date),
  ]);

  const bookingMap = {};
  bookingsByDate.forEach((b) => { bookingMap[b.date] = { revenue: Number(b.revenue), count: Number(b.count) }; });

  const orderMap = {};
  ordersByDate.forEach((o) => { orderMap[o.date] = { revenue: Number(o.revenue), count: Number(o.count) }; });

  return Array.from(allDates).sort().map((date) => {
    const booking = bookingMap[date] || { revenue: 0, count: 0 };
    const order = orderMap[date] || { revenue: 0, count: 0 };
    return {
      date,
      bookingRevenue: booking.revenue,
      bookingCount: booking.count,
      orderRevenue: order.revenue,
      orderCount: order.count,
      totalRevenue: booking.revenue + order.revenue,
    };
  });
};

const getRevenueByMonthService = async (startDate, endDate) => {
  const dateFilter = buildDateRange(startDate, endDate);
  const monthExpr = fn("DATE_FORMAT", col("createdAt"), "%Y-%m");

  const [bookingsByMonth, ordersByMonth] = await Promise.all([
    Booking.findAll({
      attributes: [[monthExpr, "month"], [fn("SUM", col("totalAmount")), "revenue"], [fn("COUNT", col("Booking.id")), "count"]],
      where: { bookingStatus: { [Op.in]: PAID_BOOKING_STATUSES }, ...dateFilter },
      group: [fn("DATE_FORMAT", col("createdAt"), "%Y-%m")],
      order: [[fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "ASC"]],
      raw: true,
    }),
    Order.findAll({
      attributes: [[monthExpr, "month"], [fn("SUM", col("totalAmount")), "revenue"], [fn("COUNT", col("Order.id")), "count"]],
      where: { orderStatus: { [Op.in]: PAID_ORDER_STATUSES }, ...dateFilter },
      group: [fn("DATE_FORMAT", col("createdAt"), "%Y-%m")],
      order: [[fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "ASC"]],
      raw: true,
    }),
  ]);

  const allMonths = new Set([
    ...bookingsByMonth.map((b) => b.month),
    ...ordersByMonth.map((o) => o.month),
  ]);

  const bMap = {};
  bookingsByMonth.forEach((b) => { bMap[b.month] = { revenue: Number(b.revenue), count: Number(b.count) }; });
  const oMap = {};
  ordersByMonth.forEach((o) => { oMap[o.month] = { revenue: Number(o.revenue), count: Number(o.count) }; });

  return Array.from(allMonths).sort().map((month) => {
    const booking = bMap[month] || { revenue: 0, count: 0 };
    const order = oMap[month] || { revenue: 0, count: 0 };
    return {
      month,
      bookingRevenue: booking.revenue,
      bookingCount: booking.count,
      orderRevenue: order.revenue,
      orderCount: order.count,
      totalRevenue: booking.revenue + order.revenue,
    };
  });
};

const getRevenueByBranchDetailService = async (branchId, startDate, endDate) => {
  const dateFilter = buildDateRange(startDate, endDate);
  const dateExpr = fn("DATE", col("createdAt"));

  const [bookingsByDate, ordersByDate] = await Promise.all([
    Booking.findAll({
      attributes: [[dateExpr, "date"], [fn("SUM", col("totalAmount")), "revenue"], [fn("COUNT", col("Booking.id")), "count"]],
      where: { branchId, bookingStatus: { [Op.in]: PAID_BOOKING_STATUSES }, ...dateFilter },
      group: [fn("DATE", col("createdAt"))],
      order: [[fn("DATE", col("createdAt")), "ASC"]],
      raw: true,
    }),
    Order.findAll({
      attributes: [[dateExpr, "date"], [fn("SUM", col("totalAmount")), "revenue"], [fn("COUNT", col("Order.id")), "count"]],
      where: { branchId, orderStatus: { [Op.in]: PAID_ORDER_STATUSES }, ...dateFilter },
      group: [fn("DATE", col("createdAt"))],
      order: [[fn("DATE", col("createdAt")), "ASC"]],
      raw: true,
    }),
  ]);

  const allDates = new Set([
    ...bookingsByDate.map((b) => b.date),
    ...ordersByDate.map((o) => o.date),
  ]);

  const bMap = {};
  bookingsByDate.forEach((b) => { bMap[b.date] = { revenue: Number(b.revenue), count: Number(b.count) }; });
  const oMap = {};
  ordersByDate.forEach((o) => { oMap[o.date] = { revenue: Number(o.revenue), count: Number(o.count) }; });

  return Array.from(allDates).sort().map((date) => {
    const booking = bMap[date] || { revenue: 0, count: 0 };
    const order = oMap[date] || { revenue: 0, count: 0 };
    return {
      date,
      bookingRevenue: booking.revenue,
      bookingCount: booking.count,
      orderRevenue: order.revenue,
      orderCount: order.count,
      totalRevenue: booking.revenue + order.revenue,
    };
  });
};

const calcGrowth = (curr, prev) => {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
};

const getDashboardService = async () => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    thisBooking, thisOrder,
    lastBooking, lastOrder,
    totalUsers,
    chartBookings, chartOrders,
    recentBookings, recentOrders,
  ] = await Promise.all([
    Booking.findOne({
      attributes: [[fn("SUM", col("totalAmount")), "revenue"], [fn("COUNT", col("id")), "count"]],
      where: { bookingStatus: { [Op.in]: PAID_BOOKING_STATUSES }, createdAt: { [Op.gte]: thisMonthStart } },
      raw: true,
    }),
    Order.findOne({
      attributes: [[fn("SUM", col("totalAmount")), "revenue"], [fn("COUNT", col("id")), "count"]],
      where: { orderStatus: { [Op.in]: PAID_ORDER_STATUSES }, createdAt: { [Op.gte]: thisMonthStart } },
      raw: true,
    }),
    Booking.findOne({
      attributes: [[fn("SUM", col("totalAmount")), "revenue"], [fn("COUNT", col("id")), "count"]],
      where: { bookingStatus: { [Op.in]: PAID_BOOKING_STATUSES }, createdAt: { [Op.gte]: lastMonthStart, [Op.lte]: lastMonthEnd } },
      raw: true,
    }),
    Order.findOne({
      attributes: [[fn("SUM", col("totalAmount")), "revenue"], [fn("COUNT", col("id")), "count"]],
      where: { orderStatus: { [Op.in]: PAID_ORDER_STATUSES }, createdAt: { [Op.gte]: lastMonthStart, [Op.lte]: lastMonthEnd } },
      raw: true,
    }),
    User.count({
      include: [{ model: Role, as: "role", where: { roleName: ROLE_NAME.USER }, required: true }],
    }),
    Booking.findAll({
      attributes: [[fn("DATE", col("createdAt")), "date"], [fn("SUM", col("totalAmount")), "revenue"]],
      where: { bookingStatus: { [Op.in]: PAID_BOOKING_STATUSES }, createdAt: { [Op.gte]: thirtyDaysAgo } },
      group: [fn("DATE", col("createdAt"))],
      order: [[fn("DATE", col("createdAt")), "ASC"]],
      raw: true,
    }),
    Order.findAll({
      attributes: [[fn("DATE", col("createdAt")), "date"], [fn("SUM", col("totalAmount")), "revenue"]],
      where: { orderStatus: { [Op.in]: PAID_ORDER_STATUSES }, createdAt: { [Op.gte]: thirtyDaysAgo } },
      group: [fn("DATE", col("createdAt"))],
      order: [[fn("DATE", col("createdAt")), "ASC"]],
      raw: true,
    }),
    Booking.findAll({
      attributes: ["id", "bookingStatus", "totalAmount", "createdAt"],
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"], include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar"] }] },
        { model: Branch, as: "branch", attributes: ["id", "branchName"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
    Order.findAll({
      attributes: ["id", "orderStatus", "totalAmount", "createdAt"],
      include: [
        { model: Branch, as: "branch", attributes: ["id", "branchName"] },
        { model: OrderGroup, as: "orderGroup", attributes: ["id", "userId"], include: [{ model: User, as: "user", attributes: ["id", "username", "email"], include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar"] }] }] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
  ]);

  const thisRevenue = Number(thisBooking?.revenue || 0) + Number(thisOrder?.revenue || 0);
  const lastRevenue = Number(lastBooking?.revenue || 0) + Number(lastOrder?.revenue || 0);
  const thisBookingCount = Number(thisBooking?.count || 0);
  const lastBookingCount = Number(lastBooking?.count || 0);
  const thisOrderCount = Number(thisOrder?.count || 0);
  const lastOrderCount = Number(lastOrder?.count || 0);

  // Build 30-day chart array (fill empty days with 0)
  const bMap = {};
  chartBookings.forEach((b) => { bMap[b.date] = Number(b.revenue); });
  const oMap = {};
  chartOrders.forEach((o) => { oMap[o.date] = Number(o.revenue); });

  const chart = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(thirtyDaysAgo);
    d.setDate(thirtyDaysAgo.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return {
      date: key,
      label: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      bookingRevenue: bMap[key] || 0,
      orderRevenue: oMap[key] || 0,
      total: (bMap[key] || 0) + (oMap[key] || 0),
    };
  });

  return {
    stats: {
      totalRevenue: thisRevenue,
      revenueGrowth: calcGrowth(thisRevenue, lastRevenue),
      orderCount: thisOrderCount,
      orderGrowth: calcGrowth(thisOrderCount, lastOrderCount),
      bookingCount: thisBookingCount,
      bookingGrowth: calcGrowth(thisBookingCount, lastBookingCount),
      userCount: totalUsers,
    },
    chart,
    recentBookings: recentBookings.map((b) => {
      const bj = b.toJSON();
      return { id: bj.id, status: bj.bookingStatus, amount: Number(bj.totalAmount), createdAt: bj.createdAt, branchName: bj.branch?.branchName, fullName: bj.user?.profile?.fullName, username: bj.user?.username, avatar: bj.user?.profile?.avatar, email: bj.user?.email };
    }),
    recentOrders: recentOrders.map((o) => {
      const oj = o.toJSON();
      return { id: oj.id, status: oj.orderStatus, amount: Number(oj.totalAmount), createdAt: oj.createdAt, branchName: oj.branch?.branchName, fullName: oj.orderGroup?.user?.profile?.fullName, username: oj.orderGroup?.user?.username, avatar: oj.orderGroup?.user?.profile?.avatar, email: oj.orderGroup?.user?.email };
    }),
  };
};

const adminRevenueService = {
  getRevenueOverviewService,
  getRevenueByBranchService,
  getRevenueByDateService,
  getRevenueByMonthService,
  getRevenueByBranchDetailService,
  getDashboardService,
};

export default adminRevenueService;
