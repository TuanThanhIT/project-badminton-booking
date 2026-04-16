import { Discount } from "../../models/index.js";
import { Op } from "sequelize";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js"; // Giả định bạn có class này
import { DISCOUNT_TYPE } from "../../constants/discountConstant.js";
import sequelize from "../../config/db.js";
import { redisClient } from "../../config/redis.js";

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

const applyDiscountService = async (data) => {
  const { code, userId } = data;
  return sequelize.transaction(async (t) => {
    const raw = redisClient.get(`checkout:${userId}`);
    const session = JSON.parse(raw);
    const discount = await Discount.findOne(
      { where: { code } },
      { transaction: t },
    );
    if (!discount) {
      throw new NotFoundError("Mã giảm giá không chính xác");
    }
    let amount = 0;
    if ((discount.type = DISCOUNT_TYPE.PERCENT)) {
      amount = (session.subTotal * discount.value) / 100;
      if (discount.maxDiscount) {
        amount = Math.min(discount.maxDiscount, amount);
      }
    } else {
      amount = discount.value;
    }
    session.discount = {
      code,
      amount,
    };
    session.total = session.subTotal + session.shippingFeeTotal - amount;
    await redisClient.set(`checkout:${userId}`, JSON.stringify(session), {
      EX: 1800,
    });

    return session;
  });
};

export default {
  checkDiscountBookingService,
  applyDiscountService,
};
