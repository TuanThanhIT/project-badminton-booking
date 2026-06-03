import { QueryTypes } from "sequelize";
import sequelize from "../../config/db.js";
import { BOOKING_STATUS } from "../../constants/bookingConstant.js";
import { ORDER_STATUS } from "../../constants/orderConstant.js";
import { PAYMENT_STATUS } from "../../constants/paymentConstant.js";
import {
  PURCHASE_RECEIPT_STATUS,
  STOCK_ITEM_TYPE,
} from "../../constants/inventoryConstant.js";

const PAID_BOOKING_STATUSES = [
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.CHECKED_IN,
  BOOKING_STATUS.COMPLETED,
];

const PAID_ORDER_STATUSES = [
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_TO_SHIP,
  ORDER_STATUS.SHIPPING,
  ORDER_STATUS.COMPLETED,
];

const LOW_STOCK_THRESHOLD = 5;

const toNumber = (value) => Number(value || 0);

const todayString = () => new Date().toISOString().slice(0, 10);

const daysAgoString = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - (days - 1));
  return date.toISOString().slice(0, 10);
};

const monthStartString = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
};

const getRangeFromQuery = (query = {}, fallbackDays = 30) => ({
  startDate: query.startDate || daysAgoString(fallbackDays),
  endDate: query.endDate || todayString(),
});

const getDashboardRange = (range = "today") => {
  const endDate = todayString();
  if (range === "7days") return { startDate: daysAgoString(7), endDate };
  if (range === "30days") return { startDate: daysAgoString(30), endDate };
  if (range === "month") return { startDate: monthStartString(), endDate };
  return { startDate: endDate, endDate };
};

