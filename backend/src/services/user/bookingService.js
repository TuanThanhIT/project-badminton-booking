import { Booking, BookingDetail, Court, Branch } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import sequelize from "../../config/db.js";
const createBookingService = async (bookingData) => {
  const {
    userId,
    branchId,
    courtId,
    playDate,
    startTime,
    endTime,
    discountId,
    note,
  } = bookingData;

  // 1. Tính toán lại giá trị ở Backend (Bảo mật: Không tin tưởng giá từ Frontend gửi lên)
  // Trong thực tế, bạn sẽ gọi lại logic tính giá từ CourtPrice giống như bên CourtService

  const t = await sequelize.transaction();

  try {
    // 2. Tạo bản ghi Booking chính
    const newBooking = await Booking.create(
      {
        userId,
        branchId,
        discountId: discountId || null,
        totalAmount: bookingData.totalAmount, // Giá sau khi đã tính toán logic ở Controller/Service
        bookingStatus: "PENDING",
        note,
      },
      { transaction: t },
    );

    // 3. Tạo bản ghi chi tiết BookingDetail
    await BookingDetail.create(
      {
        bookingId: newBooking.id,
        courtId,
        playDate,
        startTime,
        endTime,
        price: bookingData.totalAmount, // Lưu giá thực tế tại thời điểm đặt
      },
      { transaction: t },
    );

    await t.commit();
    return newBooking;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getMyBookingsService = async (data) => {
  const { userId, page = 1, limit = 10 } = data;
  const offset = (page - 1) * limit;

  const { rows, count } = await Booking.findAndCountAll({
    where: { userId },
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdDate", "DESC"]],
    include: [
      {
        model: BookingDetail,
        as: "details",
        include: [{ model: Court, as: "court", attributes: ["courtName"] }],
      },
      { model: Branch, as: "branch", attributes: ["branchName", "address"] },
    ],
  });

  return {
    data: rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
    },
  };
};

export default {
  createBookingService,
  getMyBookingsService,
};
