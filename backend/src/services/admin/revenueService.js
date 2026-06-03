import { QueryTypes } from "sequelize";
import sequelize from "../../config/db.js";
import {
  Booking,
  Order,
  Branch,
  User,
  Profile,
  Role,
  OrderGroup,
  PurchaseReceipt,
  Supplier,
} from "../../models/index.js";
import { BOOKING_STATUS } from "../../constants/bookingConstant.js";
import { ORDER_STATUS } from "../../constants/orderConstant.js";
import { PAYMENT_STATUS } from "../../constants/paymentConstant.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import {
  PURCHASE_RECEIPT_STATUS,
  STOCK_ITEM_TYPE,
} from "../../constants/inventoryConstant.js";

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

const LOW_STOCK_THRESHOLD = 5;

const normalizeFilter = (value, allowed, fallback = "ALL") =>
  allowed.includes(String(value || "").toUpperCase())
    ? String(value).toUpperCase()
    : fallback;

const parseOptionalId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

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

const getGroupedRevenue = async ({
  startDate,
  endDate,
  groupBy = "all",
  branchId,
  revenueType = "ALL",
  itemType = "ALL",
}) => {
  const normalizedRevenueType = normalizeFilter(revenueType, [
    "ALL",
    "BOOKING",
    "PRODUCT",
    "BEVERAGE",
  ]);
  const normalizedItemType = normalizeFilter(itemType, [
    "ALL",
    STOCK_ITEM_TYPE.PRODUCT_VARIANT,
    STOCK_ITEM_TYPE.BEVERAGE,
  ]);
  const includeBooking = normalizedRevenueType === "ALL" || normalizedRevenueType === "BOOKING";
  const includeProduct =
    (normalizedRevenueType === "ALL" || normalizedRevenueType === "PRODUCT") &&
    (normalizedItemType === "ALL" || normalizedItemType === STOCK_ITEM_TYPE.PRODUCT_VARIANT);
  const includeBeverage =
    (normalizedRevenueType === "ALL" || normalizedRevenueType === "BEVERAGE") &&
    (normalizedItemType === "ALL" || normalizedItemType === STOCK_ITEM_TYPE.BEVERAGE);

  const onlineBookingGroup = getGroupParts({
    groupBy,
    branchExpression: "b.branchId",
    dateExpression: "b.createdAt",
  });
  const onlineProductGroup = getGroupParts({
    groupBy,
    branchExpression: "o.branchId",
    dateExpression: "o.createdAt",
  });
  const offlineGroup = getGroupParts({
    groupBy,
    branchExpression: "db.branchId",
    dateExpression: "COALESCE(ob.paidAt, ob.createdAt)",
  });

  const empty = Promise.resolve([]);
  const [
    onlineBookings,
    offlineCourtBookings,
    onlineProducts,
    offlineProducts,
    offlineBeverages,
  ] = await Promise.all([
    includeBooking ? runRevenueQuery({
      startDate,
      endDate,
      branchId,
      dateExpression: "b.createdAt",
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
    }) : empty,
    includeBooking ? runRevenueQuery({
      startDate,
      endDate,
      branchId,
      dateExpression: "COALESCE(ob.paidAt, ob.createdAt)",
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
    }) : empty,
    includeProduct ? runRevenueQuery({
      startDate,
      endDate,
      branchId,
      dateExpression: "o.createdAt",
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
    }) : empty,
    includeProduct ? runRevenueQuery({
      startDate,
      endDate,
      branchId,
      dateExpression: "COALESCE(ob.paidAt, ob.createdAt)",
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
    }) : empty,
    includeBeverage ? runRevenueQuery({
      startDate,
      endDate,
      branchId,
      dateExpression: "COALESCE(ob.paidAt, ob.createdAt)",
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
    }) : empty,
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

const getRevenueOverviewService = async (startDate, endDate, filters = {}) => {
  const [overview] = await getGroupedRevenue({
    startDate,
    endDate,
    groupBy: "all",
    branchId: parseOptionalId(filters.branchId),
    revenueType: filters.revenueType,
    itemType: filters.itemType,
  });
  return overview || finalizeRevenueRow(createRevenueRow("all"));
};

const getRevenueByBranchService = async (startDate, endDate, filters = {}) => {
  const branchId = parseOptionalId(filters.branchId);
  const [branches, revenueRows] = await Promise.all([
    Branch.findAll({
      attributes: ["id", "branchName"],
      where: branchId ? { id: branchId } : undefined,
      raw: true,
    }),
    getGroupedRevenue({
      startDate,
      endDate,
      groupBy: "branch",
      branchId,
      revenueType: filters.revenueType,
      itemType: filters.itemType,
    }),
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

const getRevenueByDateService = async (startDate, endDate, filters = {}) => {
  const revenueRows = await getGroupedRevenue({
    startDate,
    endDate,
    groupBy: "date",
    branchId: parseOptionalId(filters.branchId),
    revenueType: filters.revenueType,
    itemType: filters.itemType,
  });
  return revenueRows
    .map((row) => ({
      ...row,
      date: row.revenueKey,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const getRevenueByMonthService = async (startDate, endDate, filters = {}) => {
  const revenueRows = await getGroupedRevenue({
    startDate,
    endDate,
    groupBy: "month",
    branchId: parseOptionalId(filters.branchId),
    revenueType: filters.revenueType,
    itemType: filters.itemType,
  });
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

const getRevenueProductsService = async (startDate, endDate, limit = 12, filters = {}) => {
  const parsedLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const branchId = parseOptionalId(filters.branchId);
  const orderDateFilter = buildDateSql("o.createdAt", startDate, endDate);
  const offlineDateFilter = buildDateSql("COALESCE(ob.paidAt, ob.createdAt)", startDate, endDate);
  const onlineBranchFilter = branchId ? " AND o.branchId = :branchId" : "";
  const offlineBranchFilter = branchId ? " AND db.branchId = :branchId" : "";

  const [onlineProducts, offlineProducts, costRows] = await Promise.all([
    sequelize.query(
      `
        SELECT od.variantId AS productVariantId,
               od.productName AS productName,
               pv.sku AS sku,
               od.variantInfo AS variantInfo,
               COALESCE(SUM(od.subTotal), 0) AS onlineRevenue,
               COALESCE(SUM(od.quantity), 0) AS onlineQuantity,
               COUNT(DISTINCT o.id) AS onlineOrderCount
        FROM OrderDetails od
        INNER JOIN Orders o ON od.orderId = o.id
        LEFT JOIN ProductVariants pv ON od.variantId = pv.id
        WHERE o.orderStatus IN (:orderStatuses)
          ${orderDateFilter.sql}
          ${onlineBranchFilter}
        GROUP BY od.variantId, od.productName, pv.sku, od.variantInfo
      `,
      {
        replacements: {
          orderStatuses: PAID_ORDER_STATUSES,
          branchId,
          ...orderDateFilter.replacements,
        },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query(
      `
        SELECT dpi.productVariantId AS productVariantId,
               p.productName AS productName,
               pv.sku AS sku,
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
          ${offlineBranchFilter}
        GROUP BY dpi.productVariantId, p.productName, pv.sku, pv.size, pv.color
      `,
      {
        replacements: {
          paidStatus: PAYMENT_STATUS.PAID,
          branchId,
          ...offlineDateFilter.replacements,
        },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query(
      `
        SELECT prd.variantId AS productVariantId,
               COALESCE(SUM(prd.totalPrice) / NULLIF(SUM(prd.quantity), 0), 0) AS avgCost
        FROM PurchaseReceiptDetails prd
        INNER JOIN PurchaseReceipts pr ON prd.purchaseReceiptId = pr.id
        WHERE pr.status = :approvedStatus
          AND prd.itemType = :productType
          AND prd.variantId IS NOT NULL
          ${branchId ? "AND pr.branchId = :branchId" : ""}
        GROUP BY prd.variantId
      `,
      {
        replacements: {
          approvedStatus: PURCHASE_RECEIPT_STATUS.APPROVED,
          productType: STOCK_ITEM_TYPE.PRODUCT_VARIANT,
          branchId,
        },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  const costMap = new Map(
    costRows.map((row) => [String(row.productVariantId), toNumber(row.avgCost)]),
  );

  const productMap = new Map();
  const ensureProduct = (row) => {
    const key = String(row.productVariantId);
    if (!productMap.has(key)) {
      productMap.set(key, {
        productVariantId: row.productVariantId,
        productName: row.productName || "Sản phẩm",
        sku: row.sku || "",
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
    .map((product) => {
      const avgCost = costMap.get(String(product.productVariantId)) || 0;
      const totalRevenue = product.onlineRevenue + product.offlineRevenue;
      const totalQuantity = product.onlineQuantity + product.offlineQuantity;
      const totalCost = avgCost * totalQuantity;
      return {
        ...product,
        totalRevenue,
        totalQuantity,
        avgCost,
        totalCost,
        grossProfit: totalRevenue - totalCost,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, parsedLimit);
};

const getRevenueBeveragesService = async (startDate, endDate, limit = 12, filters = {}) => {
  const parsedLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const branchId = parseOptionalId(filters.branchId);
  const offlineDateFilter = buildDateSql("COALESCE(ob.paidAt, ob.createdAt)", startDate, endDate);
  const branchFilter = branchId ? " AND db.branchId = :branchId" : "";

  const [beverages, costRows] = await Promise.all([
    sequelize.query(
      `
        SELECT dbi.beverageId AS beverageId,
               bv.beverageName AS beverageName,
               COALESCE(SUM(dbi.subTotal), 0) AS totalRevenue,
               COALESCE(SUM(dbi.quantity), 0) AS totalQuantity,
               COUNT(DISTINCT ob.id) AS orderCount
        FROM DraftBeverageItems dbi
        INNER JOIN DraftBookings db ON dbi.draftId = db.id
        INNER JOIN OfflineBookings ob ON ob.draftId = db.id
        INNER JOIN Beverages bv ON dbi.beverageId = bv.id
        WHERE ob.paymentStatus = :paidStatus
          ${offlineDateFilter.sql}
          ${branchFilter}
        GROUP BY dbi.beverageId, bv.beverageName
      `,
      {
        replacements: {
          paidStatus: PAYMENT_STATUS.PAID,
          branchId,
          ...offlineDateFilter.replacements,
        },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query(
      `
        SELECT prd.beverageId AS beverageId,
               COALESCE(SUM(prd.totalPrice) / NULLIF(SUM(prd.quantity), 0), 0) AS avgCost
        FROM PurchaseReceiptDetails prd
        INNER JOIN PurchaseReceipts pr ON prd.purchaseReceiptId = pr.id
        WHERE pr.status = :approvedStatus
          AND prd.itemType = :beverageType
          AND prd.beverageId IS NOT NULL
          ${branchId ? "AND pr.branchId = :branchId" : ""}
        GROUP BY prd.beverageId
      `,
      {
        replacements: {
          approvedStatus: PURCHASE_RECEIPT_STATUS.APPROVED,
          beverageType: STOCK_ITEM_TYPE.BEVERAGE,
          branchId,
        },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  const costMap = new Map(
    costRows.map((row) => [String(row.beverageId), toNumber(row.avgCost)]),
  );

  return beverages
    .map((row) => {
      const avgCost = costMap.get(String(row.beverageId)) || 0;
      const totalRevenue = toNumber(row.totalRevenue);
      const totalQuantity = toNumber(row.totalQuantity);
      const totalCost = avgCost * totalQuantity;
      return {
        beverageId: row.beverageId,
        beverageName: row.beverageName || "Beverage",
        totalRevenue,
        totalQuantity,
        orderCount: toNumber(row.orderCount),
        avgCost,
        totalCost,
        grossProfit: totalRevenue - totalCost,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, parsedLimit);
};

const calcGrowth = (curr, prev) => {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
};

const getDateRangeByPreset = (range = "month") => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (range === "7days") {
    start.setDate(start.getDate() - 6);
  } else if (range === "30days") {
    start.setDate(start.getDate() - 29);
  } else if (range === "month") {
    start.setDate(1);
  }

  return { start, end };
};

const getDashboardOperationSummary = async ({ startDate, endDate, branchId }) => {
  const dateFilter = buildDateSql("bd.playDate", startDate, endDate);
  const branchFilter = branchId ? " AND b.branchId = :branchId" : "";
  const nowTime = new Date().toTimeString().slice(0, 8);
  const todayKey = new Date().toISOString().slice(0, 10);

  const [statusRows, playingRows, courtRows] = await Promise.all([
    sequelize.query(
      `
        SELECT b.bookingStatus AS status, COUNT(DISTINCT b.id) AS count
        FROM Bookings b
        LEFT JOIN BookingDetails bd ON bd.bookingId = b.id
        WHERE 1=1
          ${dateFilter.sql}
          ${branchFilter}
        GROUP BY b.bookingStatus
      `,
      {
        replacements: { branchId, ...dateFilter.replacements },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query(
      `
        SELECT COUNT(DISTINCT bd.courtId) AS count
        FROM BookingDetails bd
        INNER JOIN Bookings b ON bd.bookingId = b.id
        WHERE bd.playDate = :todayKey
          AND bd.startTime <= :nowTime
          AND bd.endTime > :nowTime
          AND b.bookingStatus IN (:playingStatuses)
          ${branchFilter}
      `,
      {
        replacements: {
          todayKey,
          nowTime,
          playingStatuses: [
            BOOKING_STATUS.CONFIRMED,
            BOOKING_STATUS.CHECKED_IN,
            BOOKING_STATUS.COMPLETED,
          ],
          branchId,
        },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query(
      `
        SELECT COUNT(*) AS count
        FROM Courts c
        WHERE 1=1
          ${branchId ? "AND c.branchId = :branchId" : ""}
      `,
      {
        replacements: { branchId },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  const byStatus = statusRows.reduce((acc, row) => {
    acc[row.status] = toNumber(row.count);
    return acc;
  }, {});
  const playingCourtCount = toNumber(playingRows[0]?.count);
  const totalCourtCount = toNumber(courtRows[0]?.count);

  return {
    totalBookingCount: Object.values(byStatus).reduce((sum, value) => sum + value, 0),
    pendingBookingCount: byStatus[BOOKING_STATUS.PENDING] || 0,
    confirmedBookingCount: byStatus[BOOKING_STATUS.CONFIRMED] || 0,
    checkedInBookingCount: byStatus[BOOKING_STATUS.CHECKED_IN] || 0,
    completedBookingCount: byStatus[BOOKING_STATUS.COMPLETED] || 0,
    cancelledBookingCount: byStatus[BOOKING_STATUS.CANCELLED] || 0,
    playingCourtCount,
    totalCourtCount,
    occupancyRate:
      totalCourtCount > 0 ? Math.round((playingCourtCount / totalCourtCount) * 100) : 0,
  };
};

const getLowStockItemsService = async ({ branchId, limit = 10 } = {}) => {
  const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const branchFilter = branchId ? " AND stockRows.branchId = :branchId" : "";

  return sequelize.query(
    `
      SELECT *
      FROM (
        SELECT vs.branchId,
               br.branchName,
               'PRODUCT_VARIANT' AS itemType,
               vs.variantId AS itemId,
               p.productName AS itemName,
               pv.sku AS sku,
               CONCAT_WS(' / ', NULLIF(pv.size, ''), NULLIF(pv.color, '')) AS variantInfo,
               vs.stock AS currentStock
        FROM VariantStocks vs
        INNER JOIN Branches br ON vs.branchId = br.id
        INNER JOIN ProductVariants pv ON vs.variantId = pv.id
        INNER JOIN Products p ON pv.productId = p.id
        UNION ALL
        SELECT bs.branchId,
               br.branchName,
               'BEVERAGE' AS itemType,
               bs.beverageId AS itemId,
               bv.beverageName AS itemName,
               NULL AS sku,
               NULL AS variantInfo,
               bs.stock AS currentStock
        FROM BeverageStocks bs
        INNER JOIN Branches br ON bs.branchId = br.id
        INNER JOIN Beverages bv ON bs.beverageId = bv.id
      ) stockRows
      WHERE stockRows.currentStock <= :threshold
        ${branchFilter}
      ORDER BY stockRows.currentStock ASC, stockRows.itemName ASC
      LIMIT :limit
    `,
    {
      replacements: {
        threshold: LOW_STOCK_THRESHOLD,
        branchId,
        limit: parsedLimit,
      },
      type: QueryTypes.SELECT,
    },
  );
};

const getDashboardService = async (query = {}) => {
  const now = new Date();
  const branchId = parseOptionalId(query.branchId);
  const range = normalizeFilter(query.range, ["TODAY", "7DAYS", "30DAYS", "MONTH"], "MONTH").toLowerCase();
  const { start: rangeStart, end: rangeEnd } = getDateRangeByPreset(range);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(23, 59, 59, 999);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [
    thisOverview,
    lastOverview,
    todayOverview,
    totalUsers,
    chartRevenue,
    topBranches,
    topProducts,
    topBeverages,
    operationSummary,
    pendingPurchaseReceiptCount,
    pendingPurchaseReceipts,
    lowStockItems,
    lowStockCountRows,
    recentBookings,
    recentOrders,
  ] = await Promise.all([
    getRevenueOverviewService(thisMonthStart, today, { branchId }),
    getRevenueOverviewService(lastMonthStart, lastMonthEnd, { branchId }),
    getRevenueOverviewService(todayStart, today, { branchId }),
    User.count({
      include: [{ model: Role, as: "role", where: { roleName: ROLE_NAME.USER }, required: true }],
    }),
    getRevenueByDateService(sevenDaysAgo, today, { branchId }),
    getRevenueByBranchService(thisMonthStart, today, { branchId }),
    getRevenueProductsService(thisMonthStart, today, 5, { branchId }),
    getRevenueBeveragesService(thisMonthStart, today, 5, { branchId }),
    getDashboardOperationSummary({ startDate: todayStart, endDate: today, branchId }),
    PurchaseReceipt.count({
      where: {
        status: PURCHASE_RECEIPT_STATUS.PENDING,
        ...(branchId ? { branchId } : {}),
      },
    }),
    PurchaseReceipt.findAll({
      attributes: ["id", "receiptCode", "totalAmount", "status", "createdAt"],
      where: {
        status: PURCHASE_RECEIPT_STATUS.PENDING,
        ...(branchId ? { branchId } : {}),
      },
      include: [
        { model: Branch, as: "branch", attributes: ["id", "branchName"] },
        { model: Supplier, as: "supplier", attributes: ["id", "supplierName"] },
        { model: User, as: "creator", attributes: ["id", "username"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
    getLowStockItemsService({ branchId, limit: 8 }),
    sequelize.query(
      `
        SELECT COUNT(*) AS count,
               SUM(CASE WHEN currentStock <= 0 THEN 1 ELSE 0 END) AS outOfStockCount
        FROM (
          SELECT branchId, stock AS currentStock FROM VariantStocks
          UNION ALL
          SELECT branchId, stock AS currentStock FROM BeverageStocks
        ) stockRows
        WHERE stockRows.currentStock <= :threshold
          ${branchId ? "AND stockRows.branchId = :branchId" : ""}
      `,
      {
        replacements: { threshold: LOW_STOCK_THRESHOLD, branchId },
        type: QueryTypes.SELECT,
      },
    ),
    Booking.findAll({
      attributes: ["id", "bookingStatus", "totalAmount", "createdAt"],
      where: branchId ? { branchId } : undefined,
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"], include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar"] }] },
        { model: Branch, as: "branch", attributes: ["id", "branchName"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
    Order.findAll({
      attributes: ["id", "orderStatus", "totalAmount", "createdAt"],
      where: branchId ? { branchId } : undefined,
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

  const chart = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(sevenDaysAgo.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const item = chartMap[key] || {};
    return {
      date: key,
      label: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      bookingRevenue: toNumber(item.bookingRevenue),
      productRevenue: toNumber(item.productRevenue),
      beverageRevenue: toNumber(item.beverageRevenue),
      orderRevenue: toNumber(item.orderRevenue),
      total: toNumber(item.totalRevenue),
    };
  });

  const lowStockMeta = lowStockCountRows[0] || {};
  const pendingOrderCount = await Order.count({
    where: {
      orderStatus: ORDER_STATUS.PENDING,
      ...(branchId ? { branchId } : {}),
    },
  });

  return {
    range: { startDate: rangeStart, endDate: rangeEnd },
    summary: {
      todayRevenue: todayOverview.totalRevenue,
      todayBookingRevenue: todayOverview.bookingRevenue,
      todaySalesRevenue: todayOverview.productRevenue + todayOverview.beverageRevenue,
      todayBookingCount: todayOverview.bookingCount,
      todayOrderCount: todayOverview.orderCount,
      pendingBookingCount: operationSummary.pendingBookingCount,
      pendingOrderCount,
      pendingPurchaseReceiptCount,
      lowStockCount: toNumber(lowStockMeta.count),
      outOfStockCount: toNumber(lowStockMeta.outOfStockCount),
    },
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
    revenueStructure: {
      bookingRevenue: todayOverview.bookingRevenue,
      productRevenue: todayOverview.productRevenue,
      beverageRevenue: todayOverview.beverageRevenue,
    },
    operationSummary,
    topBranches: topBranches.slice(0, 3),
    topProducts,
    topBeverages,
    chart,
    quickRevenueChart: chart,
    pendingPurchaseReceipts: pendingPurchaseReceipts.map((receipt) => {
      const item = receipt.toJSON();
      return {
        id: item.id,
        receiptCode: item.receiptCode,
        branchName: item.branch?.branchName,
        supplierName: item.supplier?.supplierName,
        creatorName: item.creator?.username,
        totalAmount: Number(item.totalAmount),
        status: item.status,
        createdAt: item.createdAt,
      };
    }),
    lowStockItems: lowStockItems.map((item) => ({
      ...item,
      currentStock: toNumber(item.currentStock),
      threshold: LOW_STOCK_THRESHOLD,
      status: toNumber(item.currentStock) <= 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
    })),
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

const getRevenueReportService = async (query = {}) => {
  const {
    startDate,
    endDate,
    limit,
    branchId,
    revenueType = "ALL",
    itemType = "ALL",
    groupBy = "day",
  } = query;
  const filters = { branchId, revenueType, itemType };

  const [
    overview,
    revenueByBranch,
    revenueByDate,
    revenueByMonth,
    productRevenueItems,
    beverageRevenueItems,
  ] = await Promise.all([
    getRevenueOverviewService(startDate, endDate, filters),
    getRevenueByBranchService(startDate, endDate, filters),
    getRevenueByDateService(startDate, endDate, filters),
    getRevenueByMonthService(startDate, endDate, filters),
    getRevenueProductsService(startDate, endDate, limit || 20, filters),
    getRevenueBeveragesService(startDate, endDate, limit || 20, filters),
  ]);

  const includeProducts =
    normalizeFilter(itemType, ["ALL", STOCK_ITEM_TYPE.PRODUCT_VARIANT, STOCK_ITEM_TYPE.BEVERAGE]) !==
    STOCK_ITEM_TYPE.BEVERAGE;
  const includeBeverages =
    normalizeFilter(itemType, ["ALL", STOCK_ITEM_TYPE.PRODUCT_VARIANT, STOCK_ITEM_TYPE.BEVERAGE]) !==
    STOCK_ITEM_TYPE.PRODUCT_VARIANT;
  const productCost = includeProducts
    ? productRevenueItems.reduce((sum, item) => sum + toNumber(item.totalCost), 0)
    : 0;
  const beverageCost = includeBeverages
    ? beverageRevenueItems.reduce((sum, item) => sum + toNumber(item.totalCost), 0)
    : 0;
  const salesRevenue = overview.productRevenue + overview.beverageRevenue;
  const salesCost = productCost + beverageCost;
  const grossProfit = salesRevenue - salesCost;
  const grossMargin = salesRevenue > 0 ? Math.round((grossProfit / salesRevenue) * 100) : 0;

  const decorateBranch = (branch) => ({
    ...branch,
    contributionRate:
      overview.totalRevenue > 0
        ? Math.round((branch.totalRevenue / overview.totalRevenue) * 100)
        : 0,
  });

  const revenueByType = [
    {
      type: "BOOKING",
      label: "Dat san",
      transactionCount: overview.bookingCount,
      revenue: overview.bookingRevenue,
    },
    {
      type: "PRODUCT",
      label: "San pham cau long",
      transactionCount: overview.productOrderCount,
      quantity: overview.productQuantity,
      revenue: overview.productRevenue,
    },
    {
      type: "BEVERAGE",
      label: "Do uong",
      transactionCount: overview.beverageOrderCount,
      quantity: overview.beverageQuantity,
      revenue: overview.beverageRevenue,
    },
  ].filter((item) => {
    const normalizedRevenueType = normalizeFilter(revenueType, [
      "ALL",
      "BOOKING",
      "PRODUCT",
      "BEVERAGE",
    ]);
    return normalizedRevenueType === "ALL" || normalizedRevenueType === item.type;
  });

  return {
    startDate: startDate || null,
    endDate: endDate || null,
    filters: {
      branchId: parseOptionalId(branchId),
      revenueType: normalizeFilter(revenueType, ["ALL", "BOOKING", "PRODUCT", "BEVERAGE"]),
      itemType: normalizeFilter(itemType, [
        "ALL",
        STOCK_ITEM_TYPE.PRODUCT_VARIANT,
        STOCK_ITEM_TYPE.BEVERAGE,
      ]),
      groupBy,
    },
    summary: {
      totalRevenue: overview.totalRevenue,
      bookingRevenue: overview.bookingRevenue,
      productRevenue: overview.productRevenue,
      beverageRevenue: overview.beverageRevenue,
      salesRevenue,
      salesCost,
      grossProfit,
      grossMargin,
      bookingCount: overview.bookingCount,
      orderCount: overview.orderCount,
      productQuantitySold: overview.productQuantity,
      beverageQuantitySold: overview.beverageQuantity,
    },
    overview,
    revenueChart: groupBy === "month" ? revenueByMonth : revenueByDate,
    revenueByType,
    revenueByBranch: revenueByBranch.map(decorateBranch),
    revenueByDate,
    revenueByMonth,
    productRevenueItems,
    beverageRevenueItems,
    profitSummary: {
      productSales: {
        revenue: overview.productRevenue,
        cost: productCost,
        grossProfit: overview.productRevenue - productCost,
      },
      beverageSales: {
        revenue: overview.beverageRevenue,
        cost: beverageCost,
        grossProfit: overview.beverageRevenue - beverageCost,
      },
    },
    topBranches: revenueByBranch.slice(0, 8),
    topProducts: productRevenueItems.slice(0, 8),
    topBeverages: beverageRevenueItems.slice(0, 8),
  };
};

const adminRevenueService = {
  getRevenueOverviewService,
  getRevenueByBranchService,
  getRevenueByDateService,
  getRevenueByMonthService,
  getRevenueByBranchDetailService,
  getRevenueProductsService,
  getRevenueBeveragesService,
  getDashboardService,
  getRevenueReportService,
};

export default adminRevenueService;
