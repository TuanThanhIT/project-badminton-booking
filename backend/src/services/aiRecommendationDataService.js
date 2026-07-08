import { QueryTypes } from "sequelize";
import sequelize from "../config/db.js";
import { BOOKING_STATUS } from "../constants/bookingConstant.js";
import { AI_RECOMMENDATION_DEFAULTS } from "../constants/aiRecommendationConstant.js";
import { ORDER_GROUP_STATUS } from "../constants/orderConstant.js";

const SUCCESS_STATUSES = [
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.CHECKED_IN,
  BOOKING_STATUS.COMPLETED,
];

const getLookbackDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(d);
};

/**
 * Giờ mở cửa trên heatmap (6h–21h).
 * % lấp đầy = bookedCount ÷ (số sân ACTIVE × lookbackDays) — công thức cố định.
 * Cao/thấp điểm: quy tắc cố định (ngưỡng %, top-N) áp lên % đã tính — giờ nào cao/thấp do data.
 */
const OCCUPANCY_OPERATING_HOURS = Array.from({ length: 16 }, (_, i) => i + 6);

const formatHourRange = (hour) => {
  const start = String(hour).padStart(2, "0");
  const end = String(hour + 1).padStart(2, "0");
  return `${start}:00–${end}:00`;
};

export const getOccupancyByBranchHour = async (
  lookbackDays = AI_RECOMMENDATION_DEFAULTS.OCCUPANCY_LOOKBACK_DAYS,
) => {
  const since = getLookbackDate(lookbackDays);

  const [branches, bookingRows] = await Promise.all([
    sequelize.query(
      `
        SELECT br.id AS branchId,
               br.branchName,
               COUNT(c.id) AS courtCount
        FROM Branches br
        LEFT JOIN Courts c
          ON c.branchId = br.id AND c.courtStatus = 'ACTIVE'
        GROUP BY br.id, br.branchName
        ORDER BY br.id
      `,
      { type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
        SELECT b.branchId,
               HOUR(bd.startTime) AS hour,
               COUNT(bd.id) AS bookedCount
        FROM BookingDetails bd
        INNER JOIN Bookings b
          ON bd.bookingId = b.id
         AND b.bookingStatus IN (:statuses)
        WHERE bd.playDate >= :since
          AND HOUR(bd.startTime) BETWEEN 6 AND 21
        GROUP BY b.branchId, HOUR(bd.startTime)
      `,
      {
        replacements: { since, statuses: SUCCESS_STATUSES },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  const bookedMap = new Map();
  for (const row of bookingRows) {
    bookedMap.set(
      `${row.branchId}-${row.hour}`,
      Number(row.bookedCount) || 0,
    );
  }

  const occupancy = [];
  for (const branch of branches) {
    const courtCount = Number(branch.courtCount) || 0;
    const capacity = courtCount * lookbackDays;

    for (const hour of OCCUPANCY_OPERATING_HOURS) {
      const bookedCount = bookedMap.get(`${branch.branchId}-${hour}`) || 0;
      const fillRate =
        capacity > 0
          ? Math.round((bookedCount / capacity) * 1000) / 10
          : 0;

      occupancy.push({
        branchId: Number(branch.branchId),
        branchName: branch.branchName,
        hour,
        hourEnd: hour + 1,
        hourLabel: formatHourRange(hour),
        bookedCount,
        capacity,
        courtCount,
        fillRate,
      });
    }
  }

  return occupancy;
};

export const getUserActivityForAdmin = async (
  lookbackDays = AI_RECOMMENDATION_DEFAULTS.CUSTOMER_ACTIVITY_LOOKBACK_DAYS,
) => {
  const since = getLookbackDate(lookbackDays);
  const vipMinSessions = AI_RECOMMENDATION_DEFAULTS.VIP_MIN_SESSIONS;

  const rows = await sequelize.query(
    `
      WITH booking_lines AS (
        SELECT b.userId,
               b.id AS bookingId,
               b.branchId,
               b.bookingStatus,
               bd.playDate,
               bd.startTime,
               bd.id AS detailId
        FROM Bookings b
        INNER JOIN BookingDetails bd ON bd.bookingId = b.id
        WHERE b.bookingStatus IN (:statuses)
      ),
      user_stats AS (
        SELECT u.id AS userId,
               p.fullName,
               u.email,
               COUNT(DISTINCT bl.bookingId) AS totalBookings,
               SUM(CASE WHEN bl.bookingStatus = :completed THEN 1 ELSE 0 END) AS completedBookings,
               COUNT(CASE WHEN bl.playDate >= :since THEN bl.detailId END) AS sessionsLast30Days,
               COUNT(DISTINCT CASE WHEN bl.playDate >= :since THEN bl.bookingId END) AS ordersLast30Days,
               MAX(bl.playDate) AS lastPlayDate,
               AVG(HOUR(bl.startTime)) AS avgHour
        FROM Users u
        LEFT JOIN Profiles p ON p.userId = u.id
        INNER JOIN booking_lines bl ON bl.userId = u.id
        GROUP BY u.id, p.fullName, u.email
        HAVING totalBookings >= 1
           AND (
             sessionsLast30Days >= :vipMinSessions
             OR sessionsLast30Days = 0
           )
      ),
      last_visit AS (
        SELECT userId, branchId, branchName
        FROM (
          SELECT bl.userId,
                 bl.branchId,
                 br.branchName,
                 ROW_NUMBER() OVER (
                   PARTITION BY bl.userId
                   ORDER BY bl.playDate DESC, bl.startTime DESC
                 ) AS rn
          FROM booking_lines bl
          INNER JOIN Branches br ON br.id = bl.branchId
        ) ranked
        WHERE rn = 1
      )
      SELECT s.userId,
             s.fullName,
             s.email,
             s.totalBookings,
             s.completedBookings,
             s.sessionsLast30Days,
             s.ordersLast30Days,
             s.lastPlayDate,
             s.avgHour,
             lv.branchId AS lastBranchId,
             lv.branchName AS lastBranchName
      FROM user_stats s
      LEFT JOIN last_visit lv ON lv.userId = s.userId
    `,
    {
      replacements: {
        statuses: SUCCESS_STATUSES,
        completed: BOOKING_STATUS.COMPLETED,
        since,
        vipMinSessions,
      },
      type: QueryTypes.SELECT,
    },
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return rows.map((row) => {
    let daysSinceLastBooking = null;
    if (row.lastPlayDate) {
      const last = new Date(`${row.lastPlayDate}T00:00:00`);
      daysSinceLastBooking = Math.floor(
        (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
      );
    }

    return {
      userId: Number(row.userId),
      fullName: row.fullName,
      email: row.email,
      totalBookings: Number(row.totalBookings) || 0,
      completedBookings: Number(row.completedBookings) || 0,
      sessionsLast30Days: Number(row.sessionsLast30Days) || 0,
      ordersLast30Days: Number(row.ordersLast30Days) || 0,
      daysSinceLastBooking,
      lastBranchId: row.lastBranchId ? Number(row.lastBranchId) : null,
      lastBranchName: row.lastBranchName,
      avgHour: row.avgHour != null ? Number(row.avgHour) : null,
    };
  });
};

export const buildAdminInsightsPayload = async (options = {}) => {
  const lookbackDays =
    options.lookbackDays ?? AI_RECOMMENDATION_DEFAULTS.OCCUPANCY_LOOKBACK_DAYS;
  const lowFillThreshold =
    options.lowFillThreshold ?? AI_RECOMMENDATION_DEFAULTS.LOW_FILL_THRESHOLD;
  const churnDaysThreshold =
    options.churnDaysThreshold ?? AI_RECOMMENDATION_DEFAULTS.CHURN_DAYS_THRESHOLD;
  const peakSlotsPerBranch =
    options.peakSlotsPerBranch ??
    AI_RECOMMENDATION_DEFAULTS.PEAK_SLOTS_PER_BRANCH;
  const customerLookbackDays =
    options.customerLookbackDays ??
    AI_RECOMMENDATION_DEFAULTS.CUSTOMER_ACTIVITY_LOOKBACK_DAYS;

  const [occupancy, userActivity] = await Promise.all([
    getOccupancyByBranchHour(lookbackDays),
    getUserActivityForAdmin(customerLookbackDays),
  ]);

  return {
    occupancy,
    userActivity,
    lookbackDays,
    lowFillThreshold,
    churnDaysThreshold,
    peakSlotsPerBranch,
    maxPeakSlotsGlobal: AI_RECOMMENDATION_DEFAULTS.MAX_PEAK_SLOTS_GLOBAL,
    periodStart: getLookbackDate(customerLookbackDays),
    periodEnd: getLookbackDate(0),
    customerLookbackDays,
    vipMinSessions: AI_RECOMMENDATION_DEFAULTS.VIP_MIN_SESSIONS,
    segmentTopK: AI_RECOMMENDATION_DEFAULTS.CUSTOMER_SEGMENT_TOP_K,
    secondBookingNudgeDays: AI_RECOMMENDATION_DEFAULTS.SECOND_BOOKING_NUDGE_DAYS,
  };
};

// ===================== PRODUCT RECOMMENDATION =====================

const PAID = ORDER_GROUP_STATUS.PAID;

export const getProductPurchaseRows = async () => {
  const rows = await sequelize.query(
    `
      SELECT og.id AS orderGroupId,
             og.userId,
             p.id AS productId,
             p.categoryId
      FROM OrderGroups og
      INNER JOIN Orders o ON o.orderGroupId = og.id
      INNER JOIN OrderDetails od ON od.orderId = o.id
      INNER JOIN ProductVariants pv ON od.variantId = pv.id
      INNER JOIN Products p ON pv.productId = p.id
      WHERE og.status = :paid
    `,
    {
      replacements: { paid: PAID },
      type: QueryTypes.SELECT,
    },
  );
  return rows;
};

export const getProductSoldCountMap = async () => {
  const rows = await sequelize.query(
    `
      SELECT p.id AS productId,
             SUM(od.quantity) AS soldCount
      FROM OrderDetails od
      INNER JOIN Orders o ON od.orderId = o.id
      INNER JOIN OrderGroups og ON o.orderGroupId = og.id
      INNER JOIN ProductVariants pv ON od.variantId = pv.id
      INNER JOIN Products p ON pv.productId = p.id
      WHERE og.status = :paid
      GROUP BY p.id
    `,
    {
      replacements: { paid: PAID },
      type: QueryTypes.SELECT,
    },
  );

  const map = new Map();
  for (const row of rows) {
    map.set(Number(row.productId), Number(row.soldCount) || 0);
  }
  return map;
};

export const getUserAvgPriceMap = async () => {
  const rows = await sequelize.query(
    `
      SELECT og.userId,
             AVG(od.unitPrice) AS avgPriceUser
      FROM OrderGroups og
      INNER JOIN Orders o ON o.orderGroupId = og.id
      INNER JOIN OrderDetails od ON od.orderId = o.id
      WHERE og.status = :paid AND og.userId IS NOT NULL
      GROUP BY og.userId
    `,
    {
      replacements: { paid: PAID },
      type: QueryTypes.SELECT,
    },
  );

  const map = new Map();
  for (const row of rows) {
    map.set(Number(row.userId), Math.round(Number(row.avgPriceUser) || 0));
  }
  return map;
};

export const getActiveProductsForRec = async () => {
  const [rows, soldMap] = await Promise.all([
    sequelize.query(
      `
        SELECT p.id,
               p.productName,
               p.thumbnailUrl,
               p.categoryId,
               MIN(pv.price) AS minPrice
        FROM Products p
        INNER JOIN ProductVariants pv ON pv.productId = p.id
        GROUP BY p.id, p.productName, p.thumbnailUrl, p.categoryId
      `,
      { type: QueryTypes.SELECT },
    ),
    getProductSoldCountMap(),
  ]);

  return rows.map((row) => ({
    id: Number(row.id),
    name: row.productName,
    thumbnailUrl: row.thumbnailUrl,
    categoryId: Number(row.categoryId) || 0,
    minPrice: row.minPrice != null ? Number(row.minPrice) : null,
    soldCount: soldMap.get(Number(row.id)) || 0,
  }));
};

export const getPopularProducts = async (limit = 8) => {
  const rows = await sequelize.query(
    `
      SELECT p.id AS productId,
             SUM(od.quantity) AS soldCount
      FROM OrderDetails od
      INNER JOIN Orders o ON od.orderId = o.id
      INNER JOIN OrderGroups og ON o.orderGroupId = og.id
      INNER JOIN ProductVariants pv ON od.variantId = pv.id
      INNER JOIN Products p ON pv.productId = p.id
      WHERE og.status = :paid
      GROUP BY p.id
      ORDER BY soldCount DESC
      LIMIT :limit
    `,
    {
      replacements: { paid: PAID, limit },
      type: QueryTypes.SELECT,
    },
  );

  return rows.map((row) => ({
    productId: Number(row.productId),
    soldCount: Number(row.soldCount) || 0,
  }));
};

export const getUserPurchaseHistory = async (userId) => {
  const rows = await sequelize.query(
    `
      SELECT DISTINCT p.id AS productId, p.categoryId
      FROM OrderGroups og
      INNER JOIN Orders o ON o.orderGroupId = og.id
      INNER JOIN OrderDetails od ON od.orderId = o.id
      INNER JOIN ProductVariants pv ON od.variantId = pv.id
      INNER JOIN Products p ON pv.productId = p.id
      WHERE og.userId = :userId AND og.status = :paid
    `,
    {
      replacements: { userId, paid: PAID },
      type: QueryTypes.SELECT,
    },
  );

  return rows.map((row) => ({
    productId: Number(row.productId),
    categoryId: Number(row.categoryId) || 0,
  }));
};

export const buildProductTrainPayload = async () => {
  const [rows, products, userAvgMap] = await Promise.all([
    getProductPurchaseRows(),
    getActiveProductsForRec(),
    getUserAvgPriceMap(),
  ]);

  const productById = new Map(products.map((p) => [p.id, p]));
  const basketMap = new Map();
  const recordKeys = new Set();
  const records = [];

  for (const row of rows) {
    const groupId = Number(row.orderGroupId);
    const productId = Number(row.productId);
    if (!basketMap.has(groupId)) basketMap.set(groupId, new Set());
    basketMap.get(groupId).add(productId);

    if (row.userId != null) {
      const key = `${row.userId}-${productId}`;
      if (!recordKeys.has(key)) {
        recordKeys.add(key);
        const userId = Number(row.userId);
        const product = productById.get(productId);
        records.push({
          userId,
          productId,
          categoryId: Number(row.categoryId) || 0,
          soldCount: product?.soldCount ?? 0,
          minPrice: product?.minPrice ?? 0,
          avgPriceUser: userAvgMap.get(userId) ?? 0,
        });
      }
    }
  }

  const baskets = [...basketMap.values()]
    .map((set) => [...set])
    .filter((items) => items.length >= 2);

  const userProfiles = [...userAvgMap.entries()].map(([userId, avgPriceUser]) => ({
    userId,
    avgPriceUser,
  }));

  return {
    baskets,
    records,
    products,
    userProfiles,
    featureSchema: [
      "userId",
      "productId",
      "categoryId",
      "soldCount",
      "minPrice",
      "avgPriceUser",
    ],
  };
};

export const buildProductRecommendPayload = async ({
  mode = "user",
  userId = null,
  productId = null,
  topK = AI_RECOMMENDATION_DEFAULTS.TOP_K,
}) => {
  const [products, popular, history, userAvgMap] = await Promise.all([
    getActiveProductsForRec(),
    getPopularProducts(topK + 4),
    mode === "user" && userId ? getUserPurchaseHistory(userId) : [],
    getUserAvgPriceMap(),
  ]);

  const avgPriceUser =
    userId != null ? (userAvgMap.get(Number(userId)) ?? 0) : null;

  return {
    mode,
    userId: userId || null,
    productId: productId || null,
    avgPriceUser,
    history,
    products,
    popularProducts: popular,
    topK,
    maxPerCategory: AI_RECOMMENDATION_DEFAULTS.MAX_ITEMS_PER_CATEGORY,
  };
};

export default {
  buildAdminInsightsPayload,
  buildProductTrainPayload,
  buildProductRecommendPayload,
  getProductSoldCountMap,
  getUserAvgPriceMap,
};
