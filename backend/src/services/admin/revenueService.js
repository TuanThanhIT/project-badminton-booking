import { Op, fn, col, literal } from "sequelize";
import {
  Order,
  OrderDetail,
  Payment,
  Booking,
  PaymentBooking,
  OfflineBooking,
  ProductVarient,
  Product,
  Category,
  OfflineProductItem,
  OfflineBeverageItem,
  Beverage,
} from "../../models/index.js";
import { buildDayRange, getCurrentWeekRange } from "../../utils/dateRange.js";

const getDashboardOverviewService = async (data) => {
  const { startDate, endDate } = data;
  let start, end;

  // ===== Default: tuần hiện tại =====
  if (!startDate || !endDate) {
    ({ start, end } = getCurrentWeekRange());
  } else {
    start = new Date(`${startDate}T00:00:00+07:00`);
    end = new Date(`${endDate}T23:59:59.999+07:00`);
  }

  const dateFilter = {
    [Op.between]: [start, end],
  };

  /* ===================== DOANH THU ===================== */
  const [onlineOrderRevenue, onlineBookingRevenue, offlineRevenue] =
    await Promise.all([
      Payment.sum("paymentAmount", {
        where: {
          paymentStatus: "Success",
          paidAt: dateFilter,
        },
      }),

      PaymentBooking.sum("paymentAmount", {
        where: {
          paymentStatus: "Success",
          paidAt: dateFilter,
        },
      }),

      OfflineBooking.sum("grandTotal", {
        where: {
          paymentStatus: "Paid",
          paidAt: dateFilter,
        },
      }),
    ]);

  /* ===================== ORDER (ONLINE SHOP) ===================== */
  const [totalOrders, completedOrders, cancelledOrders] = await Promise.all([
    Order.count({ where: { createdDate: dateFilter } }),

    Order.count({
      where: {
        orderStatus: "Completed",
        createdDate: dateFilter,
      },
    }),

    Order.count({
      where: {
        orderStatus: "Cancelled",
        createdDate: dateFilter,
      },
    }),
  ]);

  /* ===================== BOOKING (ONLINE) ===================== */
  const [totalBookings, completedBookings, cancelledBookings] =
    await Promise.all([
      Booking.count({ where: { createdDate: dateFilter } }),

      Booking.count({
        where: {
          bookingStatus: "Completed",
          createdDate: dateFilter,
        },
      }),

      Booking.count({
        where: {
          bookingStatus: "Cancelled",
          createdDate: dateFilter,
        },
      }),
    ]);

  /* ===================== OFFLINE BOOKING ===================== */
  const [totalOffline, paidOffline] = await Promise.all([
    OfflineBooking.count({
      where: { createdDate: dateFilter },
    }),

    OfflineBooking.count({
      where: {
        paymentStatus: "Paid",
        createdDate: dateFilter,
      },
    }),
  ]);

  const onlineOrder = onlineOrderRevenue || 0;
  const onlineBooking = onlineBookingRevenue || 0;
  const offline = offlineRevenue || 0;

  return {
    range: {
      start,
      end,
      type: "WEEK",
    },
    startDate: start,
    endDate: end,
    revenue: {
      onlineOrder,
      onlineBooking,
      offline,
      total: onlineOrder + onlineBooking + offline,
    },

    orders: {
      total: totalOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
    },

    bookings: {
      total: totalBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
    },

    offlineBookings: {
      total: totalOffline,
      paid: paidOffline,
    },
  };
};

const getRevenueByDayService = async (data) => {
  const { date } = data;
  const { start, end } = buildDayRange(date);

  const dateFilter = {
    [Op.between]: [start, end],
  };

  const [onlineOrder, onlineBooking, offline] = await Promise.all([
    Payment.sum("paymentAmount", {
      where: {
        paymentStatus: "Success",
        paidAt: dateFilter,
      },
    }),

    PaymentBooking.sum("paymentAmount", {
      where: {
        paymentStatus: "Success",
        paidAt: dateFilter,
      },
    }),

    OfflineBooking.sum("grandTotal", {
      where: {
        paymentStatus: "Paid",
        paidAt: dateFilter,
      },
    }),
  ]);

  const orderRevenue = onlineOrder || 0;
  const bookingRevenue = onlineBooking || 0;
  const offlineRevenue = offline || 0;

  return {
    date: start.toISOString().slice(0, 10),
    revenue: {
      onlineOrder: orderRevenue,
      onlineBooking: bookingRevenue,
      offline: offlineRevenue,
      total: orderRevenue + bookingRevenue + offlineRevenue,
    },
  };
};

