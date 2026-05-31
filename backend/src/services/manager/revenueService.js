import { QueryTypes } from "sequelize";
import sequelize from "../../config/db.js";
import { BranchManager } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { BOOKING_STATUS } from "../../constants/bookingConstant.js";
import { ORDER_STATUS } from "../../constants/orderConstant.js";
import { PAYMENT_STATUS } from "../../constants/paymentConstant.js";

const PAID_BOOKING_STATUSES = [
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.COMPLETED,
];

const PAID_ORDER_STATUSES = [
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_TO_SHIP,
  ORDER_STATUS.SHIPPING,
  ORDER_STATUS.COMPLETED,
];

const getManagerBranchId = async (managerId) => {
  const branchManager = await BranchManager.findOne({
    attributes: ["branchId"],
    where: { managerId, isActive: true },
    raw: true,
  });

  if (!branchManager) {
    throw new NotFoundError("Manager has no active branch");
  }

  return branchManager.branchId;
};

const getDefaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

const buildRange = (query = {}) => {
  const fallback = getDefaultRange();
  return {
    startDate: query.startDate || fallback.startDate,
    endDate: query.endDate || fallback.endDate,
  };
};

const toNumber = (value) => Number(value || 0);

const makeDateSeries = (startDate, endDate) => {
  const result = [];
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (current <= end) {
    const date = current.toISOString().slice(0, 10);
    result.push({
      date,
      label: current.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      courtRevenue: 0,
      productRevenue: 0,
      beverageRevenue: 0,
      totalRevenue: 0,
      salaryCost: 0,
      inventoryCost: 0,
      totalCost: 0,
      profit: 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
};

const addRowsToMap = (map, rows, field) => {
  rows.forEach((row) => {
    if (!map[row.date]) return;
    map[row.date][field] += toNumber(row.revenue);
  });
};

const sumRows = (rows) =>
  rows.reduce((sum, row) => sum + toNumber(row.revenue), 0);

const sumCostRows = (rows) =>
  rows.reduce((sum, row) => sum + toNumber(row.cost), 0);

const getMonthKey = (date) => String(date || "").slice(0, 7);

const getMonthLabel = (monthKey) => {
  const [, month] = monthKey.split("-");
  return `Thang ${Number(month)}`;
};

const addRevenueRowsToMonthlyMap = (map, rows, field) => {
  rows.forEach((row) => {
    const month = getMonthKey(row.date);
    if (!month) return;
    if (!map.has(month)) {
      map.set(month, {
        month,
        label: getMonthLabel(month),
        courtRevenue: 0,
        productRevenue: 0,
        beverageRevenue: 0,
        totalRevenue: 0,
        salaryCost: 0,
        inventoryCost: 0,
        totalCost: 0,
        profit: 0,
      });
    }
    map.get(month)[field] += toNumber(row.revenue);
  });
};

const addCostRowsToMonthlyMap = (map, rows, field) => {
  rows.forEach((row) => {
    const month = getMonthKey(row.date);
    if (!month) return;
    if (!map.has(month)) {
      map.set(month, {
        month,
        label: getMonthLabel(month),
        courtRevenue: 0,
        productRevenue: 0,
        beverageRevenue: 0,
        totalRevenue: 0,
        salaryCost: 0,
        inventoryCost: 0,
        totalCost: 0,
        profit: 0,
      });
    }
    map.get(month)[field] += toNumber(row.cost);
  });
};

const getDaysInMonth = (dateString) => {
  const [year, month] = dateString.split("-").map(Number);
  return new Date(year, month, 0).getDate();
};

const getInclusiveDayCount = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.max(Math.floor((end - start) / 86400000) + 1, 1);
};

const getManagerRevenueService = async (managerId, query = {}) => {
  const branchId = await getManagerBranchId(managerId);
  const { startDate, endDate } = buildRange(query);
  const replacements = {
    branchId,
    startDate,
    endDate,
    paidStatus: PAYMENT_STATUS.PAID,
    paidBookingStatuses: PAID_BOOKING_STATUSES,
    paidOrderStatuses: PAID_ORDER_STATUSES,
  };

  const [
    courtBookingRows,
    courtOfflineRows,
    productOrderRows,
    productOfflineRows,
    beverageOfflineRows,
    salaryRows,
    inventoryRows,
  ] = await Promise.all([
    sequelize.query(
      `
      SELECT DATE(createdAt) AS date, SUM(totalAmount) AS revenue, COUNT(id) AS count
      FROM Bookings
      WHERE branchId = :branchId
        AND bookingStatus IN (:paidBookingStatuses)
        AND DATE(createdAt) BETWEEN :startDate AND :endDate
      GROUP BY DATE(createdAt)
      ORDER BY DATE(createdAt) ASC
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT DATE(COALESCE(ob.paidAt, ob.createdAt)) AS date,
             SUM(dbi.price) AS revenue,
             COUNT(DISTINCT ob.id) AS count
      FROM OfflineBookings ob
      INNER JOIN DraftBookings db ON db.id = ob.draftId
      INNER JOIN DraftBookingItems dbi ON dbi.draftId = db.id
      WHERE db.branchId = :branchId
        AND ob.paymentStatus = :paidStatus
        AND DATE(COALESCE(ob.paidAt, ob.createdAt)) BETWEEN :startDate AND :endDate
      GROUP BY DATE(COALESCE(ob.paidAt, ob.createdAt))
      ORDER BY DATE(COALESCE(ob.paidAt, ob.createdAt)) ASC
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT DATE(o.createdAt) AS date,
             SUM(od.subTotal) AS revenue,
             COUNT(DISTINCT o.id) AS count
      FROM Orders o
      INNER JOIN OrderDetails od ON od.orderId = o.id
      WHERE o.branchId = :branchId
        AND o.orderStatus IN (:paidOrderStatuses)
        AND DATE(o.createdAt) BETWEEN :startDate AND :endDate
      GROUP BY DATE(o.createdAt)
      ORDER BY DATE(o.createdAt) ASC
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT DATE(COALESCE(ob.paidAt, ob.createdAt)) AS date,
             SUM(dpi.subTotal) AS revenue,
             COUNT(DISTINCT ob.id) AS count
      FROM OfflineBookings ob
      INNER JOIN DraftBookings db ON db.id = ob.draftId
      INNER JOIN DraftProductItems dpi ON dpi.draftId = db.id
      WHERE db.branchId = :branchId
        AND ob.paymentStatus = :paidStatus
        AND DATE(COALESCE(ob.paidAt, ob.createdAt)) BETWEEN :startDate AND :endDate
      GROUP BY DATE(COALESCE(ob.paidAt, ob.createdAt))
      ORDER BY DATE(COALESCE(ob.paidAt, ob.createdAt)) ASC
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT DATE(COALESCE(ob.paidAt, ob.createdAt)) AS date,
             SUM(dbi.subTotal) AS revenue,
             COUNT(DISTINCT ob.id) AS count
      FROM OfflineBookings ob
      INNER JOIN DraftBookings db ON db.id = ob.draftId
      INNER JOIN DraftBeverageItems dbi ON dbi.draftId = db.id
      WHERE db.branchId = :branchId
        AND ob.paymentStatus = :paidStatus
        AND DATE(COALESCE(ob.paidAt, ob.createdAt)) BETWEEN :startDate AND :endDate
      GROUP BY DATE(COALESCE(ob.paidAt, ob.createdAt))
      ORDER BY DATE(COALESCE(ob.paidAt, ob.createdAt)) ASC
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT ws.workDate AS date,
             SUM(COALESCE(wse.earnedWage, 0)) AS cost,
             COUNT(wse.id) AS count
      FROM WorkShiftEmployees wse
      INNER JOIN WorkShifts ws ON ws.id = wse.workShiftId
      WHERE ws.branchId = :branchId
        AND ws.workDate BETWEEN :startDate AND :endDate
      GROUP BY ws.workDate
      ORDER BY ws.workDate ASC
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT DATE(createdAt) AS date,
             SUM(totalAmount) AS cost,
             COUNT(id) AS count
      FROM InventoryReceipts
      WHERE branchId = :branchId
        AND DATE(createdAt) BETWEEN :startDate AND :endDate
      GROUP BY DATE(createdAt)
      ORDER BY DATE(createdAt) ASC
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
  ]);

  const chart = makeDateSeries(startDate, endDate);
  const chartMap = Object.fromEntries(chart.map((item) => [item.date, item]));

  addRowsToMap(chartMap, courtBookingRows, "courtRevenue");
  addRowsToMap(chartMap, courtOfflineRows, "courtRevenue");
  addRowsToMap(chartMap, productOrderRows, "productRevenue");
  addRowsToMap(chartMap, productOfflineRows, "productRevenue");
  addRowsToMap(chartMap, beverageOfflineRows, "beverageRevenue");

  salaryRows.forEach((row) => {
    if (!chartMap[row.date]) return;
    chartMap[row.date].salaryCost += toNumber(row.cost);
  });

  inventoryRows.forEach((row) => {
    if (!chartMap[row.date]) return;
    chartMap[row.date].inventoryCost += toNumber(row.cost);
  });

  chart.forEach((item) => {
    item.totalRevenue =
      item.courtRevenue + item.productRevenue + item.beverageRevenue;
    item.totalCost = item.salaryCost + item.inventoryCost;
    item.profit = item.totalRevenue - item.totalCost;
  });

  const courtRevenue =
    sumRows(courtBookingRows) + sumRows(courtOfflineRows);
  const productRevenue =
    sumRows(productOrderRows) + sumRows(productOfflineRows);
  const beverageRevenue = sumRows(beverageOfflineRows);
  const totalRevenue = courtRevenue + productRevenue + beverageRevenue;
  const salaryCost = sumCostRows(salaryRows);
  const inventoryCost = sumCostRows(inventoryRows);
  const totalCost = salaryCost + inventoryCost;
  const profit = totalRevenue - totalCost;
  const rangeDayCount = getInclusiveDayCount(startDate, endDate);
  const daysInEstimateMonth = getDaysInMonth(endDate);
  const estimatedMonthlyRevenue = Math.round(
    (totalRevenue / rangeDayCount) * daysInEstimateMonth,
  );
  const estimatedMonthlyProfit = Math.round(
    (profit / rangeDayCount) * daysInEstimateMonth,
  );
  const monthlyMap = new Map();
  addRevenueRowsToMonthlyMap(monthlyMap, courtBookingRows, "courtRevenue");
  addRevenueRowsToMonthlyMap(monthlyMap, courtOfflineRows, "courtRevenue");
  addRevenueRowsToMonthlyMap(monthlyMap, productOrderRows, "productRevenue");
  addRevenueRowsToMonthlyMap(monthlyMap, productOfflineRows, "productRevenue");
  addRevenueRowsToMonthlyMap(monthlyMap, beverageOfflineRows, "beverageRevenue");
  addCostRowsToMonthlyMap(monthlyMap, salaryRows, "salaryCost");
  addCostRowsToMonthlyMap(monthlyMap, inventoryRows, "inventoryCost");
  const monthlyChart = [...monthlyMap.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item) => ({
      ...item,
      totalRevenue: item.courtRevenue + item.productRevenue + item.beverageRevenue,
      totalCost: item.salaryCost + item.inventoryCost,
      profit:
        item.courtRevenue +
        item.productRevenue +
        item.beverageRevenue -
        item.salaryCost -
        item.inventoryCost,
    }));

  return {
    branchId,
    startDate,
    endDate,
    overview: {
      totalRevenue,
      courtRevenue,
      productRevenue,
      beverageRevenue,
      salaryCost,
      inventoryCost,
      totalCost,
      profit,
      bookingCount:
        courtBookingRows.reduce((sum, row) => sum + toNumber(row.count), 0) +
        courtOfflineRows.reduce((sum, row) => sum + toNumber(row.count), 0),
      orderCount:
        productOrderRows.reduce((sum, row) => sum + toNumber(row.count), 0) +
        productOfflineRows.reduce((sum, row) => sum + toNumber(row.count), 0) +
        beverageOfflineRows.reduce((sum, row) => sum + toNumber(row.count), 0),
    },
    monthlyEstimate: {
      month: Number(endDate.slice(5, 7)),
      year: Number(endDate.slice(0, 4)),
      basedOnDays: rangeDayCount,
      daysInMonth: daysInEstimateMonth,
      estimatedRevenue: estimatedMonthlyRevenue,
      estimatedProfit: estimatedMonthlyProfit,
      averageDailyRevenue: Math.round(totalRevenue / rangeDayCount),
      averageDailyProfit: Math.round(profit / rangeDayCount),
    },
    chart,
    monthlyChart,
    breakdown: [
      { type: "COURT", label: "Doanh thu sân", revenue: courtRevenue },
      { type: "PRODUCT", label: "Doanh thu sản phẩm", revenue: productRevenue },
      { type: "BEVERAGE", label: "Doanh thu đồ uống", revenue: beverageRevenue },
    ],
  };
};

export default {
  getManagerRevenueService,
};
