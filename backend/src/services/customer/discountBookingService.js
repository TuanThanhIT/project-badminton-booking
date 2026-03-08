import { DiscountBooking } from "../../models/index.js";
import BadRequestError from "../../errors/BadRequestError.js";
import sequelize from "../../config/db.js";
import ConflictError from "../../errors/ConflictError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { DISCOUNT_TYPE } from "../../constants/discountConstant.js";

const applyDiscountBookingService = async (data) => {
  const { code, bookingAmount } = data;

  return sequelize.transaction(async (t) => {
    const discountBooking = await DiscountBooking.findOne({
      where: { code },
      transaction: t,
    });

    if (!discountBooking) {
      throw new BadRequestError("Mã giảm giá không hợp lệ");
    }

    if (!discountBooking.isActive) {
      throw new BadRequestError("Mã giảm giá không thể sử dụng");
    }

    if (discountBooking.isUsed) {
      throw new ConflictError("Mã giảm giá đã được sử dụng");
    }

    const now = new Date();

    if (discountBooking.startDate > now) {
      throw new BadRequestError("Mã giảm giá chưa thể áp dụng");
    }

    if (discountBooking.endDate < now) {
      throw new BadRequestError("Mã giảm giá đã hết hạn");
    }

    if (bookingAmount < discountBooking.minBookingAmount) {
      throw new BadRequestError("Giá trị chưa đủ để áp dụng giảm giá");
    }

    let finalPrice = bookingAmount;

    if (discountBooking.type === DISCOUNT_TYPE.PERCENT) {
      finalPrice -= (bookingAmount * discountBooking.value) / 100;
    }

    if (discountBooking.type === DISCOUNT_TYPE.AMOUNT) {
      finalPrice -= discountBooking.value;
    }

    return {
      originalPrice: bookingAmount,
      finalPrice: Math.max(finalPrice, 0),
      discountValue: discountBooking.value,
      type: discountBooking.type,
    };
  });
};

const updateDiscountBookingService = async (data) => {
  const { code } = data;
  const discountBooking = await DiscountBooking.findOne({
    where: { code },
  });
  if (!discountBooking) {
    throw new NotFoundError("Mã giảm giá không hợp lệ");
  }
  await discountBooking.update({ isUsed: true });
  return discountBooking;
};

const getDiscountBookingService = async () => {
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
};

const discountBookingService = {
  applyDiscountBookingService,
  updateDiscountBookingService,
  getDiscountBookingService,
};

export default discountBookingService;
