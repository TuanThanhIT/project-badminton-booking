import { Discount } from "../../models/index.js";
import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ConflictError from "../../errors/ConflictError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { DISCOUNT_TYPE } from "../../constants/discountConstant.js";

const applyDiscountService = async (data) => {
  const { code, orderAmount } = data;

  return sequelize.transaction(async (t) => {
    const discount = await Discount.findOne({
      where: { code },
      transaction: t,
    });
    if (!discount) {
      throw new BadRequestError("Mã giảm giá không hợp lệ");
    }

    if (!discount.isActive) {
      throw new BadRequestError("Mã giảm giá không thể sử dụng");
    }

    if (discount.isUsed) {
      throw new ConflictError("Mã giảm giá đã được sử dụng");
    }

    const now = new Date();

    if (discountBooking.startDate > now) {
      throw new BadRequestError("Mã giảm giá chưa thể áp dụng");
    }

    if (discountBooking.endDate < now) {
      throw new BadRequestError("Mã giảm giá đã hết hạn");
    }

    if (orderAmount < discount.minOrderAmount) {
      throw new BadRequestError(
        "Giá trị của đơn hàng chưa đủ để áp dụng giảm giá!",
      );
    }

    let finalPrice = orderAmount;

    if (discount.type === DISCOUNT_TYPE.PERCENT) {
      finalPrice = orderAmount - (orderAmount * discount.value) / 100;
    }

    if (discount.type === DISCOUNT_TYPE.AMOUNT) {
      finalPrice = orderAmount - discount.value;
    }

    return {
      originalPrice: orderAmount,
      finalPrice: Math.max(finalPrice, 0),
      discountValue: discount.value,
      type: discount.type,
    };
  });
};

const updateDiscountService = async (data) => {
  const { code } = data;
  const discount = await Discount.findOne({
    where: { code },
  });
  if (!discount) {
    throw new NotFoundError("Mã giảm giá không hợp lệ");
  }
  await discount.update({ isUsed: true });
  return discount;
};

const getDiscountService = async () => {
  const discounts = await Discount.findAll({
    where: { isUsed: false, isActive: true },
    attributes: [
      "id",
      "code",
      "type",
      "value",
      "startDate",
      "endDate",
      "minOrderAmount",
    ],
  });
  return discounts;
};

const discountService = {
  applyDiscountService,
  updateDiscountService,
  getDiscountService,
};

export default discountService;
