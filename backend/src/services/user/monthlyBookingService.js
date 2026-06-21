import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { v4 as uuidv4 } from "uuid";
import { VNPay, VnpLocale } from "vnpay";
import {
  createVNPayDateRange,
  logVNPayDiagnostics,
} from "../../utils/vnpayDate.js";

import {
  MonthlyBooking,
  Booking,
  BookingDetail,
  Court,
  CourtPrice,
  Discount,
  Branch,
  Payment,
  Wallet,
  WalletTransaction,
} from "../../models/index.js";
import { Op } from "sequelize";
import {
  DISCOUNT_APPLY_TYPE,
  DISCOUNT_TYPE,
} from "../../constants/discountConstant.js";
import { applyDiscountUsage } from "../shared/applyDiscountUsage.js";
import { sendBranchStaffNotification } from "../../helpers/notification.js";
import { formatBookingCode } from "../../utils/displayCode.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
  TARGET_PAYMENT_TYPE,
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPE,
} from "../../constants/paymentConstant.js";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MIN_BOOKING_LEAD_MINUTES = 60;

const createVNPayUrl = async ({ booking, amount, ip, transaction }) => {
  const txnRef = uuidv4();

  await Payment.create(
    {
      paymentAmount: amount,
      paymentMethod: PAYMENT_METHOD_STATUS.VNPAY,
      paymentStatus: PAYMENT_STATUS.PENDING,
      targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
      targetPaymentId: booking.id,
      externalId: txnRef,
    },
    { transaction },
  );

  const vnpay = new VNPay({
    tmnCode: process.env.VNP_TMN_CODE,
    secureSecret: process.env.VNP_HASH_SECRET,
    vnpayHost: process.env.VNP_URL,
    testMode: true,
    hashAlgorithm: "SHA512",
  });

  const { createDate, expireDate } = createVNPayDateRange();

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: ip,
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `booking_${booking.id}`,
    vnp_OrderType: "booking",
    vnp_ReturnUrl: process.env.VNP_RETURN_URL,
    vnp_Locale: VnpLocale.VN,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  });

  logVNPayDiagnostics({
    context: "monthly-booking",
    createDate,
    expireDate,
    paymentUrl,
  });

  return paymentUrl;
};

const timeToNumber = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
};

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dateTimeFromDateAndTime = (date, time) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

const normalizeDateInput = (value) => {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return String(value).split("T")[0];
};

const assertBookableStartTime = ({ startDate, startTime }) => {
  const date = normalizeDateInput(startDate);
  const today = getTodayDate();

  if (date < today) {
    throw new BadRequestError("Khong the dat san cho ngay trong qua khu");
  }

  const now = new Date();
  const earliest = new Date(
    now.getTime() + MIN_BOOKING_LEAD_MINUTES * 60 * 1000,
  );

  if (date === today && dateTimeFromDateAndTime(date, startTime) < earliest) {
    throw new BadRequestError(
      "Gio bat dau phai sau thoi diem hien tai it nhat 1 tieng",
    );
  }
};

