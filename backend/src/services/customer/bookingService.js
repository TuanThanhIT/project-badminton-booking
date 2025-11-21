import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
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
import e from "express";

const createBookingService = async (
  bookingStatus,
  totalAmount,
  userId,
  code,
  note,
  bookingDetails,
  paymentAmount,
  paymentMethod,
  paymentStatus
) => {
  try {
    const status = ["Pending", "Paid", "Completed", "Cancelled"];
    const checkStatus = status.includes(bookingStatus);
    if (!checkStatus) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Trạng thái đặt sân không hợp lệ!"
      );
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại!");
    }

    let booking;

    if (code) {
      const discountBooking = await DiscountBooking.findOne({
        where: { code },
      });
      if (!discountBooking) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          "Mã giảm giá không chính xác!"
        );
      }
      booking = await Booking.create({
        bookingStatus,
        totalAmount,
        userId,
        discountId: discountBooking.id,
        note,
      });
    } else {
      booking = await Booking.create({
        bookingStatus,
        totalAmount,
        userId,
        note,
      });
    }

    // Gắn thêm orderId vào từng phần tử
    const detailsWithBookingId = bookingDetails.map((detail) => ({
      ...detail,
      bookingId: booking.id,
    }));

    await BookingDetail.bulkCreate(detailsWithBookingId);

    const methods = ["COD", "MOMO"];
    if (!methods.includes(paymentMethod)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Phương thức thanh toán không hợp lệ!"
      );
    }
    const pStatus = ["Pending", "Success", "Cancelled"];
    if (!pStatus.includes(paymentStatus)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Trạng thái thanh toán không hợp lệ!"
      );
    }

    await PaymentBooking.create({
      paymentAmount,
      paymentMethod,
      paymentStatus,
      bookingId: booking.id,
    });

    return booking.id;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getBookingsService = async (userId) => {
  try {
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
          (d) => `${d.courtSchedule.startTime} → ${d.courtSchedule.endTime}`
        );

        let reviewField; // undefined by default
        if (bookingData.bookingStatus === "Completed") {
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
      })
    );

    return newBookings;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const cancelBookingService = async (bookingId, cancelReason) => {
  try {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lịch đặt sân không tồn tại!");
    }
    if (booking.bookingStatus === "Paid") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Sân đã thanh toán không thể hủy trực tiếp. Vui lòng liên hệ cửa hàng để hỗ trợ!"
      );
    } else if (booking.bookingStatus === "Confirmed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Sân đã xác nhận không thể hủy trực tiếp. Vui lòng liên hệ cửa hàng để hỗ trợ!"
      );
    }

    await booking.update({
      bookingStatus: "Cancelled",
      cancelledBy: "User",
      cancelReason,
    });

    const paymentBooking = await PaymentBooking.findOne({
      where: { bookingId },
    });
    await paymentBooking.update({ paymentStatus: "Cancelled" });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const bookingService = {
  createBookingService,
  getBookingsService,
  cancelBookingService,
};
export default bookingService;
