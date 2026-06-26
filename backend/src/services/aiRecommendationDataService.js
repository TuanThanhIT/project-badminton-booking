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
               (
                 SELECT COUNT(*)
                 FROM Courts c
                 WHERE c.branchId = br.id AND c.courtStatus = 'ACTIVE'
               ) AS courtCount
        FROM Branches br
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
        INNER JOIN Bookings b ON bd.bookingId = b.id
        WHERE b.bookingStatus IN (:statuses)
          AND bd.playDate >= :since
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

  const rows = await sequelize.query(
    `
      SELECT u.id AS userId,
             p.fullName,
             u.email,
             COUNT(DISTINCT b.id) AS totalBookings,
             SUM(CASE WHEN b.bookingStatus = :completed THEN 1 ELSE 0 END) AS completedBookings,
             COUNT(CASE WHEN bd.playDate >= :since THEN bd.id END) AS sessionsLast30Days,
             COUNT(DISTINCT CASE WHEN bd.playDate >= :since THEN b.id END) AS ordersLast30Days,
             MAX(bd.playDate) AS lastPlayDate,
             (
               SELECT b2.branchId
               FROM Bookings b2
               INNER JOIN BookingDetails bd2 ON bd2.bookingId = b2.id
               WHERE b2.userId = u.id
                 AND b2.bookingStatus IN (:statuses)
               ORDER BY bd2.playDate DESC, bd2.startTime DESC
               LIMIT 1
             ) AS lastBranchId,
             (
               SELECT br.branchName
               FROM Bookings b2
               INNER JOIN BookingDetails bd2 ON bd2.bookingId = b2.id
               INNER JOIN Branches br ON b2.branchId = br.id
               WHERE b2.userId = u.id
                 AND b2.bookingStatus IN (:statuses)
               ORDER BY bd2.playDate DESC, bd2.startTime DESC
               LIMIT 1
             ) AS lastBranchName,
             AVG(HOUR(bd.startTime)) AS avgHour
      FROM Users u
      LEFT JOIN Profiles p ON p.userId = u.id
      INNER JOIN Bookings b ON b.userId = u.id
      INNER JOIN BookingDetails bd ON bd.bookingId = b.id
      WHERE b.bookingStatus IN (:statuses)
      GROUP BY u.id, p.fullName, u.email
      HAVING totalBookings >= 1
    `,
    {
      replacements: {
        statuses: SUCCESS_STATUSES,
        completed: BOOKING_STATUS.COMPLETED,
        since,
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

export const getActiveProductsForRec = async () => {
  const rows = await sequelize.query(
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
  );

  return rows.map((row) => ({
    id: Number(row.id),
    name: row.productName,
    thumbnailUrl: row.thumbnailUrl,
    categoryId: Number(row.categoryId) || 0,
    minPrice: row.minPrice != null ? Number(row.minPrice) : null,
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
  const [rows, products] = await Promise.all([
    getProductPurchaseRows(),
    getActiveProductsForRec(),
  ]);

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
        records.push({
          userId: Number(row.userId),
          productId,
          categoryId: Number(row.categoryId) || 0,
        });
      }
    }
  }

  const baskets = [...basketMap.values()]
    .map((set) => [...set])
    .filter((items) => items.length >= 2);

  return { baskets, records, products };
};

export const buildProductRecommendPayload = async ({
  mode = "user",
  userId = null,
  productId = null,
  topK = AI_RECOMMENDATION_DEFAULTS.TOP_K,
}) => {
  const [products, popular, history] = await Promise.all([
    getActiveProductsForRec(),
    getPopularProducts(topK + 4),
    mode === "user" && userId ? getUserPurchaseHistory(userId) : [],
  ]);

  return {
    mode,
    userId: userId || null,
    productId: productId || null,
    history,
    products,
    popularProducts: popular,
    topK,
  };
};

export default {
  buildAdminInsightsPayload,
  buildProductTrainPayload,
  buildProductRecommendPayload,
};
