import { Discount } from "../../models/index.js";
import { Op } from "sequelize";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js"; // Giả định bạn có class này
import {
  DISCOUNT_APPLY_TYPE,
  DISCOUNT_TARGET_TYPE,
  DISCOUNT_TYPE,
} from "../../constants/discountConstant.js";
import sequelize from "../../config/db.js";
import { redisClient } from "../../config/redis.js";
import { getCheckoutKey } from "../../utils/checkoutKey.js";

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

  if (
    discount.applyType !== DISCOUNT_APPLY_TYPE.BOOKING &&
    discount.applyType !== DISCOUNT_APPLY_TYPE.ALL
  ) {
    throw new BadRequestError("MÃ£ khÃ´ng Ã¡p dá»¥ng cho Ä‘áº·t sÃ¢n");
  }

  if (bookingAmount < discount.minAmount) {
    throw new BadRequestError(
      `Đơn hàng tối thiểu ${discount.minAmount.toLocaleString()}đ để áp dụng mã này`,
    );
  }

  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    throw new BadRequestError("MÃ£ giáº£m giÃ¡ Ä‘Ã£ háº¿t lÆ°á»£t sá»­ dá»¥ng");
  }

  let discountValue = 0;
  if (discount.type === DISCOUNT_TYPE.PERCENT) {
    discountValue = (bookingAmount * discount.value) / 100;
    if (discount.maxDiscount) {
      discountValue = Math.min(discountValue, discount.maxDiscount);
    }
  } else {
    discountValue = discount.value;
  }

  discountValue = Math.min(discountValue, bookingAmount);

  return {
    discountId: discount.id,
    code: discount.code,
    discountValue: Math.round(discountValue),
    finalAmount: Math.max(0, bookingAmount - discountValue),
  };
};

const applyDiscountService = async ({ code, userId, cartId }) => {
  const redisKey = getCheckoutKey({ userId, cartId });

  const raw = await redisClient.get(redisKey);
  if (!raw) throw new BadRequestError("Checkout session hết hạn");

  const session = JSON.parse(raw);

  return sequelize.transaction(async (t) => {
    const normalizedCode = code.trim().toUpperCase();

    const discount = await Discount.findOne({
      where: { code: normalizedCode },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!discount) {
      throw new NotFoundError("Mã giảm giá không chính xác");
    }

    if (!discount.isActive) {
      throw new BadRequestError("Mã giảm giá đã bị vô hiệu hóa");
    }

    const now = new Date();

    if (now < new Date(discount.startDate)) {
      throw new BadRequestError("Mã giảm giá chưa bắt đầu");
    }

    if (now > new Date(discount.endDate)) {
      throw new BadRequestError("Mã giảm giá đã hết hạn");
    }

    if (session.subTotal < discount.minAmount) {
      throw new BadRequestError(
        `Đơn hàng tối thiểu ${discount.minAmount} để áp dụng mã`,
      );
    }

    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      throw new BadRequestError("Mã giảm giá đã hết lượt sử dụng");
    }

    if (
      discount.applyType !== DISCOUNT_APPLY_TYPE.ALL &&
      discount.applyType !== DISCOUNT_APPLY_TYPE.ORDER
    ) {
      throw new BadRequestError("Mã không áp dụng cho đơn hàng");
    }

    let amount = 0;

    if (discount.type === DISCOUNT_TYPE.PERCENT) {
      amount = (session.group.subTotal * discount.value) / 100;

      if (discount.maxDiscount) {
        amount = Math.min(amount, discount.maxDiscount);
      }
    } else {
      amount = discount.value;
    }

    amount = Math.min(amount, session.group.subTotal);

    session.group.discount = {
      id: discount.id,
      code: normalizedCode,
      amount,
    };

    session.group.total =
      session.group.subTotal + session.group.shippingFeeTotal - amount;

    await redisClient.set(redisKey, JSON.stringify(session), "EX", 1800);

    return session;
  });
};

const getDiscountsCheckoutService = async (data) => {
  const { amount, targetType = DISCOUNT_TARGET_TYPE.ORDER } = data;
  const today = new Date().toISOString().split("T")[0];
  const applyTypes =
    targetType === DISCOUNT_TARGET_TYPE.BOOKING
      ? [DISCOUNT_APPLY_TYPE.BOOKING, DISCOUNT_APPLY_TYPE.ALL]
      : [DISCOUNT_APPLY_TYPE.ORDER, DISCOUNT_APPLY_TYPE.ALL];

  const discounts = await Discount.findAll({
    attributes: [
      "id",
      "code",
      "type",
      "value",
      "maxDiscount",
      "minAmount",
      "startDate",
      "endDate",
    ],
    where: {
      isActive: true,
      minAmount: {
        [Op.lte]: amount,
      },
      startDate: {
        [Op.lte]: today,
      },
      endDate: {
        [Op.gte]: today,
      },
      applyType: {
        [Op.in]: applyTypes,
      },
      [Op.or]: [
        {
          usageLimit: null,
        },
        {
          usageCount: {
            [Op.lt]: sequelize.col("usageLimit"),
          },
        },
      ],
    },
    order: [
      ["minAmount", "DESC"],
      ["value", "DESC"],
    ],
  });

  return discounts;
};

const discountService = {
  checkDiscountBookingService,
  applyDiscountService,
  getDiscountsCheckoutService,
};

export default discountService;
