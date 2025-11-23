import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Discount } from "../../models/index.js";

const createDiscountService = async (
  code,
  type,
  value,
  quantity,
  startDate,
  endDate,
  minOrderAmount
) => {
  try {
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

    // Kiểm tra số lượng và min order
    if (quantity <= 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Số lượng mã giảm giá phải lớn hơn 0!"
      );
    }
    if (minOrderAmount < 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giá trị đơn hàng tối thiểu không hợp lệ!"
      );
    }

    // Tạo discount
    const discount = await Discount.create({
      code: code.trim().toUpperCase(),
      type,
      value,
      quantity,
      startDate: start,
      endDate: end,
      minOrderAmount,
    });

    return discount;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const discountService = {
  createDiscountService,
};

export default discountService;
