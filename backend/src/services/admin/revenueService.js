import { QueryTypes } from "sequelize";
import sequelize from "../../config/db.js";
import { Booking, Order, Branch, User, Profile, Role, OrderGroup } from "../../models/index.js";
import { BOOKING_STATUS } from "../../constants/bookingConstant.js";
import { ORDER_STATUS } from "../../constants/orderConstant.js";
import { PAYMENT_STATUS } from "../../constants/paymentConstant.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const PAID_BOOKING_STATUSES = [
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.PAID,
  BOOKING_STATUS.COMPLETED,
].filter(Boolean);

const PAID_ORDER_STATUSES = [
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_TO_SHIP,
  ORDER_STATUS.SHIPPING,
  ORDER_STATUS.COMPLETED,
];

const toNumber = (value) => Number(value || 0);

const buildDateSql = (dateExpression, startDate, endDate) => {
  const clauses = [];
  const replacements = {};

  if (startDate) {
    clauses.push(`${dateExpression} >= :startDate`);
    replacements.startDate = new Date(startDate);
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    clauses.push(`${dateExpression} <= :endDate`);
    replacements.endDate = end;
  }

  return {
    sql: clauses.length ? ` AND ${clauses.join(" AND ")}` : "",
    replacements,
  };
};

const getGroupParts = ({ groupBy, branchExpression, dateExpression }) => {
  if (groupBy === "branch") {
    return {
      select: `${branchExpression} AS revenueKey`,
      group: `GROUP BY ${branchExpression}`,
      order: "ORDER BY revenueKey ASC",
    };
  }

  if (groupBy === "date") {
    return {
      select: `DATE(${dateExpression}) AS revenueKey`,
      group: `GROUP BY DATE(${dateExpression})`,
      order: "ORDER BY revenueKey ASC",
    };
  }

  if (groupBy === "month") {
    return {
      select: `DATE_FORMAT(${dateExpression}, '%Y-%m') AS revenueKey`,
      group: `GROUP BY DATE_FORMAT(${dateExpression}, '%Y-%m')`,
      order: "ORDER BY revenueKey ASC",
    };
  }

  return {
    select: "'all' AS revenueKey",
    group: "",
    order: "",
  };
};

const createRevenueRow = (key) => ({
  revenueKey: String(key),
  onlineBookingRevenue: 0,
  onlineBookingCount: 0,
  offlineBookingRevenue: 0,
  offlineBookingCount: 0,
  offlineBookingSlotCount: 0,
  bookingRevenue: 0,
  bookingCount: 0,
  onlineProductRevenue: 0,
  onlineProductOrderCount: 0,
  onlineProductQuantity: 0,
  offlineProductRevenue: 0,
  offlineProductOrderCount: 0,
  offlineProductQuantity: 0,
  productRevenue: 0,
  productOrderCount: 0,
  productQuantity: 0,
  beverageRevenue: 0,
  beverageOrderCount: 0,
  beverageQuantity: 0,
  orderRevenue: 0,
  orderCount: 0,
  totalRevenue: 0,
});

const finalizeRevenueRow = (row) => ({
  ...row,
  bookingRevenue: row.onlineBookingRevenue + row.offlineBookingRevenue,
  bookingCount: row.onlineBookingCount + row.offlineBookingCount,
  productRevenue: row.onlineProductRevenue + row.offlineProductRevenue,
  productOrderCount: row.onlineProductOrderCount + row.offlineProductOrderCount,
  productQuantity: row.onlineProductQuantity + row.offlineProductQuantity,
  orderRevenue: row.onlineProductRevenue + row.offlineProductRevenue + row.beverageRevenue,
  orderCount:
    row.onlineProductOrderCount + row.offlineProductOrderCount + row.beverageOrderCount,
  totalRevenue:
    row.onlineBookingRevenue +
    row.offlineBookingRevenue +
    row.onlineProductRevenue +
    row.offlineProductRevenue +
    row.beverageRevenue,
});

const mergeRows = (targetMap, rows, handler) => {
  rows.forEach((row) => {
    const key = String(row.revenueKey || "all");
    if (!targetMap.has(key)) targetMap.set(key, createRevenueRow(key));
    handler(targetMap.get(key), row);
  });
};

