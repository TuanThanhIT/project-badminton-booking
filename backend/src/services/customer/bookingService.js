import {
  Booking,
  BookingDetail,
  BookingFeedback,
  Court,
  CourtSchedule,
  DiscountBooking,
  PaymentBooking,
  User,
} from "../../models/index.js";
import {
  sendAdminNotification,
  sendEmployeesNotification,
} from "../../utils/sendNotification.js";
import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { BOOKING_STATUS } from "../../constants/bookingConstant.js";
import { PAYMENT_STATUS } from "../../constants/paymentConstant.js";

const createBookingService = async (data) => {
  const {
    bookingStatus,
    totalAmount,
    userId,
    code,
    note,
    bookingDetails,
    paymentAmount,
    paymentMethod,
    paymentStatus,
  } = data;

  return sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      throw new NotFoundError("Người dùng không tồn tại");
    }

    let booking;

    if (code) {
      const discountBooking = await DiscountBooking.findOne({
        where: { code },
        transaction: t,
      });

      if (!discountBooking) {
        throw new NotFoundError("Mã giảm giá không chính xác");
      }

      booking = await Booking.create(
        {
          bookingStatus,
          totalAmount,
          userId,
          discountId: discountBooking.id,
          note,
        },
        { transaction: t },
      );
    } else {
      booking = await Booking.create(
        { bookingStatus, totalAmount, userId, note },
        { transaction: t },
      );
    }

    const detailsWithBookingId = bookingDetails.map((detail) => ({
      ...detail,
      bookingId: booking.id,
    }));

    await BookingDetail.bulkCreate(detailsWithBookingId, { transaction: t });

    const ids = bookingDetails.map((detail) => detail.courtScheduleId);

    const schedules = await CourtSchedule.findAll({
      where: {
        id: ids,
        isAvailable: true,
      },
      transaction: t,
    });

    if (schedules.length !== ids.length) {
      throw new BadRequestError("Một hoặc nhiều khung giờ đã được đặt");
    }

    await CourtSchedule.update(
      { isAvailable: false },
      { where: { id: ids }, transaction: t },
    );

    await PaymentBooking.create(
      {
        paymentAmount,
        paymentMethod,
        paymentStatus,
        bookingId: booking.id,
      },
      { transaction: t },
    );

    // Gửi thông báo KHÔNG nằm trong transaction
    t.afterCommit(() => {
      sendEmployeesNotification(
        "Có đặt sân mới",
        `Khách hàng vừa đặt sân #0${booking.id}. Vui lòng kiểm tra và xác nhận lịch đặt.`,
        "EMPLOYEE",
        "epl-create-booking",
      ).catch((err) => console.error("Employee notify failed", err));
      sendAdminNotification(
        "Có đặt sân mới",
        `Khách hàng vừa đặt sân #0${booking.id}.`,
        "ADMIN",
        "adm-create-booking",
      ).catch((err) => console.error("Admin notify failed", err));
    });

    return booking.id;
  });
};

const getBookingsService = async (data) => {
  const { userId } = data;
  const bookings = await Booking.findAll({
    where: { userId },
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
    ],
    order: [["createdDate", "DESC"]],
  });

  const newBookings = await Promise.all(
    bookings.map(async (booking) => {
      const bookingData = booking.toJSON();

      const firstDetail = bookingData.bookingDetails[0];
      const courtInfo = firstDetail
        ? {
            id: firstDetail.courtSchedule.court.id,
            name: firstDetail.courtSchedule.court.name,
            thumbnailUrl: firstDetail.courtSchedule.court.thumbnailUrl,
            date: firstDetail.courtSchedule.date,
          }
        : null;

      const timeSlots = bookingData.bookingDetails.map(
        (d) => `${d.courtSchedule.startTime} → ${d.courtSchedule.endTime}`,
      );

      let reviewField; // undefined by default
      if (bookingData.bookingStatus === BOOKING_STATUS.COMPLETED) {
        const checkReview = await BookingFeedback.findOne({
          where: { bookingId: bookingData.id },
        });
        if (checkReview) reviewField = true;
        else reviewField = false;
      }

      // Tạo object trả về, chỉ thêm review nếu khác undefined
      const result = {
        id: bookingData.id,
        bookingStatus: bookingData.bookingStatus,
        totalAmount: bookingData.totalAmount,
        note: bookingData.note,
        createdDate: bookingData.createdDate,
        court: courtInfo,
        timeSlots,
        paymentBooking: bookingData.paymentBooking,
      };
      if (reviewField !== undefined) {
        result.review = reviewField;
      }

      return result;
    }),
  );

  return newBookings;
};

const cancelBookingService = async (data) => {
  const { bookingId, cancelReason } = data;
  return sequelize.transaction(async (t) => {
    const booking = await Booking.findByPk(bookingId, { transaction: t });
    if (!booking) {
      throw new NotFoundError("Lịch đặt sân không tồn tại");
    }

    if (booking.bookingStatus === BOOKING_STATUS.PAID) {
      throw new BadRequestError(
        "Sân đã thanh toán không thể hủy trực tiếp. Vui lòng liên hệ cửa hàng để hỗ trợ",
      );
    }

    if (booking.bookingStatus === BOOKING_STATUS.CONFIRMED) {
      throw new BadRequestError(
        "Sân đã xác nhận không thể hủy trực tiếp. Vui lòng liên hệ cửa hàng để hỗ trợ",
      );
    }

    await booking.update(
      {
        bookingStatus: BOOKING_STATUS.CANCELLED,
        cancelledBy: "User",
        cancelReason,
      },
      { transaction: t },
    );

    const ids = await BookingDetail.findAll({
      where: { bookingId },
      attributes: ["courtScheduleId"],
      transaction: t,
    });

    const courtScheduleIds = ids.map((item) => item.courtScheduleId);

    await CourtSchedule.update(
      { isAvailable: true },
      { where: { id: courtScheduleIds }, transaction: t },
    );

    const paymentBooking = await PaymentBooking.findOne({
      where: { bookingId },
      transaction: t,
    });

    if (paymentBooking) {
      await paymentBooking.update(
        { paymentStatus: PAYMENT_STATUS.CANCELLED },
        { transaction: t },
      );
    }

    t.afterCommit(() => {
      sendEmployeesNotification(
        "Lịch đặt sân đã bị hủy",
        `Khách hàng vừa hủy lịch đặt sân #0${bookingId}`,
        "EMPLOYEE",
        "epl-cancel-booking",
      ).catch((err) => {
        console.error("Employee notify failed", err);
      });
      sendAdminNotification(
        "Lịch đặt sân đã bị hủy",
        `Khách hàng vừa hủy lịch đặt sân #0${bookingId}.`,
        "ADMIN",
        "adm-cancel-booking",
      ).catch((err) => {
        console.error("Admin notify failed", err);
      });
    });
  });
};

const bookingService = {
  createBookingService,
  getBookingsService,
  cancelBookingService,
};
export default bookingService;
