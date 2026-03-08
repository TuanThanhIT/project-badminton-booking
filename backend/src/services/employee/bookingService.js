import { Op } from "sequelize";
import {
  Booking,
  BookingDetail,
  Court,
  CourtSchedule,
  PaymentBooking,
  Profile,
  User,
} from "../../models/index.js";
import {
  sendAdminNotification,
  sendUserNotification,
} from "../../utils/sendNotification.js";
import sequelize from "../../config/db.js";
import { handleSendBookingMail } from "../shared/sendBookingMail.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { BOOKING_STATUS } from "../../constants/bookingConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
} from "../../constants/paymentConstant.js";

const getBookingsService = async (data) => {
  const { status: bookingStatus, keyword, date, page, limit } = data;

  const where = {};
  const p = page ?? 1;
  const l = limit ?? 10;

  const offset = (p - 1) * l;

  if (bookingStatus) {
    where.bookingStatus = bookingStatus;
  }

  if (date) {
    const startVN = new Date(`${date}T00:00:00`);
    const endVN = new Date(`${date}T23:59:59`);

    where.createdDate = {
      [Op.between]: [
        new Date(startVN.getTime() - 7 * 60 * 60 * 1000),
        new Date(endVN.getTime() - 7 * 60 * 60 * 1000),
      ],
    };
  }

  const userInclude = {
    model: User,
    as: "user",
    attributes: ["username"],
    required: !!keyword,
    include: [
      {
        model: Profile,
        attributes: ["fullName", "address", "phoneNumber"],
        required: !!keyword,
        where: keyword
          ? {
              [Op.or]: [
                { fullName: { [Op.like]: `%${keyword}%` } },
                { phoneNumber: { [Op.like]: `%${keyword}%` } },
              ],
            }
          : undefined,
      },
    ],
  };

  const { rows, count } = await Booking.findAndCountAll({
    where,
    attributes: ["id", "bookingStatus", "totalAmount", "note", "createdDate"],
    include: [
      {
        model: BookingDetail,
        as: "bookingDetails",
        attributes: ["id"],
        include: [
          {
            model: CourtSchedule,
            as: "courtSchedule",
            attributes: ["id", "date", "startTime", "endTime"],
            include: [
              {
                model: Court,
                as: "court",
                attributes: ["id", "name", "thumbnailUrl"],
              },
            ],
          },
        ],
      },
      {
        model: PaymentBooking,
        as: "paymentBooking",
        attributes: ["paymentMethod"],
      },
      userInclude,
    ],
    limit,
    offset,
    order: [["createdDate", "DESC"]],
  });

  const bookings = rows.map((booking) => {
    const b = booking.toJSON();
    const first = b.bookingDetails[0];

    return {
      id: b.id,
      bookingStatus: b.bookingStatus,
      totalAmount: b.totalAmount,
      note: b.note,
      createdDate: b.createdDate,
      court: first
        ? {
            id: first.courtSchedule.court.id,
            name: first.courtSchedule.court.name,
            thumbnailUrl: first.courtSchedule.court.thumbnailUrl,
            date: first.courtSchedule.date,
          }
        : null,
      timeSlots: b.bookingDetails.map(
        (d) => `${d.courtSchedule.startTime} → ${d.courtSchedule.endTime}`,
      ),
      paymentBooking: b.paymentBooking,
      user: b.user,
    };
  });

  return { bookings, total: count, page, limit };
};

const confirmedBookingService = async (data) => {
  const { bookingId } = data;
  return sequelize.transaction(async (t) => {
    const booking = await Booking.findByPk(
      bookingId,
      {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["email"],
          },
          {
            model: BookingDetail,
            as: "bookingDetails",
            attributes: ["courtScheduleId"],
            include: [
              {
                model: CourtSchedule,
                as: "courtSchedule",
                attributes: ["date", "startTime", "endTime"],
              },
            ],
          },
        ],
      },
      { transaction: t },
    );

    if (!booking) {
      throw new NotFoundError("Lịch đặt sân không tồn tại!");
    }

    if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
      throw new BadRequestError(
        "Lịch đặt sân đã hủy không thể xác nhận lại được nữa",
      );
    }

    if (booking.bookingStatus === BOOKING_STATUS.COMPLETED) {
      throw new BadRequestError(
        "Lịch đặt sân đã hoàn thành không thể xác nhận lại được nữa",
      );
    }

    await booking.update(
      {
        bookingStatus: BOOKING_STATUS.CONFIRMED,
      },
      { transaction: t },
    );

    t.afterCommit(() => {
      sendUserNotification(
        booking.userId,
        "us-confirm-booking",
        "Lịch đặt sân đã được xác nhận",
        `Lịch đặt sân #0${bookingId} đã được xác nhận.`,
      ).catch((err) => console.error("Customer notify failed", err));
      sendAdminNotification(
        "Lịch đặt sân đã được xác nhận",
        `Lịch đặt sân #0${bookingId} đã được nhân viên xác nhận.`,
        "ADMIN",
        "adm-confirm-booking",
      ).catch((err) => console.error("Admin notify failed", err));
      handleSendBookingMail(booking, "confirm").catch((err) =>
        console.error("Customer mail failed", err),
      );
    });

    return booking;
  });
};

