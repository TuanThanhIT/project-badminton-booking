import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Discount } from "../../models/index.js";

const applyDiscountService = async (code, orderAmount) => {
  try {
    const discount = await Discount.findOne({
      where: { code },
    });
    if (!discount) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Mã giảm giá không hợp lệ!");
    }

    if (!discount.isActive) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Mã giảm giá không thể sử dụng!"
      );
    }

    if (discount.isUsed) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Mã giảm giá đã được sử dụng!"
      );
    }
    // Chuyển sang Date để so sánh
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);
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

    if (orderAmount < discount.minOrderAmount) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Giá trị của đơn hàng chưa đủ để áp dụng giảm giá!"
      );
    }

    let finalPrice = orderAmount;
    if (discount.type === "PERCENT") {
      finalPrice = orderAmount - (orderAmount * discount.value) / 100;
    } else if (discount.type === "AMOUNT") {
      finalPrice = orderAmount - discount.value;
    }

    if (finalPrice < 0) finalPrice = 0;

    return {
      originalPrice: orderAmount,
      finalPrice,
      discountValue: discount.value,
      type: discount.type,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateDiscountService = async (code) => {
  try {
    const discount = await Discount.findOne({
      where: { code },
    });
    if (!discount) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Mã giảm giá không hợp lệ!");
    }
    await discount.update({ isUsed: true });
    return discount;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const discountService = {
  applyDiscountService,
  updateDiscountService,
};

export default discountService;
