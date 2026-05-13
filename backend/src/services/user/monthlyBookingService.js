import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";

import {
  MonthlyBooking,
  Booking,
  BookingDetail,
  Court,
  CourtPrice,
} from "../../models/index.js";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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
    totalAmount,
    note,
  } = data;

  const t = await sequelize.transaction();

  try {
    // =====================================================
    // 1. Check court tồn tại
    // =====================================================

    const court = await Court.findOne({
      where: {
        id: courtId,
        branchId,
      },
      transaction: t,
    });

    if (!court) {
      throw new BadRequestError("Sân không tồn tại");
    }

    // =====================================================
    // 2. Tạo MonthlyBooking
    // =====================================================

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
        totalAmount,
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
        totalAmount,
        bookingStatus: "CONFIRMED",
        note: `Monthly booking #${monthlyBooking.id}`,
      },
      { transaction: t },
    );

    // =====================================================
    // 4. Generate danh sách ngày hợp lệ
    // =====================================================

    const selectedDays = daysOfWeek;

    const details = [];

    let current = new Date(startDate);
    const end = new Date(endDate);

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
