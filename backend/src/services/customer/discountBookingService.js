import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { DiscountBooking } from "../../models/index.js";

const applyDiscountBookingService = async (code, bookingAmount) => {
  try {
    if (bookingAmount === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Vui lòng chọn khung giờ đặt sân trước khi áp mã giảm giá!"
      );
    }

    const discountBooking = await DiscountBooking.findOne({
      where: { code },
    });
    if (!discountBooking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Mã giảm giá không hợp lệ!");
    }

    if (!discountBooking.isActive) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Mã giảm giá không thể sử dụng!"
      );
    }

    if (discountBooking.isUsed) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Mã giảm giá đã được sử dụng!"
      );
    }
    // Chuyển sang Date để so sánh
    const start = new Date(discountBooking.startDate);
    const end = new Date(discountBooking.endDate);
    const now = new Date();

    if (end < now) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Mã giảm giá đã hết hạn!");
    }

    if (start > now) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Mã giảm giá chưa thể áp dụng!"
      );
    }

    if (bookingAmount < discountBooking.minBookingAmount) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giá trị chưa đủ để áp dụng giảm giá!"
      );
    }

    let finalPrice = bookingAmount;
    if (discountBooking.type === "PERCENT") {
      finalPrice =
        bookingAmount - (bookingAmount * discountBooking.value) / 100;
    } else if (discountBooking.type === "AMOUNT") {
      finalPrice = bookingAmount - discountBooking.value;
    }

    if (finalPrice < 0) finalPrice = 0;

    return {
      originalPrice: bookingAmount,
      finalPrice,
      discountValue: discountBooking.value,
      type: discountBooking.value,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateDiscountBookingService = async (code) => {
  try {
    const discountBooking = await DiscountBooking.findOne({
      where: { code },
    });
    if (!discountBooking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Mã giảm giá không hợp lệ!");
    }
    await discountBooking.update({ isUsed: true });
    return discountBooking;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getDiscountBookingService = async () => {
  try {
    const discountBookings = await DiscountBooking.findAll({
      where: { isUsed: false, isActive: true },
      attributes: [
        "id",
        "code",
        "type",
        "value",
        "startDate",
        "endDate",
        "minBookingAmount",
      ],
    });
    return discountBookings;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const discountBookingService = {
  applyDiscountBookingService,
  updateDiscountBookingService,
  getDiscountBookingService,
};

export default discountBookingService;