const getRevenueTransactionListService = async (data) => {
  const { startDate, endDate, page, limit } = data;
  const p = page ?? 1;
  const l = limit ?? 10;

  const offset = (p - 1) * l;

  let start, end;
  if (!startDate || !endDate) {
    ({ start, end } = getCurrentWeekRange());
  } else {
    start = new Date(`${startDate}T00:00:00+07:00`);
    end = new Date(`${endDate}T23:59:59.999+07:00`);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  const dateFilter = {
    [Op.between]: [start, end],
  };

  /* ===================== ONLINE ORDER ===================== */
  const onlineOrders = await Order.findAll({
    attributes: ["id", "createdDate", "totalAmount"],
    where: {
      orderStatus: "Completed",
      createdDate: dateFilter,
    },
    include: [
      {
        model: Payment,
        as: "payment",
        attributes: ["paymentMethod", "paymentStatus", "paidAt"],
        where: { paymentStatus: "Success" },
      },
    ],
  });

  /* ===================== ONLINE BOOKING ===================== */
  const onlineBookings = await Booking.findAll({
    attributes: ["id", "createdDate", "totalAmount"],
    where: {
      bookingStatus: "Completed",
      createdDate: dateFilter,
    },
    include: [
      {
        model: PaymentBooking,
        as: "paymentBooking",
        attributes: ["paymentMethod", "paymentStatus", "paidAt"],
        where: { paymentStatus: "Success" },
      },
    ],
  });

  /* ===================== OFFLINE ===================== */
  const offlineBookings = await OfflineBooking.findAll({
    attributes: [
      "id",
      "createdDate",
      "grandTotal",
      "paymentMethod",
      "paymentStatus",
      "paidAt",
    ],
    where: {
      paymentStatus: "Paid",
      paidAt: dateFilter,
    },
  });

  /* ===================== FORMAT DATA ===================== */
  const dt = [
    ...onlineOrders.map((o) => ({
      id: o.id,
      type: "ONLINE_ORDER",
      amount: o.totalAmount,
      paymentMethod: o.payment.paymentMethod,
      paymentStatus: o.payment.paymentStatus,
      paidAt: o.payment.paidAt,
      createdDate: o.createdDate,
    })),

    ...onlineBookings.map((b) => ({
      id: b.id,
      type: "ONLINE_BOOKING",
      amount: b.totalAmount,
      paymentMethod: b.paymentBooking.paymentMethod,
      paymentStatus: b.paymentBooking.paymentStatus,
      paidAt: b.paymentBooking.paidAt,
      createdDate: b.createdDate,
    })),

    ...offlineBookings.map((o) => ({
      id: o.id,
      type: "OFFLINE",
      amount: o.grandTotal,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      paidAt: o.paidAt,
      createdDate: o.createdDate,
    })),
  ];

  // sort mới → cũ
  dt.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

  return {
    total: dt.length,
    page: p,
    limit: l,
    startDate: start,
    endDate: end,
    rows: dt.slice(offset, offset + limit),
  };
};

const getRevenueProductService = async (data) => {
  const { startDate, endDate, page, limit } = data;
  const p = page ?? 1;
  const l = limit ?? 10;

  let start, end;
  if (!startDate || !endDate) {
    ({ start, end } = getCurrentWeekRange());
  } else {
    start = new Date(`${startDate}T00:00:00+07:00`);
    end = new Date(`${endDate}T23:59:59.999+07:00`);
  }

  /* ===================== ONLINE ===================== */
  const onlineData = await OrderDetail.findAll({
    attributes: [
      [fn("SUM", col("OrderDetail.quantity")), "totalSold"],
      [fn("SUM", col("OrderDetail.subTotal")), "revenue"],
    ],
    include: [
      {
        model: Order,
        as: "order",
        attributes: [],
        where: {
          orderStatus: "Completed",
          createdDate: { [Op.between]: [start, end] },
        },
      },
      {
        model: ProductVarient,
        as: "varient",
        attributes: [],
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "productName"],
            include: [
              {
                model: Category,
                as: "category",
                attributes: ["id", "cateName"],
              },
            ],
          },
        ],
      },
    ],
    group: [
      "varient.product.id",
      "varient.product.productName",
      "varient.product.category.id",
      "varient.product.category.cateName",
    ],
    raw: true,
  });

  /* ===================== OFFLINE ===================== */
  const offlineData = await OfflineProductItem.findAll({
    attributes: [
      [fn("SUM", col("OfflineProductItem.quantity")), "totalSold"],
      [fn("SUM", col("OfflineProductItem.subTotal")), "revenue"],
    ],
    include: [
      {
        model: OfflineBooking,
        as: "offlineBooking",
        attributes: [],
        where: {
          paymentStatus: "Paid",
          paidAt: { [Op.between]: [start, end] },
        },
      },
      {
        model: ProductVarient,
        as: "productVarient",
        attributes: [],
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "productName"],
            include: [
              {
                model: Category,
                as: "category",
                attributes: ["id", "cateName"],
              },
            ],
          },
        ],
      },
    ],
    group: [
      "productVarient.product.id",
      "productVarient.product.productName",
      "productVarient.product.category.id",
      "productVarient.product.category.cateName",
    ],
    raw: true,
  });

  /* ===================== MERGE ===================== */
  const map = new Map();

  const merge = (item, prefix) => {
    const productId = item[`${prefix}.product.id`];

    if (!map.has(productId)) {
      map.set(productId, {
        productId,
        productName: item[`${prefix}.product.productName`],
        categoryId: item[`${prefix}.product.category.id`],
        categoryName: item[`${prefix}.product.category.cateName`],
        totalSold: 0,
        revenue: 0,
      });
    }

    const row = map.get(productId);
    row.totalSold += Number(item.totalSold || 0);
    row.revenue += Number(item.revenue || 0);
  };

  onlineData.forEach((i) => merge(i, "varient"));
  offlineData.forEach((i) => merge(i, "productVarient"));

  // ===== Chuyển Map sang mảng và thêm thông tin thời gian =====
  const allData = Array.from(map.values())
    .map((item) => ({
      ...item,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // ===== PHÂN TRANG =====
  const total = allData.length;
  const offset = (p - 1) * l;
  const paginatedData = allData.slice(offset, offset + l);

  return {
    page: p,
    limit: l,
    total,
    startDate: start,
    endDate: end,
    data: paginatedData,
  };
};

const getRevenueBeverageService = async (data) => {
  const { startDate, endDate, page, limit } = data;
  const p = page ?? 1;
  const l = limit ?? 10;

  // ===== Xác định khoảng thời gian =====
  const { start, end } =
    startDate && endDate
      ? {
          start: new Date(`${startDate}T00:00:00+07:00`),
          end: new Date(`${endDate}T23:59:59.999+07:00`),
        }
      : getCurrentWeekRange();

  // ===== Lấy dữ liệu doanh thu =====
  const revenueData = await OfflineBeverageItem.findAll({
    attributes: [
      "beverageId",
      [fn("SUM", col("quantity")), "totalSold"],
      [fn("SUM", literal("price * quantity")), "revenue"],
      [fn("AVG", col("price")), "price"],
    ],
    include: [
      {
        model: OfflineBooking,
        as: "offlineBooking",
        attributes: [],
        where: {
          paymentStatus: "Paid",
          paidAt: { [Op.between]: [start, end] },
        },
      },
      {
        model: Beverage,
        as: "beverage",
        attributes: ["id", "name"],
      },
    ],
    group: ["beverageId", "beverage.id", "beverage.name"],
    order: [[fn("SUM", col("quantity")), "DESC"]],
    subQuery: false,
    raw: true,
    nest: true,
  });

  // ===== Chuẩn hóa object =====
  const allData = revenueData.map((item) => ({
    id: item.beverage.id,
    name: item.beverage.name,
    price: parseFloat(item.price),
    totalSold: parseInt(item.totalSold, 10),
    revenue: parseFloat(item.revenue),
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  }));

  // ===== Phân trang =====
  const total = allData.length;
  const offset = (p - 1) * l;
  const dt = allData.slice(offset, offset + l);

  return {
    page: p,
    limit: l,
    total,
    startDate: start,
    endDate: end,
    data: dt,
  };
};

const revenueService = {
  getDashboardOverviewService,
  getRevenueByDayService,
  getRevenueTransactionListService,
  getRevenueProductService,
  getRevenueBeverageService,
};

export default revenueService;
