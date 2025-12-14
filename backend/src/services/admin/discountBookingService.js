import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import DiscountBooking from "../../models/discountBooking.js";

const createDiscountBookingService = async (
  code,
  type,
  value,
  startDate,
  endDate,
  minBookingAmount
) => {
  try {
    // Kiểm tra trường bắt buộc
    if (!code || !code.trim()) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Mã giảm giá không được để trống!"
      );
    }
    if (!type) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Loại giảm giá không được để trống!"
      );
    }
    if (value === undefined || value === null) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giá trị giảm giá không được để trống!"
      );
    }
    if (!startDate) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Ngày bắt đầu không được để trống!"
      );
    }
    if (!endDate) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Ngày kết thúc không được để trống!"
      );
    }
    if (minBookingAmount === undefined || minBookingAmount === null) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giá trị tối thiểu áp dụng giảm giá không được để trống!"
      );
    }

    // Kiểm tra trùng mã
    const existingCode = await DiscountBooking.findOne({ where: { code } });
    if (existingCode) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Mã giảm giá đã tồn tại!");
    }

    // Kiểm tra loại giảm giá
    const validTypes = ["PERCENT", "AMOUNT"];
    if (!validTypes.includes(type)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Loại giảm giá không hợp lệ!"
      );
    }

    // Chuyển sang Date để so sánh
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Không cho tạo giảm giá trong quá khứ
    if (start < now.setHours(0, 0, 0, 0)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Ngày bắt đầu giảm giá phải từ hôm nay trở đi!"
      );
    }

    if (start > end) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Khoảng thời gian giảm giá không hợp lệ!"
      );
    }
    if (end < now) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Mã giảm giá đã hết hạn!");
    }

    // Kiểm tra giá trị giảm
    if (type === "PERCENT" && (value <= 0 || value > 100)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giá trị phần trăm giảm phải từ 1 đến 100!"
      );
    }
    if (type === "AMOUNT" && value <= 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giá trị giảm tiền phải lớn hơn 0!"
      );
    }

    if (minBookingAmount < 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giá trị thanh toán tối thiểu không hợp lệ!"
      );
    }

    // Tạo discount
    await DiscountBooking.create({
      code: code.trim().toUpperCase(),
      type,
      value,
      startDate: start,
      endDate: end,
      minBookingAmount,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getDiscountBookingsService = async (filters = {}, page, limit) => {
  try {
    const p = Number(page) || 1;
    const l = Number(limit) || 10;
    const where = {};

    // Filter theo type
    if (filters.type !== undefined) {
      where.type = filters.type;
    }
    if (filters.isUsed !== undefined) {
      where.isUsed = filters.isUsed === "true"; // chỉ "true" mới là true, còn "false" → false
    }

    const offset = (p - 1) * l;

    const { count, rows } = await DiscountBooking.findAndCountAll({
      where,
      order: [["createdDate", "DESC"]],
      limit: l,
      offset,
    });

    return {
      total: count,
      page: p,
      limit: l,
      discountBookings: rows,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const updateDiscountBookingService = async (discountId) => {
  try {
    const discountBooking = await DiscountBooking.findByPk(discountId);
    if (!discountBooking) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Mã giảm giá đặt sân không tồn tại!"
      );
    }
    if (discountBooking.isActive === true) {
      await discountBooking.update({
        isActive: false,
      });
    } else {
      await discountBooking.update({
        isActive: true,
      });
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const deleteDiscountBookingService = async (discountId) => {
  try {
    const discountBooking = await DiscountBooking.findByPk(discountId);
    if (!discountBooking) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Mã giảm giá đặt sân không tồn tại!"
      );
    }
    await discountBooking.destroy();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const discountBookingService = {
  createDiscountBookingService,
  getDiscountBookingsService,
  updateDiscountBookingService,
  deleteDiscountBookingService,
};

export default discountBookingService;
