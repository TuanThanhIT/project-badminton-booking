import { Discount } from "../../models/index.js";
import ConflictError from "../../errors/ConflictError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { DISCOUNT_TYPE } from "../../constants/discountConstant.js";

const createDiscountService = async (data) => {
  const { code, type, value, startDate, endDate, minOrderAmount } = data;
  const existing = await Discount.findOne({
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

  const discount = Discount.create({
    code,
    type,
    value,
    startDate,
    endDate,
    minOrderAmount,
  });

  return discount;
};

const getDiscountsService = async (data) => {
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
    discountBookings: rows,
  };
};

const updateDiscountService = async (data) => {
  const { discountId } = data;
  const discount = await Discount.findByPk(discountId);
  if (!discount) {
    throw new NotFoundError("Mã giảm giá đơn hàng không tồn tại");
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

  return discount;
};

const deleteDiscountService = async (data) => {
  const { discountId } = data;
  const discount = await Discount.findByPk(discountId);
  if (!discount) {
    throw new NotFoundError("Mã giảm giá đơn hàng không tồn tại");
  }
  await discount.destroy();
};

const discountService = {
  createDiscountService,
  getDiscountsService,
  updateDiscountService,
  deleteDiscountService,
};

export default discountService;
