import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Discount } from "../../models/index.js";

const createDiscountService = async (
  code,
  type,
  value,
  startDate,
  endDate,
  minOrderAmount
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
    if (minOrderAmount === undefined || minOrderAmount === null) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giá trị tối thiểu áp dụng giảm giá không được để trống!"
      );
    }
    // Kiểm tra trùng mã
    const existingCode = await Discount.findOne({ where: { code } });
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

    if (minOrderAmount < 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giá trị đơn hàng tối thiểu không hợp lệ!"
      );
    }

    await Discount.create({
      code: code.trim().toUpperCase(),
      type,
      value,
      startDate: start,
      endDate: end,
      minOrderAmount,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};
const getDiscountsService = async (filters = {}, page, limit) => {
  try {
    const p = Number(page) || 1;
    const l = Number(limit) || 10;
    const where = {};

    console.log("filter>>", filters);

    // Filter theo type
    if (filters.type !== undefined) {
      where.type = filters.type;
    }
    if (filters.isUsed !== undefined) {
      where.isUsed = filters.isUsed === "true"; // chỉ "true" mới là true, còn "false" → false
    }

    const offset = (p - 1) * l;

    const { count, rows } = await Discount.findAndCountAll({
      where,
      order: [["createdDate", "DESC"]],
      limit: l,
      offset,
    });

    return {
      total: count,
      page: p,
      limit: l,
      discounts: rows,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const updateDiscountService = async (discountId) => {
  try {
    const discount = await Discount.findByPk(discountId);
    if (!discount) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Mã giảm giá đơn hàng không tồn tại!"
      );
    }
    if (discount.isActive === true) {
      await discount.update({
        isActive: false,
      });
    } else {
      await discount.update({
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

const deleteDiscountService = async (discountId) => {
  try {
    const discount = await Discount.findByPk(discountId);
    if (!discount) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Mã giảm giá đơn hàng không tồn tại!"
      );
    }
    await discount.destroy();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const discountService = {
  createDiscountService,
  getDiscountsService,
  updateDiscountService,
  deleteDiscountService,
};

export default discountService;