const calculateMonthlyAmount = async ({
  branchId,
  startDate,
  endDate,
  daysOfWeek,
  startTime,
  endTime,
  transaction,
}) => {
  assertBookableStartTime({ startDate, startTime });

  const start = timeToNumber(startTime);
  const end = timeToNumber(endTime);
  const duration = end - start;

  if (duration <= 0) {
    throw new BadRequestError("Gio ket thuc phai sau gio bat dau");
  }

  let totalSessions = 0;
  let totalAmount = 0;
  const details = [];
  const current = new Date(startDate);
  const last = new Date(endDate);

  while (current <= last) {
    const dayName = DAYS[current.getDay()];

    if (daysOfWeek.includes(dayName)) {
      const configs = await CourtPrice.findAll({
        where: {
          branchId,
          dayOfWeek: dayName.toUpperCase(),
        },
        transaction,
      });

      let sessionPrice = 0;

      configs.forEach((config) => {
        const overlapStart = Math.max(start, timeToNumber(config.startTime));
        const overlapEnd = Math.min(end, timeToNumber(config.endTime));

        if (overlapEnd > overlapStart) {
          sessionPrice += (overlapEnd - overlapStart) * Number(config.price);
        }
      });

      totalSessions += 1;
      totalAmount += sessionPrice;
      details.push({
        playDate: current.toISOString().split("T")[0],
        price: Math.round(sessionPrice),
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return {
    totalSessions,
    duration,
    totalAmount: Math.round(totalAmount),
    details,
  };
};

const calculateBookingDiscount = async ({
  discountId,
  bookingAmount,
  transaction,
}) => {
  if (!discountId) {
    return { discountAmount: 0, finalAmount: bookingAmount };
  }

  const discount = await Discount.findByPk(discountId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!discount) throw new BadRequestError("Ma giam gia khong ton tai");
  if (!discount.isActive) throw new BadRequestError("Ma giam gia da bi vo hieu hoa");

  const today = new Date().toISOString().split("T")[0];
  if (discount.startDate > today) {
    throw new BadRequestError("Ma giam gia chua bat dau");
  }
  if (discount.endDate < today) {
    throw new BadRequestError("Ma giam gia da het han");
  }

  if (
    discount.applyType !== DISCOUNT_APPLY_TYPE.BOOKING &&
    discount.applyType !== DISCOUNT_APPLY_TYPE.ALL
  ) {
    throw new BadRequestError("Ma khong ap dung cho dat san");
  }

  if (bookingAmount < Number(discount.minAmount || 0)) {
    throw new BadRequestError(
      `Don hang toi thieu ${Number(discount.minAmount).toLocaleString()}d de ap dung ma nay`,
    );
  }

  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    throw new BadRequestError("Ma giam gia da het luot su dung");
  }

  let discountAmount =
    discount.type === DISCOUNT_TYPE.PERCENT
      ? (bookingAmount * Number(discount.value)) / 100
      : Number(discount.value);

  if (discount.type === DISCOUNT_TYPE.PERCENT && discount.maxDiscount) {
    discountAmount = Math.min(discountAmount, Number(discount.maxDiscount));
  }

  discountAmount = Math.min(Math.round(discountAmount), bookingAmount);

  return {
    discountAmount,
    finalAmount: Math.max(0, bookingAmount - discountAmount),
  };
};

const createMonthlyBookingService = async (data) => {
  const {
    userId,
    branchId,
    courtId,
    startDate,
    endDate,
    daysOfWeek,
    startTime,
    endTime,
    discountId,
    paymentMethod,
    note,
    ip,
  } = data;

  if (
    ![PAYMENT_METHOD_STATUS.VNPAY, PAYMENT_METHOD_STATUS.WALLET].includes(
      paymentMethod,
    )
  ) {
    throw new BadRequestError("Lịch tháng chỉ hỗ trợ thanh toán VNPay hoặc ví");
  }

  const t = await sequelize.transaction();

  try {
    const monthlyPrice = await calculateMonthlyAmount({
      branchId,
      startDate,
      endDate,
      daysOfWeek,
      startTime,
      endTime,
      transaction: t,
    });

    // =====================================================
    // 1. Check court tồn tại
    // =====================================================

    const court = await Court.findOne({
      where: {
        id: courtId,
        branchId,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!court) {
      throw new BadRequestError("Sân không tồn tại");
    }

    // =====================================================
    // 2. Tạo MonthlyBooking
    // =====================================================

    const branch = await Branch.findByPk(branchId, {
      attributes: ["id", "branchName"],
      transaction: t,
    });

    const { discountAmount, finalAmount } = await calculateBookingDiscount({
      discountId,
      bookingAmount: monthlyPrice.totalAmount,
      transaction: t,
    });

    const monthlyBooking = await MonthlyBooking.create(
      {
        userId,
        branchId,
        courtId,
        startDate,
        endDate,
        daysOfWeek,
        startTime,
        endTime,
        totalAmount: finalAmount,
        status: "PENDING",
        note,
      },
      { transaction: t },
    );

    // =====================================================
    // 3. Tạo Booking cha
    // =====================================================

    const booking = await Booking.create(
      {
        userId,
        branchId,
        discountId: discountId || null,
        totalAmount: finalAmount,
        bookingStatus: "PENDING",
        note: `Monthly booking #${monthlyBooking.id}`,
      },
      { transaction: t },
    );

    if (discountId) {
      await applyDiscountUsage(discountId, t);
    }

    // =====================================================
    // 4. Generate danh sách ngày hợp lệ
    // =====================================================

    const details = monthlyPrice.details.map((item) => ({
      bookingId: booking.id,
      monthlyBookingId: monthlyBooking.id,
      courtId,
      playDate: item.playDate,
      startTime,
      endTime,
      price: item.price,
    }));

    /*
    while (current <= end) {
      const currentDay = DAYS[current.getDay()];

      // Nếu đúng thứ được chọn
      if (selectedDays.includes(currentDay)) {
        const playDate = current.toISOString().split("T")[0];

        details.push({
          bookingId: booking.id,
          monthlyBookingId: monthlyBooking.id,
          courtId,
          playDate,
          startTime,
          endTime,
          price: 0, // có thể tính riêng sau
        });
      }

      current.setDate(current.getDate() + 1);
    }
    */

    // =====================================================
    // 5. Check overlap
    // =====================================================

    for (const item of details) {
      const overlap = await BookingDetail.findOne({
        where: {
          courtId: item.courtId,
          playDate: item.playDate,
          [Op.and]: [
            { startTime: { [Op.lt]: item.endTime } },
            { endTime: { [Op.gt]: item.startTime } },
          ],
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (overlap) {
        throw new BadRequestError(`Sân đã bị đặt ngày ${item.playDate}`);
      }
    }

    // =====================================================
    // 6. Bulk insert BookingDetail
    // =====================================================

    await BookingDetail.bulkCreate(details, {
      transaction: t,
    });

    await sendBranchStaffNotification(
      branchId,
      "monthly-booking-created",
      "Có lịch đặt sân tháng mới",
      `${branch?.branchName || "Chi nhánh"}: lịch tháng ${formatBookingCode(booking.id, booking.createdAt)} từ ${startDate} đến ${endDate} đang chờ theo dõi.`,
      { transaction: t },
    );

    let paymentUrl;

    if (paymentMethod === PAYMENT_METHOD_STATUS.VNPAY) {
      paymentUrl = await createVNPayUrl({
        booking,
        amount: finalAmount,
        ip,
        transaction: t,
      });
    }

    if (paymentMethod === PAYMENT_METHOD_STATUS.WALLET) {
      const wallet = await Wallet.findOne({
        where: { userId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!wallet) throw new BadRequestError("Ví không tồn tại");

      const pendingAmount = await WalletTransaction.sum("amount", {
        where: {
          walletId: wallet.id,
          status: WALLET_TRANSACTION_STATUS.PENDING,
        },
        transaction: t,
      });

      const available = Number(wallet.balance) - Number(pendingAmount || 0);

      if (available < finalAmount) {
        throw new BadRequestError("Số dư ví không đủ");
      }

      const payment = await Payment.create(
        {
          targetPaymentType: TARGET_PAYMENT_TYPE.BOOKING,
          targetPaymentId: booking.id,
          paymentAmount: finalAmount,
          paymentMethod: PAYMENT_METHOD_STATUS.WALLET,
          paymentStatus: PAYMENT_STATUS.PENDING,
        },
        { transaction: t },
      );

      await WalletTransaction.create(
        {
          walletId: wallet.id,
          paymentId: payment.id,
          amount: finalAmount,
          type: WALLET_TRANSACTION_TYPE.PAYMENT,
          status: WALLET_TRANSACTION_STATUS.PENDING,
          expiredAt: new Date(Date.now() + 10 * 60 * 1000),
          description: `Thanh toán lịch tháng ${formatBookingCode(booking.id, booking.createdAt)}`,
        },
        { transaction: t },
      );
    }

    await t.commit();

    return {
      monthlyBooking,
      booking,
      discountAmount,
      paymentMethod,
      paymentUrl,
      totalSessions: details.length,
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getMonthlyAvailableCourtsService = async (data) => {
  const { branchId, startDate, endDate, daysOfWeek, startTime, endTime } = data;

  const monthlyPrice = await calculateMonthlyAmount({
    branchId,
    startDate,
    endDate,
    daysOfWeek,
    startTime,
    endTime,
  });

  const playDates = monthlyPrice.details.map((item) => item.playDate);

  const bookedDetails =
    playDates.length > 0
      ? await BookingDetail.findAll({
          where: {
            playDate: { [Op.in]: playDates },
            [Op.and]: [
              { startTime: { [Op.lt]: endTime } },
              { endTime: { [Op.gt]: startTime } },
            ],
          },
          attributes: ["courtId", "playDate", "monthlyBookingId"],
        })
      : [];

  const conflictsByCourt = bookedDetails.reduce((acc, item) => {
    if (!acc[item.courtId]) {
      acc[item.courtId] = {
        dates: new Set(),
        conflictType: "daily",
      };
    }

    acc[item.courtId].dates.add(item.playDate);

    if (item.monthlyBookingId) {
      acc[item.courtId].conflictType = "monthly";
    }

    return acc;
  }, {});

  const allCourts = await Court.findAll({
    where: {
      branchId,
      courtStatus: "ACTIVE",
    },
    attributes: ["id", "courtName", "location", "thumbnailUrl"],
  });

  return allCourts.map((court) => {
    const conflict = conflictsByCourt[court.id];
    const unavailableDates = Array.from(conflict?.dates || []);

    return {
      id: court.id,
      courtName: court.courtName,
      location: court.location,
      thumbnailUrl: court.thumbnailUrl,
      totalPrice: monthlyPrice.totalAmount,
      duration: monthlyPrice.duration.toFixed(1),
      totalSessions: monthlyPrice.totalSessions,
      unavailableDates,
      conflictType: conflict?.conflictType || null,
      status: unavailableDates.length > 0 ? "booked" : "ACTIVE",
    };
  });
};

const calculateMonthlyBookingService = async (data) => {
  const { branchId, startDate, endDate, daysOfWeek, startTime, endTime } = data;

  const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const timeToNumber = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h + m / 60;
  };

  const start = timeToNumber(startTime);
  const end = timeToNumber(endTime);

  const duration = end - start;

  let totalSessions = 0;
  let totalAmount = 0;

  let current = new Date(startDate);
  const last = new Date(endDate);

  while (current <= last) {
    const dayName = DAYS[current.getDay()];

    if (daysOfWeek.includes(dayName)) {
      totalSessions++;

      const configs = await CourtPrice.findAll({
        where: {
          branchId,
          dayOfWeek: dayName.toUpperCase(),
        },
      });

      let sessionPrice = 0;

      configs.forEach((config) => {
        const cStart = timeToNumber(config.startTime);
        const cEnd = timeToNumber(config.endTime);

        const overlapStart = Math.max(start, cStart);
        const overlapEnd = Math.min(end, cEnd);

        if (overlapEnd > overlapStart) {
          sessionPrice += (overlapEnd - overlapStart) * config.price;
        }
      });

      totalAmount += sessionPrice;
    }

    current.setDate(current.getDate() + 1);
  }

  return {
    totalSessions,
    duration,
    totalAmount: Math.round(totalAmount),
    averagePricePerSession:
      totalSessions > 0 ? Math.round(totalAmount / totalSessions) : 0,
  };
};

export default {
  createMonthlyBookingService,
  getMonthlyAvailableCourtsService,
  calculateMonthlyBookingService,
};