const runRevenueQuery = async ({
  sql,
  startDate,
  endDate,
  dateExpression,
  branchExpression,
  branchId,
}) => {
  const dateFilter = buildDateSql(dateExpression, startDate, endDate);
  const branchFilter = branchId ? ` AND ${branchExpression} = :branchId` : "";

  return sequelize.query(sql(dateFilter.sql, branchFilter), {
    replacements: {
      bookingStatuses: PAID_BOOKING_STATUSES,
      orderStatuses: PAID_ORDER_STATUSES,
      paidStatus: PAYMENT_STATUS.PAID,
      branchId,
      ...dateFilter.replacements,
    },
    type: QueryTypes.SELECT,
  });
};

const getGroupedRevenue = async ({ startDate, endDate, groupBy = "all", branchId }) => {
  const onlineBookingGroup = getGroupParts({
    groupBy,
    branchExpression: "b.branchId",
    dateExpression: "b.createdDate",
  });
  const onlineProductGroup = getGroupParts({
    groupBy,
    branchExpression: "o.branchId",
    dateExpression: "o.createdDate",
  });
  const offlineGroup = getGroupParts({
    groupBy,
    branchExpression: "db.branchId",
    dateExpression: "COALESCE(ob.paidAt, ob.createdDate)",
  });

  const [
    onlineBookings,
    offlineCourtBookings,
    onlineProducts,
    offlineProducts,
    offlineBeverages,
  ] = await Promise.all([
    runRevenueQuery({
      startDate,
      endDate,
      branchId,
      dateExpression: "b.createdDate",
      branchExpression: "b.branchId",
      sql: (dateSql, branchSql) => `
        SELECT ${onlineBookingGroup.select},
               COALESCE(SUM(b.totalAmount), 0) AS revenue,
               COUNT(b.id) AS count
        FROM Bookings b
        WHERE b.bookingStatus IN (:bookingStatuses)
          ${dateSql}
          ${branchSql}
        ${onlineBookingGroup.group}
        ${onlineBookingGroup.order}
      `,
    }),
    runRevenueQuery({
      startDate,
      endDate,
      branchId,
      dateExpression: "COALESCE(ob.paidAt, ob.createdDate)",
      branchExpression: "db.branchId",
      sql: (dateSql, branchSql) => `
        SELECT ${offlineGroup.select},
               COALESCE(SUM(dbi.price), 0) AS revenue,
               COUNT(DISTINCT ob.id) AS count,
               COUNT(dbi.id) AS slotCount
        FROM DraftBookingItems dbi
        INNER JOIN DraftBookings db ON dbi.draftId = db.id
        INNER JOIN OfflineBookings ob ON ob.draftId = db.id
        WHERE ob.paymentStatus = :paidStatus
          ${dateSql}
          ${branchSql}
        ${offlineGroup.group}
        ${offlineGroup.order}
      `,
    }),
    runRevenueQuery({
      startDate,
      endDate,
      branchId,
      dateExpression: "o.createdDate",
      branchExpression: "o.branchId",
      sql: (dateSql, branchSql) => `
        SELECT ${onlineProductGroup.select},
               COALESCE(SUM(od.subTotal), 0) AS revenue,
               COUNT(DISTINCT o.id) AS count,
               COALESCE(SUM(od.quantity), 0) AS quantity
        FROM OrderDetails od
        INNER JOIN Orders o ON od.orderId = o.id
        WHERE o.orderStatus IN (:orderStatuses)
          ${dateSql}
          ${branchSql}
        ${onlineProductGroup.group}
        ${onlineProductGroup.order}
      `,
    }),
    runRevenueQuery({
      startDate,
      endDate,
      branchId,
      dateExpression: "COALESCE(ob.paidAt, ob.createdDate)",
      branchExpression: "db.branchId",
      sql: (dateSql, branchSql) => `
        SELECT ${offlineGroup.select},
               COALESCE(SUM(dpi.subTotal), 0) AS revenue,
               COUNT(DISTINCT ob.id) AS count,
               COALESCE(SUM(dpi.quantity), 0) AS quantity
        FROM DraftProductItems dpi
        INNER JOIN DraftBookings db ON dpi.draftId = db.id
        INNER JOIN OfflineBookings ob ON ob.draftId = db.id
        WHERE ob.paymentStatus = :paidStatus
          ${dateSql}
          ${branchSql}
        ${offlineGroup.group}
        ${offlineGroup.order}
      `,
    }),
    runRevenueQuery({
      startDate,
      endDate,
      branchId,
      dateExpression: "COALESCE(ob.paidAt, ob.createdDate)",
      branchExpression: "db.branchId",
      sql: (dateSql, branchSql) => `
        SELECT ${offlineGroup.select},
               COALESCE(SUM(dbi.subTotal), 0) AS revenue,
               COUNT(DISTINCT ob.id) AS count,
               COALESCE(SUM(dbi.quantity), 0) AS quantity
        FROM DraftBeverageItems dbi
        INNER JOIN DraftBookings db ON dbi.draftId = db.id
        INNER JOIN OfflineBookings ob ON ob.draftId = db.id
        WHERE ob.paymentStatus = :paidStatus
          ${dateSql}
          ${branchSql}
        ${offlineGroup.group}
        ${offlineGroup.order}
      `,
    }),
  ]);

  const revenueMap = new Map();

  if (groupBy === "all") revenueMap.set("all", createRevenueRow("all"));

  mergeRows(revenueMap, onlineBookings, (target, row) => {
    target.onlineBookingRevenue += toNumber(row.revenue);
    target.onlineBookingCount += toNumber(row.count);
  });

  mergeRows(revenueMap, offlineCourtBookings, (target, row) => {
    target.offlineBookingRevenue += toNumber(row.revenue);
    target.offlineBookingCount += toNumber(row.count);
    target.offlineBookingSlotCount += toNumber(row.slotCount);
  });

  mergeRows(revenueMap, onlineProducts, (target, row) => {
    target.onlineProductRevenue += toNumber(row.revenue);
    target.onlineProductOrderCount += toNumber(row.count);
    target.onlineProductQuantity += toNumber(row.quantity);
  });

  mergeRows(revenueMap, offlineProducts, (target, row) => {
    target.offlineProductRevenue += toNumber(row.revenue);
    target.offlineProductOrderCount += toNumber(row.count);
    target.offlineProductQuantity += toNumber(row.quantity);
  });

  mergeRows(revenueMap, offlineBeverages, (target, row) => {
    target.beverageRevenue += toNumber(row.revenue);
    target.beverageOrderCount += toNumber(row.count);
    target.beverageQuantity += toNumber(row.quantity);
  });

  return Array.from(revenueMap.values()).map(finalizeRevenueRow);
};

