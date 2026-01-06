import { col, fn, literal, Op } from "sequelize";
import {
  Beverage,
  Booking,
  CashRegister,
  OfflineBeverageItem,
  OfflineBooking,
  OfflineProductItem,
  Order,
  OrderDetail,
  Product,
  ProductVarient,
  Profile,
  User,
  WorkShift,
  WorkShiftEmployee,
} from "../../models/index.js";
import ApiError from "../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const buildDayRange = (date) => {
  const d = date ? new Date(date) : new Date();

  const start = new Date(d);
  start.setHours(0, 0, 0, 0);

  const end = new Date(d);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

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

// Số lượt đặt sân trong ngày hôm nay
const getTodayBookingCountService = async () => {
  try {
    const { start, end } = buildDayRange();

    const [online, offline] = await Promise.all([
      Booking.count({
        where: { createdDate: { [Op.between]: [start, end] } },
      }),

      OfflineBooking.count({
        where: { createdDate: { [Op.between]: [start, end] } },
      }),
    ]);

    return {
      online,
      offline,
      total: online + offline,
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

// Lấy doanh thu trong 7 ngày
const getRevenueLast7DaysService = async () => {
  try {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    today.setHours(23, 59, 59, 999);

    /* ========= ONLINE BOOKING ========= */
    const bookingRevenue = await Booking.findAll({
      attributes: [
        [fn("DATE", col("createdDate")), "date"],
        [fn("SUM", col("totalAmount")), "total"],
      ],
      where: {
        bookingStatus: "Paid",
        createdDate: { [Op.between]: [startDate, today] },
      },
      group: [literal("DATE(createdDate)")],
      raw: true,
    });

    /* ========= ONLINE ORDER ========= */
    const orderRevenue = await Order.findAll({
      attributes: [
        [fn("DATE", col("createdDate")), "date"],
        [fn("SUM", col("totalAmount")), "total"],
      ],
      where: {
        orderStatus: "Completed",
        createdDate: { [Op.between]: [startDate, today] },
      },
      group: [literal("DATE(createdDate)")],
      raw: true,
    });

    /* ========= OFFLINE ========= */
    const offlineRevenue = await OfflineBooking.findAll({
      attributes: [
        [fn("DATE", col("paidAt")), "date"],
        [fn("SUM", col("grandTotal")), "total"],
      ],
      where: {
        paymentStatus: "Paid",
        paidAt: { [Op.between]: [startDate, today] },
      },
      group: [literal("DATE(paidAt)")],
      raw: true,
    });

    /* ========= MERGE DATA ========= */
    const revenueMap = {};

    const merge = (data) => {
      data.forEach((item) => {
        const date = item.date;
        revenueMap[date] = (revenueMap[date] || 0) + Number(item.total || 0);
      });
    };

    merge(bookingRevenue);
    merge(orderRevenue);
    merge(offlineRevenue);

    /* ========= BUILD FULL 7 DAYS ========= */
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const key = d.toISOString().slice(0, 10);

      result.push({
        date: key,
        total: revenueMap[key] || 0,
      });
    }

    return result;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

// Đơn hàng bán lẻ hôm nay, có số lượng sản phẩm online
const getTodayRetailOrderService = async () => {
  try {
    const { start, end } = buildDayRange();

    // ===== ONLINE ORDERS =====
    const onlineOrders = await Order.count({
      where: {
        orderStatus: "Completed",
        createdDate: { [Op.between]: [start, end] },
      },
    });

    // ===== ONLINE PRODUCT ITEMS =====
    const onlineProducts = await OrderDetail.findAll({
      attributes: [[fn("SUM", col("quantity")), "totalSold"]],
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
      ],
      raw: true,
    });

    const onlineProductsQty = onlineProducts[0]?.totalSold || 0;

    // ===== OFFLINE PRODUCT ITEMS =====
    const offlineProducts = await OfflineProductItem.findAll({
      attributes: [
        [fn("SUM", col("OfflineProductItem.quantity")), "totalSold"],
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
      ],
      raw: true,
    });
    const offlineProductsQty = offlineProducts[0]?.totalSold || 0;

    // ===== OFFLINE BEVERAGE ITEMS =====
    const offlineBeverages = await OfflineBeverageItem.findAll({
      attributes: [
        [fn("SUM", col("OfflineBeverageItem.quantity")), "totalSold"],
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
      ],
      raw: true,
    });
    const offlineBeveragesQty = offlineBeverages[0]?.totalSold || 0;

    return {
      onlineOrders, // số đơn hàng online hôm nay
      onlineItems: Number(onlineProductsQty), // số sản phẩm bán online hôm nay
      offlineItems: Number(offlineProductsQty) + Number(offlineBeveragesQty),
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

// top sản phẩm bán chạy theo variant trong tuần
const getTopProductService = async () => {
  try {
    const limit = 5;
    const { start, end } = getCurrentWeekRange();

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
          attributes: ["id", "color", "size"],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "productName"],
            },
          ],
        },
      ],
      group: [
        "varient.id",
        "varient.color",
        "varient.size",
        "varient.product.id",
        "varient.product.productName",
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
          attributes: ["id", "color", "size"],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "productName"],
            },
          ],
        },
      ],
      group: [
        "productVarient.id",
        "productVarient.color",
        "productVarient.size",
        "productVarient.product.id",
        "productVarient.product.productName",
      ],
      raw: true,
    });

    /* ===================== MERGE ===================== */
    const map = new Map();

    const merge = (item, prefix) => {
      const varientId = item[`${prefix}.id`];

      if (!map.has(varientId)) {
        map.set(varientId, {
          varientId,
          productName: item[`${prefix}.product.productName`],
          color: item[`${prefix}.color`],
          size: item[`${prefix}.size`],
          totalSold: 0,
          revenue: 0,
        });
      }

      const row = map.get(varientId);
      row.totalSold += Number(item.totalSold || 0);
      row.revenue += Number(item.revenue || 0);
    };

    onlineData.forEach((i) => merge(i, "varient"));
    offlineData.forEach((i) => merge(i, "productVarient"));

    /* ===================== SORT + LIMIT ===================== */
    const data = Array.from(map.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);

    return {
      range: { start, end },
      total: data.length,
      data,
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

// top đồ uống bán chạy trong tuần
const getTopBeverageService = async () => {
  try {
    const limit = 5;
    const { start, end } = getCurrentWeekRange(); // dùng tuần hiện tại

    const data = await OfflineBeverageItem.findAll({
      attributes: [
        "beverageId",
        [fn("SUM", col("quantity")), "totalSold"],
        [fn("SUM", literal("price * quantity")), "revenue"],
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
      limit,
      raw: true,
      nest: true,
    });

    return {
      range: { start, end },
      total: data.length,
      data: data.map((i) => ({
        beverageId: i.beverage.id,
        name: i.beverage.name,
        totalSold: Number(i.totalSold),
        revenue: Number(i.revenue),
      })),
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

// cảnh báo hàng tồn kho thấp
const getLowStockWarningService = async () => {
  const threshold = 10;

  const [products, beverages] = await Promise.all([
    ProductVarient.findAll({
      where: { stock: { [Op.lte]: threshold } },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "productName"],
        },
      ],
      attributes: ["id", "color", "size", "stock"],
      raw: true,
      nest: true,
    }),

    Beverage.findAll({
      where: { stock: { [Op.lte]: threshold } },
      attributes: ["id", "name", "stock"],
      raw: true,
    }),
  ]);

  return {
    products, // [{ id, color, size, stock, product: { id, productName } }]
    beverages, // [{ id, name, stock }]
  };
};

const getTodayWorkShiftService = async () => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const workShifts = await WorkShift.findAll({
    where: { workDate: today },
    include: [
      {
        model: WorkShiftEmployee,
        as: "workShiftEmployees",
        required: false, // hiển thị ca ngay cả khi chưa có nhân viên check-in
        where: {
          checkIn: { [Op.ne]: null },
        },
        include: [
          {
            model: User,
            as: "employee",
            attributes: ["id", "username"],
            include: [
              {
                model: Profile,
                attributes: ["fullName"],
              },
            ],
          },
        ],
      },
    ],
    order: [["startTime", "ASC"]],
  });

  const result = workShifts.map((shift) => ({
    id: shift.id,
    name: shift.name,
    workDate: shift.workDate,
    startTime: shift.startTime,
    endTime: shift.endTime,
    employees: shift.workShiftEmployees.map((we) => ({
      id: we.employee.id,
      username: we.employee.username,
      fullName: we.employee.Profile?.fullName || null, // thêm fullName
      checkIn: we.checkIn,
      checkOut: we.checkOut,
      roleInShift: we.roleInShift,
    })),
  }));

  return result;
};

const dashboardService = {
  getLowStockWarningService,
  getRevenueLast7DaysService,
  getTodayBookingCountService,
  getTodayRetailOrderService,
  getTopBeverageService,
  getTopProductService,
  getTodayWorkShiftService,
};

export default dashboardService;