const dateSeries = (startDate, endDate) => {
  const items = [];
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (current <= end) {
    const date = current.toISOString().slice(0, 10);
    items.push({
      date,
      label: current.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      bookingRevenue: 0,
      productRevenue: 0,
      beverageRevenue: 0,
      salesRevenue: 0,
      totalRevenue: 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return items;
};

const makeBranchFilter = (branchId, alias = "") => {
  if (!branchId) return "";
  const prefix = alias ? `${alias}.` : "";
  return ` AND ${prefix}branchId = :branchId`;
};

const makeBranchSelect = (branchId, alias = "b") =>
  branchId
    ? "SELECT id, branchName FROM Branches WHERE id = :branchId"
    : `SELECT ${alias}.id, ${alias}.branchName FROM Branches ${alias}`;

const getCostJoin = (itemType, fieldName) => `
  LEFT JOIN (
    SELECT d.${fieldName}, SUM(d.totalPrice) / NULLIF(SUM(d.quantity), 0) AS avgCost
    FROM PurchaseReceiptDetails d
    INNER JOIN PurchaseReceipts pr ON pr.id = d.purchaseReceiptId
    WHERE pr.status = '${PURCHASE_RECEIPT_STATUS.APPROVED}'
      AND d.itemType = '${itemType}'
      AND d.${fieldName} IS NOT NULL
    GROUP BY d.${fieldName}
  ) cost ON cost.${fieldName} = sales.${fieldName}
`;

const emptySummary = () => ({
  totalRevenue: 0,
  bookingRevenue: 0,
  productRevenue: 0,
  beverageRevenue: 0,
  salesRevenue: 0,
  salesCost: 0,
  grossProfit: 0,
  grossMargin: 0,
  bookingCount: 0,
  orderCount: 0,
  productQuantitySold: 0,
  beverageQuantitySold: 0,
});

const passesRevenueType = (type, revenueType = "ALL") =>
  revenueType === "ALL" || revenueType === type;

const passesItemType = (type, itemType = "ALL") =>
  itemType === "ALL" || itemType === type;

const addChartRows = (chartMap, rows, field) => {
  rows.forEach((row) => {
    const item = chartMap.get(row.date);
    if (!item) return;
    item[field] += toNumber(row.revenue);
  });
};

const summarizeReport = ({
  startDate,
  endDate,
  branches,
  bookingRows,
  productRows,
  beverageRows,
  productItems,
  beverageItems,
  revenueType,
  itemType,
  orderCount,
}) => {
  const summary = emptySummary();
  const chart = dateSeries(startDate, endDate);
  const chartMap = new Map(chart.map((item) => [item.date, item]));
  const branchMap = new Map(
    branches.map((branch) => [
      Number(branch.id),
      {
        branchId: Number(branch.id),
        branchName: branch.branchName,
        bookingRevenue: 0,
        productRevenue: 0,
        beverageRevenue: 0,
        totalRevenue: 0,
        bookingCount: 0,
        orderCount: 0,
        contributionRate: 0,
      },
    ]),
  );

  if (passesRevenueType("BOOKING", revenueType)) {
    bookingRows.forEach((row) => {
      const revenue = toNumber(row.revenue);
      const count = toNumber(row.count);
      summary.bookingRevenue += revenue;
      summary.bookingCount += count;
      const branch = branchMap.get(Number(row.branchId));
      if (branch) {
        branch.bookingRevenue += revenue;
        branch.bookingCount += count;
      }
    });
    addChartRows(chartMap, bookingRows, "bookingRevenue");
  }

  if (
    passesRevenueType("PRODUCT", revenueType) &&
    passesItemType(STOCK_ITEM_TYPE.PRODUCT_VARIANT, itemType)
  ) {
    productRows.forEach((row) => {
      const revenue = toNumber(row.revenue);
      const quantity = toNumber(row.quantity);
      const cost = toNumber(row.cost);
      summary.productRevenue += revenue;
      summary.productQuantitySold += quantity;
      summary.salesCost += cost;
      const branch = branchMap.get(Number(row.branchId));
      if (branch) branch.productRevenue += revenue;
    });
    addChartRows(chartMap, productRows, "productRevenue");
  }

  if (
    passesRevenueType("BEVERAGE", revenueType) &&
    passesItemType(STOCK_ITEM_TYPE.BEVERAGE, itemType)
  ) {
    beverageRows.forEach((row) => {
      const revenue = toNumber(row.revenue);
      const quantity = toNumber(row.quantity);
      const cost = toNumber(row.cost);
      summary.beverageRevenue += revenue;
      summary.beverageQuantitySold += quantity;
      summary.salesCost += cost;
      const branch = branchMap.get(Number(row.branchId));
      if (branch) branch.beverageRevenue += revenue;
    });
    addChartRows(chartMap, beverageRows, "beverageRevenue");
  }

  summary.salesRevenue = summary.productRevenue + summary.beverageRevenue;
  summary.totalRevenue = summary.bookingRevenue + summary.salesRevenue;
  summary.grossProfit = summary.salesRevenue - summary.salesCost;
  summary.grossMargin = summary.salesRevenue
    ? Math.round((summary.grossProfit / summary.salesRevenue) * 10000) / 100
    : 0;
  summary.orderCount = toNumber(orderCount);

  chart.forEach((item) => {
    item.salesRevenue = item.productRevenue + item.beverageRevenue;
    item.totalRevenue = item.bookingRevenue + item.salesRevenue;
  });

  const revenueByBranch = [...branchMap.values()]
    .map((branch) => ({
      ...branch,
      orderCount: summary.orderCount,
      totalRevenue:
        branch.bookingRevenue + branch.productRevenue + branch.beverageRevenue,
    }))
    .map((branch) => ({
      ...branch,
      contributionRate: summary.totalRevenue
        ? Math.round((branch.totalRevenue / summary.totalRevenue) * 10000) / 100
        : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return {
    summary,
    revenueChart: chart,
    revenueByBranch,
    revenueByType: [
      {
        type: "BOOKING",
        label: "Đặt sân",
        transactionCount: summary.bookingCount,
        revenue: summary.bookingRevenue,
      },
      {
        type: "PRODUCT",
        label: "Sản phẩm cầu lông",
        transactionCount: summary.productQuantitySold,
        revenue: summary.productRevenue,
      },
      {
        type: "BEVERAGE",
        label: "Đồ uống",
        transactionCount: summary.beverageQuantitySold,
        revenue: summary.beverageRevenue,
      },
    ],
    productRevenueItems: productItems,
    beverageRevenueItems: beverageItems,
    profitSummary: {
      productSales: productItems.reduce(
        (total, item) => ({
          revenue: total.revenue + item.revenue,
          cost: total.cost + item.cost,
          grossProfit: total.grossProfit + item.grossProfit,
        }),
        { revenue: 0, cost: 0, grossProfit: 0 },
      ),
      beverageSales: beverageItems.reduce(
        (total, item) => ({
          revenue: total.revenue + item.revenue,
          cost: total.cost + item.cost,
          grossProfit: total.grossProfit + item.grossProfit,
        }),
        { revenue: 0, cost: 0, grossProfit: 0 },
      ),
    },
  };
};

const buildRevenueReport = async ({
  branchId,
  query = {},
  includeProfit = true,
}) => {
  const { startDate, endDate } = getRangeFromQuery(query);
  const revenueType = query.revenueType || "ALL";
  const itemType = query.itemType || "ALL";
  const replacements = {
    branchId,
    startDate,
    endDate,
    paidStatus: PAYMENT_STATUS.PAID,
    paidBookingStatuses: PAID_BOOKING_STATUSES,
    paidOrderStatuses: PAID_ORDER_STATUSES,
  };
  const branchFilter = makeBranchFilter(branchId);
  const orderBranchFilter = makeBranchFilter(branchId, "o");
  const draftBranchFilter = makeBranchFilter(branchId, "db");

  const [
    branches,
    onlineBookings,
    offlineBookings,
    onlineProducts,
    offlineProducts,
    offlineBeverages,
    productItems,
    beverageItems,
    orderCountRows,
    recentRevenueOrders,
  ] = await Promise.all([
    sequelize.query(makeBranchSelect(branchId), {
      replacements,
      type: QueryTypes.SELECT,
    }),
    sequelize.query(
      `
      SELECT DATE(createdAt) AS date, branchId, SUM(totalAmount) AS revenue, COUNT(id) AS count
      FROM Bookings
      WHERE bookingStatus IN (:paidBookingStatuses)
        AND DATE(createdAt) BETWEEN :startDate AND :endDate
        ${branchFilter}
      GROUP BY DATE(createdAt), branchId
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT DATE(COALESCE(ob.paidAt, ob.createdAt)) AS date,
             db.branchId,
             SUM(dbi.price) AS revenue,
             COUNT(DISTINCT ob.id) AS count
      FROM OfflineBookings ob
      INNER JOIN DraftBookings db ON db.id = ob.draftId
      INNER JOIN DraftBookingItems dbi ON dbi.draftId = db.id
      WHERE ob.paymentStatus = :paidStatus
        AND DATE(COALESCE(ob.paidAt, ob.createdAt)) BETWEEN :startDate AND :endDate
        ${draftBranchFilter}
      GROUP BY DATE(COALESCE(ob.paidAt, ob.createdAt)), db.branchId
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT DATE(o.createdAt) AS date,
             o.branchId,
             od.variantId,
             SUM(od.quantity) AS quantity,
             SUM(od.subTotal) AS revenue,
             SUM(od.quantity * COALESCE(cost.avgCost, 0)) AS cost
      FROM Orders o
      INNER JOIN OrderDetails od ON od.orderId = o.id
      INNER JOIN (
        SELECT od2.orderId, od2.variantId
        FROM OrderDetails od2
      ) sales ON sales.orderId = od.orderId AND sales.variantId = od.variantId
      ${getCostJoin(STOCK_ITEM_TYPE.PRODUCT_VARIANT, "variantId")}
      WHERE o.orderStatus IN (:paidOrderStatuses)
        AND DATE(o.createdAt) BETWEEN :startDate AND :endDate
        ${orderBranchFilter}
      GROUP BY DATE(o.createdAt), o.branchId, od.variantId
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT DATE(COALESCE(ob.paidAt, ob.createdAt)) AS date,
             db.branchId,
             dpi.productVariantId AS variantId,
             SUM(dpi.quantity) AS quantity,
             SUM(dpi.subTotal) AS revenue,
             SUM(dpi.quantity * COALESCE(cost.avgCost, 0)) AS cost
      FROM OfflineBookings ob
      INNER JOIN DraftBookings db ON db.id = ob.draftId
      INNER JOIN DraftProductItems dpi ON dpi.draftId = db.id
      INNER JOIN (
        SELECT dpi2.draftId, dpi2.productVariantId AS variantId
        FROM DraftProductItems dpi2
      ) sales ON sales.draftId = dpi.draftId AND sales.variantId = dpi.productVariantId
      ${getCostJoin(STOCK_ITEM_TYPE.PRODUCT_VARIANT, "variantId")}
      WHERE ob.paymentStatus = :paidStatus
        AND DATE(COALESCE(ob.paidAt, ob.createdAt)) BETWEEN :startDate AND :endDate
        ${draftBranchFilter}
      GROUP BY DATE(COALESCE(ob.paidAt, ob.createdAt)), db.branchId, dpi.productVariantId
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT DATE(COALESCE(ob.paidAt, ob.createdAt)) AS date,
             db.branchId,
             dbi.beverageId,
             SUM(dbi.quantity) AS quantity,
             SUM(dbi.subTotal) AS revenue,
             SUM(dbi.quantity * COALESCE(cost.avgCost, 0)) AS cost
      FROM OfflineBookings ob
      INNER JOIN DraftBookings db ON db.id = ob.draftId
      INNER JOIN DraftBeverageItems dbi ON dbi.draftId = db.id
      INNER JOIN (
        SELECT dbi2.draftId, dbi2.beverageId
        FROM DraftBeverageItems dbi2
      ) sales ON sales.draftId = dbi.draftId AND sales.beverageId = dbi.beverageId
      ${getCostJoin(STOCK_ITEM_TYPE.BEVERAGE, "beverageId")}
      WHERE ob.paymentStatus = :paidStatus
        AND DATE(COALESCE(ob.paidAt, ob.createdAt)) BETWEEN :startDate AND :endDate
        ${draftBranchFilter}
      GROUP BY DATE(COALESCE(ob.paidAt, ob.createdAt)), db.branchId, dbi.beverageId
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT item.variantId,
             COALESCE(p.productName, item.productName) AS productName,
             COALESCE(pv.sku, '') AS sku,
             COALESCE(CONCAT_WS(' / ', NULLIF(pv.size, ''), NULLIF(pv.color, '')), item.variantInfo, '') AS variant,
             SUM(item.quantity) AS quantitySold,
             SUM(item.revenue) AS revenue,
             SUM(item.cost) AS cost
      FROM (
        SELECT od.variantId, od.productName, od.variantInfo, SUM(od.quantity) AS quantity,
               SUM(od.subTotal) AS revenue, SUM(od.quantity * COALESCE(cost.avgCost, 0)) AS cost
        FROM Orders o
        INNER JOIN OrderDetails od ON od.orderId = o.id
        INNER JOIN (SELECT od2.orderId, od2.variantId FROM OrderDetails od2) sales
          ON sales.orderId = od.orderId AND sales.variantId = od.variantId
        ${getCostJoin(STOCK_ITEM_TYPE.PRODUCT_VARIANT, "variantId")}
        WHERE o.orderStatus IN (:paidOrderStatuses)
          AND DATE(o.createdAt) BETWEEN :startDate AND :endDate
          ${orderBranchFilter}
        GROUP BY od.variantId, od.productName, od.variantInfo
        UNION ALL
        SELECT dpi.productVariantId AS variantId, NULL AS productName, NULL AS variantInfo, SUM(dpi.quantity) AS quantity,
               SUM(dpi.subTotal) AS revenue, SUM(dpi.quantity * COALESCE(cost.avgCost, 0)) AS cost
        FROM OfflineBookings ob
        INNER JOIN DraftBookings db ON db.id = ob.draftId
        INNER JOIN DraftProductItems dpi ON dpi.draftId = db.id
        INNER JOIN (SELECT dpi2.draftId, dpi2.productVariantId AS variantId FROM DraftProductItems dpi2) sales
          ON sales.draftId = dpi.draftId AND sales.variantId = dpi.productVariantId
        ${getCostJoin(STOCK_ITEM_TYPE.PRODUCT_VARIANT, "variantId")}
        WHERE ob.paymentStatus = :paidStatus
          AND DATE(COALESCE(ob.paidAt, ob.createdAt)) BETWEEN :startDate AND :endDate
          ${draftBranchFilter}
        GROUP BY dpi.productVariantId
      ) item
      LEFT JOIN ProductVariants pv ON pv.id = item.variantId
      LEFT JOIN Products p ON p.id = pv.productId
      GROUP BY item.variantId, p.productName, pv.sku, pv.size, pv.color, item.productName, item.variantInfo
      ORDER BY revenue DESC
      LIMIT 10
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT dbi.beverageId,
             COALESCE(b.beverageName, CONCAT('Beverage #', dbi.beverageId)) AS beverageName,
             SUM(dbi.quantity) AS quantitySold,
             SUM(dbi.subTotal) AS revenue,
             SUM(dbi.quantity * COALESCE(cost.avgCost, 0)) AS cost
      FROM OfflineBookings ob
      INNER JOIN DraftBookings db ON db.id = ob.draftId
      INNER JOIN DraftBeverageItems dbi ON dbi.draftId = db.id
      INNER JOIN (SELECT dbi2.draftId, dbi2.beverageId FROM DraftBeverageItems dbi2) sales
        ON sales.draftId = dbi.draftId AND sales.beverageId = dbi.beverageId
      ${getCostJoin(STOCK_ITEM_TYPE.BEVERAGE, "beverageId")}
      LEFT JOIN Beverages b ON b.id = dbi.beverageId
      WHERE ob.paymentStatus = :paidStatus
        AND DATE(COALESCE(ob.paidAt, ob.createdAt)) BETWEEN :startDate AND :endDate
        ${draftBranchFilter}
      GROUP BY dbi.beverageId, b.beverageName
      ORDER BY revenue DESC
      LIMIT 10
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT COUNT(*) AS count
      FROM (
        SELECT CONCAT('ORDER-', o.id) AS saleId
        FROM Orders o
        WHERE o.orderStatus IN (:paidOrderStatuses)
          AND DATE(o.createdAt) BETWEEN :startDate AND :endDate
          ${orderBranchFilter}
        UNION
        SELECT CONCAT('OFF-', ob.id) AS saleId
        FROM OfflineBookings ob
        INNER JOIN DraftBookings db ON db.id = ob.draftId
        WHERE ob.paymentStatus = :paidStatus
          AND DATE(COALESCE(ob.paidAt, ob.createdAt)) BETWEEN :startDate AND :endDate
          ${draftBranchFilter}
      ) sales
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT o.id, CONCAT('DH-', LPAD(o.id, 5, '0')) AS code, o.totalAmount,
             o.orderStatus AS status, o.createdAt, o.branchId, br.branchName,
             o.shippingName AS customerName
      FROM Orders o
      INNER JOIN Branches br ON br.id = o.branchId
      WHERE o.orderStatus IN (:paidOrderStatuses)
        ${orderBranchFilter}
      ORDER BY o.createdAt DESC
      LIMIT 8
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
  ]);

  const bookingRows = [...onlineBookings, ...offlineBookings];
  const productRows = [...onlineProducts, ...offlineProducts];
  const report = summarizeReport({
    startDate,
    endDate,
    branches,
    bookingRows,
    productRows,
    beverageRows: offlineBeverages,
    productItems: productItems.map((item) => ({
      variantId: item.variantId,
      productName: item.productName,
      variant: item.variant,
      sku: item.sku,
      quantitySold: toNumber(item.quantitySold),
      revenue: toNumber(item.revenue),
      cost: includeProfit ? toNumber(item.cost) : 0,
      grossProfit: includeProfit ? toNumber(item.revenue) - toNumber(item.cost) : 0,
    })),
    beverageItems: beverageItems.map((item) => ({
      beverageId: item.beverageId,
      beverageName: item.beverageName,
      quantitySold: toNumber(item.quantitySold),
      revenue: toNumber(item.revenue),
      cost: includeProfit ? toNumber(item.cost) : 0,
      grossProfit: includeProfit ? toNumber(item.revenue) - toNumber(item.cost) : 0,
    })),
    revenueType,
    itemType,
    orderCount: orderCountRows[0]?.count,
  });

  if (!includeProfit) {
    delete report.summary.salesCost;
    delete report.summary.grossProfit;
    delete report.summary.grossMargin;
    delete report.profitSummary;
    report.productRevenueItems = report.productRevenueItems.map(
      ({ cost, grossProfit, ...item }) => item,
    );
    report.beverageRevenueItems = report.beverageRevenueItems.map(
      ({ cost, grossProfit, ...item }) => item,
    );
  }

  return {
    startDate,
    endDate,
    branchId: branchId || null,
    ...report,
    recentRevenueOrders: recentRevenueOrders.map((order) => ({
      id: Number(order.id),
      code: order.code,
      customerName: order.customerName,
      branchId: Number(order.branchId),
      branchName: order.branchName,
      amount: toNumber(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
    })),
  };
};

const getLowStockItems = async (branchId = null, limit = 10) => {
  const replacements = { branchId, threshold: LOW_STOCK_THRESHOLD };
  const variantBranchFilter = makeBranchFilter(branchId, "vs");
  const beverageBranchFilter = makeBranchFilter(branchId, "bs");
  const rows = await sequelize.query(
    `
    SELECT * FROM (
      SELECT vs.branchId, br.branchName, '${STOCK_ITEM_TYPE.PRODUCT_VARIANT}' AS itemType,
             vs.variantId AS itemId, COALESCE(p.productName, CONCAT('Variant #', vs.variantId)) AS itemName,
             COALESCE(pv.sku, '') AS sku, vs.stock AS stock
      FROM VariantStocks vs
      INNER JOIN Branches br ON br.id = vs.branchId
      LEFT JOIN ProductVariants pv ON pv.id = vs.variantId
      LEFT JOIN Products p ON p.id = pv.productId
      WHERE vs.stock <= :threshold ${variantBranchFilter}
      UNION ALL
      SELECT bs.branchId, br.branchName, '${STOCK_ITEM_TYPE.BEVERAGE}' AS itemType,
             bs.beverageId AS itemId, COALESCE(b.beverageName, CONCAT('Beverage #', bs.beverageId)) AS itemName,
             '' AS sku, bs.stock AS stock
      FROM BeverageStocks bs
      INNER JOIN Branches br ON br.id = bs.branchId
      LEFT JOIN Beverages b ON b.id = bs.beverageId
      WHERE bs.stock <= :threshold ${beverageBranchFilter}
    ) items
    ORDER BY stock ASC, itemName ASC
    LIMIT ${Number(limit)}
    `,
    { replacements, type: QueryTypes.SELECT },
  );

  return rows.map((item) => ({
    ...item,
    branchId: Number(item.branchId),
    itemId: Number(item.itemId),
    stock: toNumber(item.stock),
    threshold: LOW_STOCK_THRESHOLD,
    status: toNumber(item.stock) <= 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
  }));
};

const buildDashboard = async ({ branchId = null, range = "today" }) => {
  const dashboardRange = getDashboardRange(range === "today" ? "7days" : range);
  const todayRange = getDashboardRange("today");
  const [report, todayReport] = await Promise.all([
    buildRevenueReport({
      branchId,
      query: dashboardRange,
      includeProfit: true,
    }),
    buildRevenueReport({
      branchId,
      query: todayRange,
      includeProfit: true,
    }),
  ]);
  const today = todayString();
  const replacements = {
    branchId,
    today,
    paidStatus: PAYMENT_STATUS.PAID,
    pendingBookingStatuses: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CANCEL_REQUESTED],
    playingBookingStatuses: [BOOKING_STATUS.CHECKED_IN],
    completedBookingStatuses: [BOOKING_STATUS.COMPLETED],
    cancelledBookingStatuses: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.FAILED],
    pendingOrderStatuses: [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CANCEL_REQUESTED,
      ORDER_STATUS.RETURN_REQUESTED,
    ],
    pendingReceiptStatus: PURCHASE_RECEIPT_STATUS.PENDING,
    threshold: LOW_STOCK_THRESHOLD,
  };
  const bookingBranchFilter = makeBranchFilter(branchId);
  const orderBranchFilter = makeBranchFilter(branchId);
  const receiptBranchFilter = makeBranchFilter(branchId);
  const variantBranchFilter = makeBranchFilter(branchId, "vs");
  const beverageBranchFilter = makeBranchFilter(branchId, "bs");
  const courtBranchFilter = makeBranchFilter(branchId, "c");

  const [
    bookingStats,
    orderStats,
    pendingReceiptRows,
    stockCountRows,
    playingCourtRows,
    recentPurchaseReceipts,
    recentStockTransactions,
  ] = await Promise.all([
    sequelize.query(
      `
      SELECT
        SUM(CASE WHEN DATE(createdAt) = :today THEN 1 ELSE 0 END) AS todayBookingCount,
        SUM(CASE WHEN bookingStatus IN (:pendingBookingStatuses) THEN 1 ELSE 0 END) AS pendingBookingCount,
        SUM(CASE WHEN bookingStatus = '${BOOKING_STATUS.CONFIRMED}' THEN 1 ELSE 0 END) AS confirmedBookingCount,
        SUM(CASE WHEN bookingStatus IN (:playingBookingStatuses) THEN 1 ELSE 0 END) AS playingBookingCount,
        SUM(CASE WHEN bookingStatus IN (:completedBookingStatuses) THEN 1 ELSE 0 END) AS completedBookingCount,
        SUM(CASE WHEN bookingStatus IN (:cancelledBookingStatuses) THEN 1 ELSE 0 END) AS cancelledBookingCount
      FROM Bookings
      WHERE 1 = 1 ${bookingBranchFilter}
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT
        SUM(CASE WHEN DATE(createdAt) = :today THEN 1 ELSE 0 END) AS todayOrderCount,
        SUM(CASE WHEN orderStatus IN (:pendingOrderStatuses) THEN 1 ELSE 0 END) AS pendingOrderCount
      FROM Orders
      WHERE 1 = 1 ${orderBranchFilter}
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT COUNT(*) AS count
      FROM PurchaseReceipts
      WHERE status = :pendingReceiptStatus ${receiptBranchFilter}
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT
        SUM(CASE WHEN stock > 0 AND stock <= :threshold THEN 1 ELSE 0 END) AS lowStockCount,
        SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) AS outOfStockCount
      FROM (
        SELECT vs.stock FROM VariantStocks vs WHERE 1 = 1 ${variantBranchFilter}
        UNION ALL
        SELECT bs.stock FROM BeverageStocks bs WHERE 1 = 1 ${beverageBranchFilter}
      ) stocks
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT COUNT(DISTINCT bd.courtId) AS count
      FROM BookingDetails bd
      INNER JOIN Bookings b ON b.id = bd.bookingId
      INNER JOIN Courts c ON c.id = bd.courtId
      WHERE b.bookingStatus = '${BOOKING_STATUS.CHECKED_IN}'
        AND bd.playDate = :today
        ${courtBranchFilter}
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT pr.id, pr.receiptCode, pr.totalAmount, pr.status, pr.createdAt,
             br.branchName, s.supplierName, u.username AS creatorName
      FROM PurchaseReceipts pr
      INNER JOIN Branches br ON br.id = pr.branchId
      INNER JOIN Suppliers s ON s.id = pr.supplierId
      INNER JOIN Users u ON u.id = pr.createdBy
      WHERE pr.status = :pendingReceiptStatus ${receiptBranchFilter.replace("branchId", "pr.branchId")}
      ORDER BY pr.createdAt DESC
      LIMIT 8
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT st.id, st.createdAt, st.itemType, st.type, st.quantity, st.afterStock, st.note,
             br.branchName,
             COALESCE(p.productName, b.beverageName, CONCAT('Item #', COALESCE(st.variantId, st.beverageId))) AS itemName
      FROM StockTransactions st
      INNER JOIN Branches br ON br.id = st.branchId
      LEFT JOIN ProductVariants pv ON pv.id = st.variantId
      LEFT JOIN Products p ON p.id = pv.productId
      LEFT JOIN Beverages b ON b.id = st.beverageId
      WHERE 1 = 1 ${receiptBranchFilter.replace("branchId", "st.branchId")}
      ORDER BY st.createdAt DESC
      LIMIT 8
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
  ]);

  const lowStockItems = await getLowStockItems(branchId, 8);
  const booking = bookingStats[0] || {};
  const order = orderStats[0] || {};
  const stockCounts = stockCountRows[0] || {};

  return {
    summary: {
      todayRevenue: todayReport.summary.totalRevenue,
      todayBookingRevenue: todayReport.summary.bookingRevenue,
      todaySalesRevenue: todayReport.summary.salesRevenue,
      todayBookingCount: toNumber(booking.todayBookingCount),
      todayOrderCount: toNumber(order.todayOrderCount),
      playingCourtCount: toNumber(playingCourtRows[0]?.count),
      pendingBookingCount: toNumber(booking.pendingBookingCount),
      pendingOrderCount: toNumber(order.pendingOrderCount),
      pendingPurchaseReceiptCount: toNumber(pendingReceiptRows[0]?.count),
      lowStockCount: toNumber(stockCounts.lowStockCount),
      outOfStockCount: toNumber(stockCounts.outOfStockCount),
    },
    quickRevenueChart: report.revenueChart,
    revenueStructure: {
      bookingRevenue: todayReport.summary.bookingRevenue,
      productRevenue: todayReport.summary.productRevenue,
      beverageRevenue: todayReport.summary.beverageRevenue,
    },
    operationSummary: {
      todayBookingCount: toNumber(booking.todayBookingCount),
      pendingBookingCount: toNumber(booking.pendingBookingCount),
      confirmedBookingCount: toNumber(booking.confirmedBookingCount),
      playingBookingCount: toNumber(booking.playingBookingCount),
      completedBookingCount: toNumber(booking.completedBookingCount),
      cancelledBookingCount: toNumber(booking.cancelledBookingCount),
      playingCourtCount: toNumber(playingCourtRows[0]?.count),
    },
    recentOrders: report.recentRevenueOrders,
    pendingPurchaseReceipts: recentPurchaseReceipts.map((item) => ({
      ...item,
      id: Number(item.id),
      totalAmount: toNumber(item.totalAmount),
    })),
    lowStockItems,
    topProducts: report.productRevenueItems.slice(0, 5),
    topBeverages: report.beverageRevenueItems.slice(0, 5),
    topBranches: report.revenueByBranch.slice(0, 3),
    recentPurchaseReceipts: recentPurchaseReceipts.map((item) => ({
      ...item,
      id: Number(item.id),
      totalAmount: toNumber(item.totalAmount),
    })),
    recentStockTransactions: recentStockTransactions.map((item) => ({
      ...item,
      id: Number(item.id),
      quantity: toNumber(item.quantity),
      afterStock: toNumber(item.afterStock),
    })),
  };
};

export default {
  buildRevenueReport,
  buildDashboard,
  getDashboardRange,
};