const completedBookingService = async (data) => {
  const { bookingId } = data;
  return sequelize.transaction(async (t) => {
    const booking = await Booking.findByPk(
      bookingId,
      {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["email"],
          },
          {
            model: BookingDetail,
            as: "bookingDetails",
            attributes: ["courtScheduleId"],
            include: [
              {
                model: CourtSchedule,
                as: "courtSchedule",
                attributes: ["date", "startTime", "endTime"],
              },
            ],
          },
        ],
      },
      { transaction: t },
    );

    if (!booking) {
      throw new NotFoundError("Lịch đặt sân không tồn tại");
    }
    if (booking.bookingStatus !== BOOKING_STATUS.CONFIRMED) {
      throw new BadRequestError("Lịch đặt sân chưa được xác nhận");
    }

    const paymentBooking = await PaymentBooking.findOne({
      where: {
        bookingId: booking.id,
        paymentMethod: PAYMENT_METHOD_STATUS.COD,
      },
      transaction: t,
    });

    await booking.update(
      {
        bookingStatus: BOOKING_STATUS.COMPLETED,
      },
      { transaction: t },
    );

    if (paymentBooking) {
      await paymentBooking.update(
        {
          paymentStatus: PAYMENT_STATUS.SUCCESS,
          paidAt: new Date(),
        },
        { transaction: t },
      );
    }

    t.afterCommit(() => {
      sendUserNotification(
        booking.userId,
        "us-complete-booking",
        "Lịch đặt sân đã hoàn thành",
        `Lịch đặt sân #0${bookingId} đã hoàn thành.`,
      ).catch((err) => console.error("Customer notify failed", err));

      sendAdminNotification(
        "Lịch đặt sân đã hoàn thành",
        `Lịch đặt sân #0${bookingId} đã được hoàn thành.`,
        "ADMIN",
        "adm-complete-booking",
      ).catch((err) => console.error("Admin notify failed", err));

      handleSendBookingMail(booking, "complete").catch((err) =>
        console.error("Customer mail failed", err),
      );
    });

    return booking;
  });
};

const cancelBookingService = async (data) => {
  const { bookingId, cancelReason } = data;
  return sequelize.transaction(async (t) => {
    const booking = await Booking.findByPk(
      bookingId,
      {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["email"],
          },
          {
            model: BookingDetail,
            as: "bookingDetails",
            include: [
              {
                model: CourtSchedule,
                as: "courtSchedule",
              },
            ],
          },
        ],
      },
      { transaction: t },
    );

    if (!booking) {
      throw new NotFoundError("Lịch đặt sân không tồn tại");
    }
    if (booking.bookingStatus === BOOKING_STATUS.COMPLETED) {
      throw new BadRequestError("Lịch đặt sân đã hoàn thành");
    }

    const paymentBooking = await PaymentBooking.findOne({
      where: { bookingId },
      transaction: t,
    });

    const oldStatus = booking.bookingStatus;

    // Xử lý thanh toán
    if (oldStatus === BOOKING_STATUS.PENDING) {
      await paymentBooking.update(
        { paymentStatus: PAYMENT_STATUS.CANCELLED },
        { transaction: t },
      );
    } else if (oldStatus === BOOKING_STATUS.PAID) {
      await paymentBooking.update(
        {
          paymentStatus: PAYMENT_STATUS.CANCELLED,
          refundAmount: paymentBooking.paymentAmount,
          refundAt: new Date(),
        },
        { transaction: t },
      );
    } else if (oldStatus === BOOKING_STATUS.CONFIRMED) {
      if (paymentBooking.paymentMethod === PAYMENT_METHOD_STATUS.COD) {
        await paymentBooking.update(
          { paymentStatus: PAYMENT_STATUS.CANCELLED },
          { transaction: t },
        );
      } else {
        await paymentBooking.update(
          {
            paymentStatus: PAYMENT_STATUS.CANCELLED,
            refundAmount: paymentBooking.paymentAmount,
            refundAt: new Date(),
          },
          { transaction: t },
        );
      }
    }

    // hủy booking
    await booking.update(
      {
        bookingStatus: BOOKING_STATUS.CANCELLED,
        cancelledBy: "Employee",
        cancelReason,
      },
      { transaction: t },
    );

    // mở lại lịch sân
    const courtScheduleIds = booking.bookingDetails.map(
      (item) => item.courtScheduleId,
    );
    await CourtSchedule.update(
      {
        isAvailable: true,
      },
      {
        where: { id: courtScheduleIds },
        transaction: t,
      },
    );

    t.afterCommit(() => {
      sendUserNotification(
        booking.userId,
        "us-cancel-booking",
        "Lịch đặt sân đã bị hủy",
        `Lịch đặt sân #0${bookingId} đã bị hủy.`,
      ).catch((err) => console.error("Customer notify failed", err));

      sendAdminNotification(
        "Lịch đặt sân đã bị hủy",
        `Lịch đặt sân #0${bookingId} đã được nhân viên hủy theo yêu cầu khách hàng.`,
        "ADMIN",
        "adm-cancel-booking",
      ).catch((err) => console.error("Admin notify failed", err));

      handleSendBookingMail(booking, "cancel").catch((err) =>
        console.error("Customer mail failed", err),
      );
    });

    return booking;
  });
};

const bookingService = {
  getBookingsService,
  confirmedBookingService,
  completedBookingService,
  cancelBookingService,
};

export default bookingService;
