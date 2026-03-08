import DiscountBooking from "../../models/discountBooking.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ConflictError from "../../errors/ConflictError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { DISCOUNT_TYPE } from "../../constants/discountConstant.js";

const createDiscountBookingService = async (data) => {
  const { code, type, value, startDate, endDate, minBookingAmount } = data;
  const existing = await DiscountBooking.findOne({
    where: { code },
  });
  if (existing) {
    throw new ConflictError("Mã giảm giá đã tồn tại");
  }
  if (type === DISCOUNT_TYPE.PERCENT && value > 100) {
    throw new BadRequestError("Giá trị giảm theo phần trăm phải từ 1 đến 100");
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (new Date(startDate) < today) {
    throw new BadRequestError("Ngày bắt đầu phải từ hôm nay trở đi");
  }

  const discount = DiscountBooking.create({
    code,
    type,
    value,
    startDate,
    endDate,
    minBookingAmount,
  });

  return discount;
};

const getDiscountBookingsService = async (data) => {
  const { isUsed, type, page, limit } = data;

  const p = page ?? 1;
  const l = limit ?? 10;
  const offset = (p - 1) * l;

  const where = {};

  if (type) {
    where.type = type;
  }

  if (isUsed !== undefined) {
    where.isUsed = isUsed; // đã là boolean rồi
  }

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
};

const updateDiscountBookingService = async (data) => {
  const { discountId } = data;
  const discountBooking = await DiscountBooking.findByPk(discountId);
  if (!discountBooking) {
    throw new NotFoundError("Mã giảm giá đặt sân không tồn tại");
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

  return discountBooking;
};

const deleteDiscountBookingService = async (data) => {
  const { discountId } = data;
  const discountBooking = await DiscountBooking.findByPk(discountId);
  if (!discountBooking) {
    throw new NotFoundError("Mã giảm giá đặt sân không tồn tại");
  }
  await discountBooking.destroy();
};

const discountBookingService = {
  createDiscountBookingService,
  getDiscountBookingsService,
  updateDiscountBookingService,
  deleteDiscountBookingService,
};

export default discountBookingService;
