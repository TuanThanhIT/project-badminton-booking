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
import ApiError from "../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const getCurrentWeekRange = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = CN
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const buildDayRange = (date) => {
  const d = date ? new Date(date) : new Date();

  const start = new Date(d);
  start.setHours(0, 0, 0, 0);

  const end = new Date(d);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getDashboardOverviewService = async (startDate, endDate) => {
  try {
    let start, end;

    // ===== Default: tuần hiện tại =====
    if (!startDate || !endDate) {
      ({ start, end } = getCurrentWeekRange());
    } else {
      start = new Date(startDate);
      end = new Date(endDate);
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
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getRevenueByDayService = async (date) => {
  try {
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
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getRevenueTransactionListService = async (
  startDate,
  endDate,
  page = 1,
  limit = 10
) => {
  try {
    const offset = (page - 1) * limit;

    let start, end;
    if (!startDate || !endDate) {
      ({ start, end } = getCurrentWeekRange());
    } else {
      start = new Date(startDate);
      end = new Date(endDate);
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
    const data = [
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
    data.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

    return {
      total: data.length,
      page,
      limit,
      startDate: start,
      endDate: end,
      rows: data.slice(offset, offset + limit),
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getRevenueProductService = async (
  startDate,
  endDate,
  page = 1,
  limit = 10
) => {
  try {
    let start, end;

    // ===== Xác định khoảng thời gian =====
    if (!startDate || !endDate) {
      ({ start, end } = getCurrentWeekRange());
    } else {
      start = new Date(startDate);
      end = new Date(endDate);
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
    const offset = (page - 1) * limit;
    const paginatedData = allData.slice(offset, offset + limit);

    return {
      page,
      limit,
      total,
      startDate: start,
      endDate: end,
      data: paginatedData,
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getRevenueBeverageService = async (
  startDate,
  endDate,
  page = 1,
  limit = 10
) => {
  try {
    // ===== Xác định khoảng thời gian =====
    const { start, end } =
      startDate && endDate
        ? { start: new Date(startDate), end: new Date(endDate) }
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
    const offset = (page - 1) * limit;
    const data = allData.slice(offset, offset + limit);

    return { page, limit, total, startDate: start, endDate: end, data };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const revenueService = {
  getDashboardOverviewService,
  getRevenueByDayService,
  getRevenueTransactionListService,
  getRevenueProductService,
  getRevenueBeverageService,
};

export default revenueService;
