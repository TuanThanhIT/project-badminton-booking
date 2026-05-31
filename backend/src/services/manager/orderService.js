import { Op, QueryTypes } from "sequelize";
import { ORDER_GROUP_STATUS } from "../../constants/orderConstant.js";
import {
  TARGET_PAYMENT_TYPE,
} from "../../constants/paymentConstant.js";
import NotFoundError from "../../errors/NotFoundError.js";
import sequelize from "../../config/db.js";
import {
  Branch,
  BranchManager,
  Order,
  OrderDetail,
  OrderGroup,
  OrderShippingLog,
  Payment,
} from "../../models/index.js";

const orderInclude = [
  {
    model: OrderGroup,
    as: "orderGroup",
    where: { status: ORDER_GROUP_STATUS.PAID },
    required: true,
  },
  {
    model: Branch,
    as: "branch",
    attributes: ["id", "branchName", "address", "phoneNumber"],
  },
  {
    model: OrderDetail,
    as: "details",
  },
  {
    model: OrderShippingLog,
    as: "shippingLogs",
    required: false,
  },
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

const mapOrder = (order, payment = null) => {
  const plain = order.get ? order.get({ plain: true }) : order;

  return {
    id: plain.id,
    orderGroupId: plain.orderGroupId,
    orderStatus: plain.orderStatus,
    previousOrderStatus: plain.previousOrderStatus,
    shippingStatus: plain.shippingStatus,
    shippingOrderCode: plain.shippingOrderCode,
    trackingCode: plain.trackingCode,
    estimatedDelivery: plain.estimatedDelivery,
    deliveredAt: plain.deliveredAt,
    subtotal: Number(plain.subtotal || 0),
    shippingFee: Number(plain.shippingFee || 0),
    shippingFeeReal: Number(plain.shippingFeeReal || 0),
    totalAmount: Number(plain.totalAmount || 0),
    shippingName: plain.shippingName,
    shippingPhone: plain.shippingPhone,
    shippingAddress: plain.shippingAddress,
    cancelledBy: plain.cancelledBy,
    cancelReason: plain.cancelReason,
    cancelRejectReason: plain.cancelRejectReason,
    cancelRequestedAt: plain.cancelRequestedAt,
    cancelHandledAt: plain.cancelHandledAt,
    returnReason: plain.returnReason,
    returnRequestedAt: plain.returnRequestedAt,
    returnHandledAt: plain.returnHandledAt,
    cancelledAt: plain.cancelledAt,
    returnedAt: plain.returnedAt,
    createdDate: plain.createdDate,
    updatedDate: plain.updatedDate,
    branch: plain.branch || null,
    orderGroup: plain.orderGroup
      ? {
          id: plain.orderGroup.id,
          userId: plain.orderGroup.userId,
          status: plain.orderGroup.status,
          totalAmount: Number(plain.orderGroup.totalAmount || 0),
          totalShippingFee: Number(plain.orderGroup.totalShippingFee || 0),
          discountAmount: Number(plain.orderGroup.discountAmount || 0),
          finalAmount: Number(plain.orderGroup.finalAmount || 0),
          note: plain.orderGroup.note,
        }
      : null,
    payment: payment
      ? {
          id: payment.id,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          paymentAmount: Number(payment.paymentAmount || 0),
          paidAt: payment.paidAt,
        }
      : null,
    details:
      plain.details?.map((item) => ({
        id: item.id,
        variantId: item.variantId,
        productName: item.productName,
        variantInfo: item.variantInfo,
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        subTotal: Number(item.subTotal || 0),
      })) || [],
    shippingLogs:
      plain.shippingLogs?.map((item) => ({
        id: item.id,
        status: item.status,
        eventTime: item.eventTime,
        rawData: item.rawData,
      })) || [],
  };
};

const attachPayments = async (orders) => {
  const groupIds = orders.map((order) => order.orderGroupId);
  const payments = groupIds.length
    ? await Payment.findAll({
        where: {
          targetPaymentType: TARGET_PAYMENT_TYPE.ORDER,
          targetPaymentId: groupIds,
        },
      })
    : [];

  const paymentMap = new Map(
    payments.map((payment) => [payment.targetPaymentId, payment]),
  );

  return orders.map((order) => mapOrder(order, paymentMap.get(order.orderGroupId)));
};

const buildWhere = (branchId, query = {}) => {
  const { status, keyword, date } = query;
  const where = { branchId };

  if (status && status !== "ALL") {
    where.orderStatus = status;
  }

  if (date) {
    where.createdDate = {
      [Op.gte]: new Date(`${date}T00:00:00`),
      [Op.lt]: new Date(`${date}T23:59:59.999`),
    };
  }

  if (keyword) {
    where[Op.or] = [
      { id: Number(keyword) || 0 },
      { shippingName: { [Op.like]: `%${keyword}%` } },
      { shippingPhone: { [Op.like]: `%${keyword}%` } },
      { shippingOrderCode: { [Op.like]: `%${keyword}%` } },
    ];
  }

  return where;
};

const getOrdersService = async (managerId, query = {}) => {
  const branchId = await getManagerBranchId(managerId);
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 12);
  const offset = (page - 1) * limit;
  const where = buildWhere(branchId, query);

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: orderInclude,
    distinct: true,
    order: [["createdDate", "DESC"]],
    limit,
    offset,
  });

  const allInBranch = await Order.findAll({
    where: { branchId },
    include: orderInclude,
    attributes: ["orderStatus", "totalAmount"],
  });

  const summary = allInBranch.reduce(
    (acc, order) => {
      acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
      acc.totalOrders += 1;
      acc.totalAmount += Number(order.totalAmount || 0);
      return acc;
    },
    { totalOrders: 0, totalAmount: 0 },
  );

  return {
    branchId,
    items: await attachPayments(rows),
    summary,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getOrderDetailService = async (managerId, orderId) => {
  const branchId = await getManagerBranchId(managerId);
  const order = await Order.findOne({
    where: { id: orderId, branchId },
    include: orderInclude,
    order: [[{ model: OrderShippingLog, as: "shippingLogs" }, "eventTime", "DESC"]],
  });

  if (!order) {
    throw new NotFoundError("Order not found in manager branch");
  }

  const payment = await Payment.findOne({
    where: {
      targetPaymentType: TARGET_PAYMENT_TYPE.ORDER,
      targetPaymentId: order.orderGroupId,
    },
  });

  return mapOrder(order, payment);
};

const buildMonthRange = (query = {}) => {
  const now = new Date();
  const month = Math.min(Math.max(Number(query.month) || now.getMonth() + 1, 1), 12);
  const year = Number(query.year) || now.getFullYear();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

  return { month, year, startDate, endDate };
};

const getMonthlyHighlightsService = async (managerId, query = {}) => {
  const branchId = await getManagerBranchId(managerId);
  const range = buildMonthRange(query);
  const replacements = {
    branchId,
    paidStatus: ORDER_GROUP_STATUS.PAID,
    startDate: range.startDate,
    endDate: range.endDate,
  };

  const [topProducts, topBookers, topEmployees] = await Promise.all([
    sequelize.query(
      `
      SELECT
        od.productName,
        od.variantInfo,
        SUM(od.quantity) AS quantity,
        SUM(od.subTotal) AS revenue
      FROM OrderDetails od
      INNER JOIN Orders o ON o.id = od.orderId
      INNER JOIN OrderGroups og ON og.id = o.orderGroupId
      WHERE o.branchId = :branchId
        AND og.status = :paidStatus
        AND DATE(o.createdDate) BETWEEN :startDate AND :endDate
      GROUP BY od.productName, od.variantInfo
      ORDER BY quantity DESC, revenue DESC
      LIMIT 5
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT
        b.userId,
        u.username,
        p.fullName,
        p.avatar,
        COUNT(b.id) AS bookingCount,
        SUM(b.totalAmount) AS totalAmount
      FROM Bookings b
      INNER JOIN Users u ON u.id = b.userId
      LEFT JOIN Profiles p ON p.userId = u.id
      WHERE b.branchId = :branchId
        AND b.bookingStatus NOT IN ('CANCELLED', 'FAILED')
        AND DATE(b.createdDate) BETWEEN :startDate AND :endDate
      GROUP BY b.userId, u.username, p.fullName, p.avatar
      ORDER BY bookingCount DESC, totalAmount DESC
      LIMIT 5
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `
      SELECT
        wse.employeeId,
        u.username,
        p.fullName,
        p.avatar,
        COUNT(wse.id) AS shiftCount,
        SUM(COALESCE(wse.earnedWage, 0)) AS earnedWage
      FROM WorkShiftEmployees wse
      INNER JOIN WorkShifts ws ON ws.id = wse.workShiftId
      INNER JOIN Users u ON u.id = wse.employeeId
      LEFT JOIN Profiles p ON p.userId = u.id
      WHERE ws.branchId = :branchId
        AND ws.workDate BETWEEN :startDate AND :endDate
        AND ws.shiftStatus <> 'CANCELLED'
      GROUP BY wse.employeeId, u.username, p.fullName, p.avatar
      ORDER BY shiftCount DESC, earnedWage DESC
      LIMIT 5
      `,
      { replacements, type: QueryTypes.SELECT },
    ),
  ]);

  return {
    branchId,
    ...range,
    topProducts: topProducts.map((item) => ({
      productName: item.productName,
      variantInfo: item.variantInfo,
      quantity: Number(item.quantity || 0),
      revenue: Number(item.revenue || 0),
    })),
    topBookers: topBookers.map((item) => ({
      userId: Number(item.userId),
      username: item.username,
      fullName: item.fullName,
      avatar: item.avatar,
      bookingCount: Number(item.bookingCount || 0),
      totalAmount: Number(item.totalAmount || 0),
    })),
    topEmployees: topEmployees.map((item) => ({
      employeeId: Number(item.employeeId),
      username: item.username,
      fullName: item.fullName,
      avatar: item.avatar,
      shiftCount: Number(item.shiftCount || 0),
      earnedWage: Number(item.earnedWage || 0),
    })),
  };
};

export default {
  getOrdersService,
  getOrderDetailService,
  getMonthlyHighlightsService,
};
