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
import { sendUserNotification } from "../../utils/sendNotification.js";

const getBookingsService = async (
  bookingStatus,
  keyword,
  date,
  page = 1,
  limit = 10
) => {
  try {
    const where = {};

    const p = page && page !== "null" ? parseInt(page) : 1;
    const l = limit && limit !== "null" ? parseInt(limit) : 10;

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

    // include user + profile
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

    // Query bookings
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

    // Format lại dữ liệu trả về
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
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lịch đặt sân không tồn tại!");
    }
    if (booking.bookingStatus === "Cancelled") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Lịch đặt sân đã hủy không thể xác nhận lại được nữa! Vui lòng đặt sân lại!"
      );
    } else if (booking.bookingStatus === "Completed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Lịch đặt sân đã hoàn thành không thể xác nhận lại được nữa! Vui lòng đặt sân lại!"
      );
    }

    await booking.update({
      bookingStatus: "Confirmed",
    });

    await sendUserNotification(
      booking.userId,
      "epl-confirm-booking",
      "Lịch đặt sân đã được xác nhận",
      `Lịch đặt sân #0${bookingId} đã được xác nhận. Hẹn gặp bạn tại sân!`
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const completedBookingService = async (bookingId) => {
  try {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lịch đặt sân không tồn tại!");
    }
    if (booking.bookingStatus !== "Confirmed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Lịch đặt sân không thể hoàn thành nếu lịch đặt sân chưa được xác nhận! Vui lòng kiểm tra lại!"
      );
    }
    const paymentBooking = await PaymentBooking.findOne({
      where: { bookingId: booking.id, paymentMethod: "COD" },
    });

    await booking.update({
      bookingStatus: "Completed",
    });

    if (paymentBooking) {
      await paymentBooking.update({
        paymentStatus: "Success",
        paidAt: new Date(),
      });
    }

    await sendUserNotification(
      booking.userId,
      "epl-complete-booking",
      "Lịch đặt sân đã hoàn thành",
      `Lịch đặt sân #0${bookingId} đã hoàn thành. Rất vui được phục vụ bạn tại B-Hub!`
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const cancelBookingService = async (bookingId, cancelReason) => {
  try {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lịch đặt sân không tồn tại!");
    }
    if (booking.bookingStatus === "Completed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Lịch đặt sân đã hoàn thành không thể hủy!"
      );
    }

    const paymentBooking = await PaymentBooking.findOne({
      where: { bookingId },
    });

    const oldStatus = booking.bookingStatus;

    // xử lý paymentBooking trước
    if (oldStatus === "Pending") {
      await paymentBooking.update({ paymentStatus: "Cancelled" });
    } else if (oldStatus === "Paid") {
      await paymentBooking.update({
        paymentStatus: "Cancelled",
        refundAmount: paymentBooking.paymentAmount,
        refundAt: new Date(),
      });
    } else if (oldStatus === "Confirmed") {
      if (paymentBooking.paymentMethod === "COD") {
        await paymentBooking.update({ paymentStatus: "Cancelled" });
      } else {
        await paymentBooking.update({
          paymentStatus: "Cancelled",
          refundAmount: paymentBooking.paymentAmount,
          refundAt: new Date(),
        });
      }
    }

    // rồi mới update trạng thái booking
    await booking.update({
      bookingStatus: "Cancelled",
      cancelledBy: "Employee",
      cancelReason,
    });

    // update lại mở lại các khung giờ đã hủy
    const ids = await BookingDetail.findAll({
      where: { bookingId },
      attributes: ["courtScheduleId"],
    });

    const courtScheduleIds = ids.map((item) => item.courtScheduleId);

    await CourtSchedule.update(
      { isAvailable: true },
      { where: { id: courtScheduleIds } }
    );

    await sendUserNotification(
      booking.userId,
      "epl-cancel-booking",
      "Lịch đặt sân đã bị hủy",
      `Lịch đặt sân #0${bookingId} đã được cửa hàng hủy theo yêu cầu của khách hàng.`
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
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
