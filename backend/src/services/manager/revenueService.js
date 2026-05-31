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
  ] = await Promise.all([
    sequelize.query(
      `
      SELECT DATE(createdDate) AS date, SUM(totalAmount) AS revenue, COUNT(id) AS count
      FROM Bookings
      WHERE branchId = :branchId
        AND bookingStatus IN (:paidBookingStatuses)
        AND DATE(createdDate) BETWEEN :startDate AND :endDate
      GROUP BY DATE(createdDate)
      ORDER BY DATE(createdDate) ASC
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT DATE(COALESCE(ob.paidAt, ob.createdDate)) AS date,
             SUM(dbi.price) AS revenue,
             COUNT(DISTINCT ob.id) AS count
      FROM OfflineBookings ob
      INNER JOIN DraftBookings db ON db.id = ob.draftId
      INNER JOIN DraftBookingItems dbi ON dbi.draftId = db.id
      WHERE db.branchId = :branchId
        AND ob.paymentStatus = :paidStatus
        AND DATE(COALESCE(ob.paidAt, ob.createdDate)) BETWEEN :startDate AND :endDate
      GROUP BY DATE(COALESCE(ob.paidAt, ob.createdDate))
      ORDER BY DATE(COALESCE(ob.paidAt, ob.createdDate)) ASC
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT DATE(o.createdDate) AS date,
             SUM(od.subTotal) AS revenue,
             COUNT(DISTINCT o.id) AS count
      FROM Orders o
      INNER JOIN OrderDetails od ON od.orderId = o.id
      WHERE o.branchId = :branchId
        AND o.orderStatus IN (:paidOrderStatuses)
        AND DATE(o.createdDate) BETWEEN :startDate AND :endDate
      GROUP BY DATE(o.createdDate)
      ORDER BY DATE(o.createdDate) ASC
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT DATE(COALESCE(ob.paidAt, ob.createdDate)) AS date,
             SUM(dpi.subTotal) AS revenue,
             COUNT(DISTINCT ob.id) AS count
      FROM OfflineBookings ob
      INNER JOIN DraftBookings db ON db.id = ob.draftId
      INNER JOIN DraftProductItems dpi ON dpi.draftId = db.id
      WHERE db.branchId = :branchId
        AND ob.paymentStatus = :paidStatus
        AND DATE(COALESCE(ob.paidAt, ob.createdDate)) BETWEEN :startDate AND :endDate
      GROUP BY DATE(COALESCE(ob.paidAt, ob.createdDate))
      ORDER BY DATE(COALESCE(ob.paidAt, ob.createdDate)) ASC
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT DATE(COALESCE(ob.paidAt, ob.createdDate)) AS date,
             SUM(dbi.subTotal) AS revenue,
             COUNT(DISTINCT ob.id) AS count
      FROM OfflineBookings ob
      INNER JOIN DraftBookings db ON db.id = ob.draftId
      INNER JOIN DraftBeverageItems dbi ON dbi.draftId = db.id
      WHERE db.branchId = :branchId
        AND ob.paymentStatus = :paidStatus
        AND DATE(COALESCE(ob.paidAt, ob.createdDate)) BETWEEN :startDate AND :endDate
      GROUP BY DATE(COALESCE(ob.paidAt, ob.createdDate))
      ORDER BY DATE(COALESCE(ob.paidAt, ob.createdDate)) ASC
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

  chart.forEach((item) => {
    item.totalRevenue =
      item.courtRevenue + item.productRevenue + item.beverageRevenue;
  });

  const courtRevenue =
    sumRows(courtBookingRows) + sumRows(courtOfflineRows);
  const productRevenue =
    sumRows(productOrderRows) + sumRows(productOfflineRows);
  const beverageRevenue = sumRows(beverageOfflineRows);
  const totalRevenue = courtRevenue + productRevenue + beverageRevenue;

  return {
    branchId,
    startDate,
    endDate,
    overview: {
      totalRevenue,
      courtRevenue,
      productRevenue,
      beverageRevenue,
      bookingCount:
        courtBookingRows.reduce((sum, row) => sum + toNumber(row.count), 0) +
        courtOfflineRows.reduce((sum, row) => sum + toNumber(row.count), 0),
      orderCount:
        productOrderRows.reduce((sum, row) => sum + toNumber(row.count), 0) +
        productOfflineRows.reduce((sum, row) => sum + toNumber(row.count), 0) +
        beverageOfflineRows.reduce((sum, row) => sum + toNumber(row.count), 0),
    },
    chart,
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
