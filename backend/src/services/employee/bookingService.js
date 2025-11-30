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

const getBookingsService = async (bookingStatus, keyword, date) => {
  try {
    const where = {};

    // Filter trạng thái
    if (bookingStatus) {
      where.bookingStatus = bookingStatus;
    }

    // Filter ngày
    if (date) {
      const startOfDayVN = new Date(`${date}T00:00:00`);
      const endOfDayVN = new Date(`${date}T23:59:59`);

      const startOfDayUTC = new Date(
        startOfDayVN.getTime() - 7 * 60 * 60 * 1000
      );
      const endOfDayUTC = new Date(endOfDayVN.getTime() - 7 * 60 * 60 * 1000);

      where.createdDate = {
        [Op.between]: [startOfDayUTC, endOfDayUTC],
      };
    }

    // Filter theo keyword
    const userInclude = {
      model: User,
      as: "user",
      attributes: ["username"],
      required: keyword ? true : false, // bắt buộc join khi tìm keyword
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

    const bookings = await Booking.findAll({
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
      booking: [["createdDate", "DESC"]],
    });

    return bookings;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const bookingService = {
  getBookingsService,
};

export default bookingService;
