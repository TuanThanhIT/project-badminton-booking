import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";

import {
  MonthlyBooking,
  Booking,
  BookingDetail,
  Court,
  CourtPrice,
  Discount,
} from "../../models/index.js";
import {
  DISCOUNT_APPLY_TYPE,
  DISCOUNT_TYPE,
} from "../../constants/discountConstant.js";
import { applyDiscountUsage } from "../shared/applyDiscountUsage.js";

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
    note,
  } = data;

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
        status: "PAID",
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
        bookingStatus: "CONFIRMED",
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

    await t.commit();

    return {
      monthlyBooking,
      booking,
      discountAmount,
      totalSessions: details.length,
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
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
  calculateMonthlyBookingService,
};