const getRevenueOverviewService = async (startDate, endDate) => {
  const [overview] = await getGroupedRevenue({ startDate, endDate, groupBy: "all" });
  return overview || finalizeRevenueRow(createRevenueRow("all"));
};

const getRevenueByBranchService = async (startDate, endDate) => {
  const [branches, revenueRows] = await Promise.all([
    Branch.findAll({ attributes: ["id", "branchName"], raw: true }),
    getGroupedRevenue({ startDate, endDate, groupBy: "branch" }),
  ]);

  const revenueMap = new Map(revenueRows.map((row) => [String(row.revenueKey), row]));

  return branches
    .map((branch) => {
      const row = revenueMap.get(String(branch.id)) || finalizeRevenueRow(createRevenueRow(branch.id));
      return {
        ...row,
        branchId: branch.id,
        branchName: branch.branchName,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
};

const getRevenueByDateService = async (startDate, endDate) => {
  const revenueRows = await getGroupedRevenue({ startDate, endDate, groupBy: "date" });
  return revenueRows
    .map((row) => ({
      ...row,
      date: row.revenueKey,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const getRevenueByMonthService = async (startDate, endDate) => {
  const revenueRows = await getGroupedRevenue({ startDate, endDate, groupBy: "month" });
  return revenueRows
    .map((row) => ({
      ...row,
      month: row.revenueKey,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

const getRevenueByBranchDetailService = async (branchId, startDate, endDate) => {
  const revenueRows = await getGroupedRevenue({
    startDate,
    endDate,
    branchId,
    groupBy: "date",
  });

  return revenueRows
    .map((row) => ({
      ...row,
      date: row.revenueKey,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const getRevenueProductsService = async (startDate, endDate, limit = 12) => {
  const parsedLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const orderDateFilter = buildDateSql("o.createdDate", startDate, endDate);
  const offlineDateFilter = buildDateSql("COALESCE(ob.paidAt, ob.createdDate)", startDate, endDate);

  const [onlineProducts, offlineProducts] = await Promise.all([
    sequelize.query(
      `
        SELECT od.variantId AS productVariantId,
               od.productName AS productName,
               od.variantInfo AS variantInfo,
               COALESCE(SUM(od.subTotal), 0) AS onlineRevenue,
               COALESCE(SUM(od.quantity), 0) AS onlineQuantity,
               COUNT(DISTINCT o.id) AS onlineOrderCount
        FROM OrderDetails od
        INNER JOIN Orders o ON od.orderId = o.id
        WHERE o.orderStatus IN (:orderStatuses)
          ${orderDateFilter.sql}
        GROUP BY od.variantId, od.productName, od.variantInfo
      `,
      {
        replacements: {
          orderStatuses: PAID_ORDER_STATUSES,
          ...orderDateFilter.replacements,
        },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query(
      `
        SELECT dpi.productVariantId AS productVariantId,
               p.productName AS productName,
               CONCAT_WS(' / ', NULLIF(pv.size, ''), NULLIF(pv.color, '')) AS variantInfo,
               COALESCE(SUM(dpi.subTotal), 0) AS offlineRevenue,
               COALESCE(SUM(dpi.quantity), 0) AS offlineQuantity,
               COUNT(DISTINCT ob.id) AS offlineOrderCount
        FROM DraftProductItems dpi
        INNER JOIN DraftBookings db ON dpi.draftId = db.id
        INNER JOIN OfflineBookings ob ON ob.draftId = db.id
        INNER JOIN ProductVariants pv ON dpi.productVariantId = pv.id
        INNER JOIN Products p ON pv.productId = p.id
        WHERE ob.paymentStatus = :paidStatus
          ${offlineDateFilter.sql}
        GROUP BY dpi.productVariantId, p.productName, pv.size, pv.color
      `,
      {
        replacements: {
          paidStatus: PAYMENT_STATUS.PAID,
          ...offlineDateFilter.replacements,
        },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  const productMap = new Map();
  const ensureProduct = (row) => {
    const key = String(row.productVariantId);
    if (!productMap.has(key)) {
      productMap.set(key, {
        productVariantId: row.productVariantId,
        productName: row.productName || "Sản phẩm",
        variantInfo: row.variantInfo || "",
        onlineRevenue: 0,
        onlineQuantity: 0,
        onlineOrderCount: 0,
        offlineRevenue: 0,
        offlineQuantity: 0,
        offlineOrderCount: 0,
        totalRevenue: 0,
        totalQuantity: 0,
      });
    }
    return productMap.get(key);
  };

  onlineProducts.forEach((row) => {
    const product = ensureProduct(row);
    product.onlineRevenue += toNumber(row.onlineRevenue);
    product.onlineQuantity += toNumber(row.onlineQuantity);
    product.onlineOrderCount += toNumber(row.onlineOrderCount);
  });

  offlineProducts.forEach((row) => {
    const product = ensureProduct(row);
    product.offlineRevenue += toNumber(row.offlineRevenue);
    product.offlineQuantity += toNumber(row.offlineQuantity);
    product.offlineOrderCount += toNumber(row.offlineOrderCount);
  });

  return Array.from(productMap.values())
    .map((product) => ({
      ...product,
      totalRevenue: product.onlineRevenue + product.offlineRevenue,
      totalQuantity: product.onlineQuantity + product.offlineQuantity,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, parsedLimit);
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

  const today = new Date(now);
  today.setHours(23, 59, 59, 999);

  const [
    thisOverview,
    lastOverview,
    totalUsers,
    chartRevenue,
    topBranches,
    topProducts,
    recentBookings,
    recentOrders,
  ] = await Promise.all([
    getRevenueOverviewService(thisMonthStart, today),
    getRevenueOverviewService(lastMonthStart, lastMonthEnd),
    User.count({
      include: [{ model: Role, as: "role", where: { roleName: ROLE_NAME.USER }, required: true }],
    }),
    getRevenueByDateService(thirtyDaysAgo, today),
    getRevenueByBranchService(thisMonthStart, today),
    getRevenueProductsService(thisMonthStart, today, 5),
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

  const chartMap = {};
  chartRevenue.forEach((item) => {
    chartMap[item.date] = item;
  });

  const chart = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(thirtyDaysAgo);
    d.setDate(thirtyDaysAgo.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const item = chartMap[key] || {};
    return {
      date: key,
      label: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      bookingRevenue: toNumber(item.bookingRevenue),
      orderRevenue: toNumber(item.orderRevenue),
      total: toNumber(item.totalRevenue),
    };
  });

  return {
    stats: {
      totalRevenue: thisOverview.totalRevenue,
      revenueGrowth: calcGrowth(thisOverview.totalRevenue, lastOverview.totalRevenue),
      orderCount: thisOverview.orderCount,
      orderGrowth: calcGrowth(thisOverview.orderCount, lastOverview.orderCount),
      bookingCount: thisOverview.bookingCount,
      bookingGrowth: calcGrowth(thisOverview.bookingCount, lastOverview.bookingCount),
      userCount: totalUsers,
    },
    overview: thisOverview,
    topBranches: topBranches.slice(0, 3),
    topProducts,
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
  getRevenueProductsService,
  getDashboardService,
};

export default adminRevenueService;
