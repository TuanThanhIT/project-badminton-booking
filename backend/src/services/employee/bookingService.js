import { StatusCodes } from "http-status-codes";
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
import ApiError from "../../utils/ApiError.js";
import {
  sendAdminNotification,
  sendUserNotification,
} from "../../utils/sendNotification.js";
import mailer from "../../utils/mailer.js";
import sequelize from "../../config/db.js";

// Gửi mail đặt sân về cho khách
const handleSendBookingMail = (booking, type) => {
  const email = booking?.user?.email;
  const date = booking.bookingDetails[0].courtSchedule.date;
  const time = booking.bookingDetails
    .map(
      (d) =>
        `${d.courtSchedule.startTime.substring(
          0,
          5
        )} - ${d.courtSchedule.endTime.substring(0, 5)}`
    )
    .join(", ");

  return mailer.sendBookingMail(email, time, date, type);
};

const getBookingsService = async (
  bookingStatus,
  keyword,
  date,
  page = 1,
  limit = 10
) => {
  try {
    const where = {};

    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;

    const offset = (p - 1) * l;

    // Filter trạng thái
    if (bookingStatus) where.bookingStatus = bookingStatus;

    // Filter ngày
    if (date) {
      const startOfDayVN = new Date(`${date}T00:00:00`);
      const endOfDayVN = new Date(`${date}T23:59:59`);

      const startOfDayUTC = new Date(
        startOfDayVN.getTime() - 7 * 60 * 60 * 1000
      );
      const endOfDayUTC = new Date(endOfDayVN.getTime() - 7 * 60 * 60 * 1000);

      where.createdDate = { [Op.between]: [startOfDayUTC, endOfDayUTC] };
    }

    const userInclude = {
      model: User,
      as: "user",
      attributes: ["username"],
      required: keyword ? true : false,
      include: [
        {
          model: Profile,
          attributes: ["fullName", "address", "phoneNumber"],
          required: keyword ? true : false,
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
      limit: l,
      offset,
      order: [["createdDate", "DESC"]],
    });

    const formatted = rows.map((booking) => {
      const b = booking.toJSON();

      const firstDetail = b.bookingDetails[0];

      const courtInfo = firstDetail
        ? {
            id: firstDetail.courtSchedule.court.id,
            name: firstDetail.courtSchedule.court.name,
            thumbnailUrl: firstDetail.courtSchedule.court.thumbnailUrl,
            date: firstDetail.courtSchedule.date,
          }
        : null;

      const timeSlots = b.bookingDetails.map(
        (d) => `${d.courtSchedule.startTime} → ${d.courtSchedule.endTime}`
      );

      return {
        id: b.id,
        bookingStatus: b.bookingStatus,
        totalAmount: b.totalAmount,
        note: b.note,
        createdDate: b.createdDate,
        court: courtInfo,
        timeSlots,
        paymentBooking: b.paymentBooking,
        user: b.user,
      };
    });

    return {
      bookings: formatted,
      total: count,
      page: p,
      limit: l,
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const confirmedBookingService = async (bookingId) => {
  try {
    const booking = await Booking.findByPk(bookingId, {
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
    });
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lịch đặt sân không tồn tại!");
    }
    if (booking.bookingStatus === "Cancelled") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Lịch đặt sân đã hủy không thể xác nhận lại được nữa!"
      );
    } else if (booking.bookingStatus === "Completed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Lịch đặt sân đã hoàn thành không thể xác nhận lại được nữa!"
      );
    }

    await booking.update({
      bookingStatus: "Confirmed",
    });

    await sendUserNotification(
      booking.userId,
      "us-confirm-booking",
      "Lịch đặt sân đã được xác nhận",
      `Lịch đặt sân #0${bookingId} đã được xác nhận.`
    );

    await sendAdminNotification(
      "Lịch đặt sân đã được xác nhận",
      `Lịch đặt sân #0${bookingId} đã được nhân viên xác nhận.`,
      "ADMIN",
      "adm-confirm-booking"
    );

    await handleSendBookingMail(booking, "confirm");
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const completedBookingService = async (bookingId) => {
  const transaction = await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(bookingId, {
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
      transaction,
    });

    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lịch đặt sân không tồn tại!");
    }
    if (booking.bookingStatus !== "Confirmed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Lịch đặt sân chưa được xác nhận!"
      );
    }

    const paymentBooking = await PaymentBooking.findOne({
      where: { bookingId: booking.id, paymentMethod: "COD" },
      transaction,
    });

    await booking.update(
      {
        bookingStatus: "Completed",
      },
      { transaction }
    );

    if (paymentBooking) {
      await paymentBooking.update(
        {
          paymentStatus: "Success",
          paidAt: new Date(),
        },
        { transaction }
      );
    }

    await transaction.commit();

    await sendUserNotification(
      booking.userId,
      "us-complete-booking",
      "Lịch đặt sân đã hoàn thành",
      `Lịch đặt sân #0${bookingId} đã hoàn thành.`
    );

    await sendAdminNotification(
      "Lịch đặt sân đã hoàn thành",
      `Lịch đặt sân #0${bookingId} đã được hoàn thành.`,
      "ADMIN",
      "adm-complete-booking"
    );

    await handleSendBookingMail(booking, "complete");
  } catch (error) {
    await transaction.rollback();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const cancelBookingService = async (bookingId, cancelReason) => {
  const transaction = await sequelize.transaction();
  try {
    const booking = await Booking.findByPk(bookingId, {
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
      transaction,
    });

    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lịch đặt sân không tồn tại!");
    }
    if (booking.bookingStatus === "Completed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Lịch đặt sân đã hoàn thành!"
      );
    }

    const paymentBooking = await PaymentBooking.findOne({
      where: { bookingId },
      transaction,
    });

    const oldStatus = booking.bookingStatus;

    // Xử lý thanh toán
    if (oldStatus === "Pending") {
      await paymentBooking.update(
        { paymentStatus: "Cancelled" },
        { transaction }
      );
    } else if (oldStatus === "Paid") {
      await paymentBooking.update(
        {
          paymentStatus: "Cancelled",
          refundAmount: paymentBooking.paymentAmount,
          refundAt: new Date(),
        },
        { transaction }
      );
    } else if (oldStatus === "Confirmed") {
      if (paymentBooking.paymentMethod === "COD") {
        await paymentBooking.update(
          { paymentStatus: "Cancelled" },
          { transaction }
        );
      } else {
        await paymentBooking.update(
          {
            paymentStatus: "Cancelled",
            refundAmount: paymentBooking.paymentAmount,
            refundAt: new Date(),
          },
          { transaction }
        );
      }
    }

    // hủy booking
    await booking.update(
      {
        bookingStatus: "Cancelled",
        cancelledBy: "Employee",
        cancelReason,
      },
      { transaction }
    );

    // mở lại lịch sân
    const courtScheduleIds = booking.bookingDetails.map(
      (item) => item.courtScheduleId
    );

    await CourtSchedule.update(
      {
        isAvailable: true,
      },
      {
        where: { id: courtScheduleIds },
        transaction,
      }
    );

    await transaction.commit();

    await sendUserNotification(
      booking.userId,
      "us-cancel-booking",
      "Lịch đặt sân đã bị hủy",
      `Lịch đặt sân #0${bookingId} đã bị hủy.`
    );

    await sendAdminNotification(
      "Lịch đặt sân đã bị hủy",
      `Lịch đặt sân #0${bookingId} đã được nhân viên hủy theo yêu cầu khách hàng.`,
      "ADMIN",
      "adm-cancel-booking"
    );

    await handleSendBookingMail(booking, "cancel");
  } catch (error) {
    await transaction.rollback();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const bookingService = {
  getBookingsService,
  confirmedBookingService,
  completedBookingService,
  cancelBookingService,
};

export default bookingService;
