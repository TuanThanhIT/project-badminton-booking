import { Discount } from "../../models/index.js";
import { Op } from "sequelize";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js"; // Giả định bạn có class này
import { DISCOUNT_TYPE } from "../../constants/discountConstant.js";

const checkDiscountBookingService = async (data) => {
  const { code, bookingAmount } = data;

  const discount = await Discount.findOne({
    where: {
      code: code.toUpperCase().trim(),
      isActive: true,
      startDate: { [Op.lte]: new Date() },
      endDate: { [Op.gte]: new Date() },
    },
  });

  if (!discount)
    throw new NotFoundError("Mã giảm giá không tồn tại hoặc đã hết hạn");

  if (bookingAmount < discount.minAmount) {
    throw new BadRequestError(
      `Đơn hàng tối thiểu ${discount.minAmount.toLocaleString()}đ để áp dụng mã này`,
    );
  }

  let discountValue = 0;
  if (discount.type === DISCOUNT_TYPE.PERCENT) {
    discountValue = (bookingAmount * discount.value) / 100;
  } else {
    discountValue = discount.value;
  }

  return {
    discountId: discount.id,
    code: discount.code,
    discountValue: Math.round(discountValue),
    finalAmount: Math.max(0, bookingAmount - discountValue),
  };
};

export default {
  checkDiscountBookingService,
};
