import { Op } from "sequelize";
import { Discount } from "../../models/index.js";
import { DISCOUNT_TYPE, DISCOUNT_APPLY_TYPE } from "../../constants/discountConstant.js";
import NotFoundError from "../../errors/NotFoundError.js";
import ConflictError from "../../errors/ConflictError.js";

const getAdminDiscountsService = async (data) => {
  const { page = 1, limit = 10, search, type, applyType, isActive } = data;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) where.code = { [Op.like]: `%${search}%` };
  if (type) where.type = type;
  if (applyType) where.applyType = applyType;
  if (isActive !== undefined && isActive !== "") {
    where.isActive = isActive === "true" || isActive === true;
  }

  const { rows, count } = await Discount.findAndCountAll({
    where,
    attributes: [
      "id", "code", "type", "applyType", "value", "maxDiscount", "minAmount",
      "usageLimit", "usageCount", "isActive", "startDate", "endDate", "createdAt",
    ],
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
  });

  return {
    discounts: rows.map((d) => d.toJSON()),
    pagination: { page: Number(page), limit: Number(limit), total: count },
  };
};

const createAdminDiscountService = async (data) => {
  const { code, type, applyType, value, maxDiscount, minAmount, usageLimit, startDate, endDate } = data;

  const existing = await Discount.findOne({ where: { code: code?.trim().toUpperCase() } });
  if (existing) throw new ConflictError("Mã giảm giá đã tồn tại");

  const discount = await Discount.create({
    code,
    type: type || DISCOUNT_TYPE.AMOUNT,
    applyType: applyType || DISCOUNT_APPLY_TYPE.ALL,
    value,
    maxDiscount: maxDiscount || null,
    minAmount: minAmount || 0,
    usageLimit: usageLimit || null,
    isActive: true,
    startDate,
    endDate,
  });

  return discount.toJSON();
};

const updateAdminDiscountService = async (discountId, data) => {
  const discount = await Discount.findByPk(discountId);
  if (!discount) throw new NotFoundError("Không tìm thấy mã giảm giá");

  if (data.code && data.code.trim().toUpperCase() !== discount.code) {
    const existing = await Discount.findOne({
      where: { code: data.code.trim().toUpperCase(), id: { [Op.ne]: discountId } },
    });
    if (existing) throw new ConflictError("Mã giảm giá đã tồn tại");
  }

  await discount.update(data);
  return discount.toJSON();
};

const toggleAdminDiscountActiveService = async (discountId) => {
  const discount = await Discount.findByPk(discountId);
  if (!discount) throw new NotFoundError("Không tìm thấy mã giảm giá");

  await discount.update({ isActive: !discount.isActive });
  return { id: discount.id, code: discount.code, isActive: discount.isActive };
};

const deleteAdminDiscountService = async (discountId) => {
  const discount = await Discount.findByPk(discountId);
  if (!discount) throw new NotFoundError("Không tìm thấy mã giảm giá");

  await discount.destroy();
  return { id: Number(discountId) };
};

const adminDiscountService = {
  getAdminDiscountsService,
  createAdminDiscountService,
  updateAdminDiscountService,
  toggleAdminDiscountActiveService,
  deleteAdminDiscountService,
};

export default adminDiscountService;
