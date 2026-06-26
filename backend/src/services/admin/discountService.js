import { Op, QueryTypes } from "sequelize";
import sequelize from "../../config/db.js";
import { Branch, Discount, DiscountUser, User } from "../../models/index.js";
import {
  DISCOUNT_TYPE,
  DISCOUNT_APPLY_TYPE,
  DISCOUNT_VISIBILITY,
  DISCOUNT_SEGMENT,
  NOTIFICATION_TYPE_PROMOTION,
} from "../../constants/discountConstant.js";
import NotFoundError from "../../errors/NotFoundError.js";
import ConflictError from "../../errors/ConflictError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { sendUserNotification } from "../../helpers/notification.js";

const SCOPE_ATTRIBUTES = ["visibility", "branchId", "startHour", "endHour"];

const getAdminDiscountsService = async (data) => {
  const { page = 1, limit = 10, search, type, applyType, isActive, visibility } =
    data;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) where.code = { [Op.like]: `%${search}%` };
  if (type) where.type = type;
  if (applyType) where.applyType = applyType;
  if (visibility) where.visibility = visibility;
  if (isActive !== undefined && isActive !== "") {
    where.isActive = isActive === "true" || isActive === true;
  }

  const { rows, count } = await Discount.findAndCountAll({
    where,
    attributes: [
      "id", "code", "type", "applyType", "value", "maxDiscount", "minAmount",
      "usageLimit", "usageCount", "isActive", "startDate", "endDate", "createdAt",
      ...SCOPE_ATTRIBUTES,
    ],
    include: [
      { model: Branch, as: "branch", attributes: ["id", ["branchName", "name"]] },
    ],
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  return {
    discounts: rows.map((d) => d.toJSON()),
    pagination: { page: Number(page), limit: Number(limit), total: count },
  };
};

const normalizeScope = (data) => ({
  visibility: data.visibility || DISCOUNT_VISIBILITY.PUBLIC,
  branchId: data.branchId ?? null,
  startHour: data.startHour ?? null,
  endHour: data.endHour ?? null,
});

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
    ...normalizeScope(data),
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

const SEGMENT_LABEL = {
  [DISCOUNT_SEGMENT.LOYAL]: "tri ân khách thân thiết",
  [DISCOUNT_SEGMENT.WINBACK]: "chào mừng bạn quay lại",
};

const buildPromotionMessage = (discount) => {
  const valueText =
    discount.type === DISCOUNT_TYPE.PERCENT
      ? `${Number(discount.value)}%`
      : `${Number(discount.value).toLocaleString()}đ`;
  const parts = [`Bạn được tặng mã ${discount.code} giảm ${valueText} khi đặt sân.`];
  if (discount.startHour != null && discount.endHour != null) {
    parts.push(
      `Áp dụng khung ${String(discount.startHour).padStart(2, "0")}:00–${String(discount.endHour).padStart(2, "0")}:00.`,
    );
  }
  parts.push(`Hạn dùng đến ${discount.endDate}.`);
  return parts.join(" ");
};

/**
 * Tạo mã PRIVATE và gán cho một nhóm khách hàng cụ thể, đồng thời gửi thông báo.
 * data: { code, type, value, maxDiscount, minAmount, startDate, endDate,
 *         branchId, startHour, endHour, segment, userIds: number[] }
 */
const PROMOTION_SEGMENT_TITLE = {
  [DISCOUNT_SEGMENT.LOYAL]: "Ưu đãi tri ân khách thân thiết",
  [DISCOUNT_SEGMENT.WINBACK]: "Ưu đãi chào mừng bạn quay lại",
};

const formatPromotionCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatPromotionDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "ngày kết thúc chương trình";
  return date.toLocaleDateString("vi-VN");
};

const formatPromotionHour = (hour) => `${String(hour).padStart(2, "0")}:00`;

const buildReadablePromotionMessage = (discount) => {
  const valueText =
    discount.type === DISCOUNT_TYPE.PERCENT
      ? `${Number(discount.value).toLocaleString("vi-VN")}%`
      : formatPromotionCurrency(discount.value);

  const parts = [
    `Bạn nhận được mã ưu đãi riêng ${discount.code}: giảm ${valueText} khi đặt sân.`,
  ];

  if (discount.type === DISCOUNT_TYPE.PERCENT && Number(discount.maxDiscount) > 0) {
    parts.push(`Mức giảm tối đa ${formatPromotionCurrency(discount.maxDiscount)}.`);
  }

  if (Number(discount.minAmount) > 0) {
    parts.push(`Áp dụng cho đơn từ ${formatPromotionCurrency(discount.minAmount)}.`);
  }

  if (discount.startHour != null && discount.endHour != null) {
    parts.push(
      `Khung giờ áp dụng: ${formatPromotionHour(discount.startHour)} - ${formatPromotionHour(discount.endHour)}.`,
    );
  }

  parts.push(`Hạn dùng đến ${formatPromotionDate(discount.endDate)}.`);
  return parts.join(" ");
};

const createTargetedDiscountService = async (data) => {
  const { code, type, value, maxDiscount, minAmount, startDate, endDate, segment, userIds } =
    data;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new BadRequestError("Cần chọn ít nhất một khách hàng để gửi mã");
  }

  const uniqueUserIds = [...new Set(userIds.map(Number).filter(Boolean))];

  const validUsers = await User.findAll({
    where: { id: { [Op.in]: uniqueUserIds } },
    attributes: ["id"],
  });
  const validUserIds = validUsers.map((u) => u.id);
  if (!validUserIds.length) {
    throw new BadRequestError("Không tìm thấy khách hàng hợp lệ");
  }

  const existing = await Discount.findOne({
    where: { code: code?.trim().toUpperCase() },
  });
  if (existing) throw new ConflictError("Mã giảm giá đã tồn tại");

  const result = await sequelize.transaction(async (t) => {
    const discount = await Discount.create(
      {
        code,
        type: type || DISCOUNT_TYPE.AMOUNT,
        applyType: DISCOUNT_APPLY_TYPE.BOOKING,
        value,
        maxDiscount: maxDiscount || null,
        minAmount: minAmount || 0,
        // 1 mã dùng chung cho cả nhóm; mỗi user 1 lượt qua DiscountUser.
        usageLimit: validUserIds.length,
        isActive: true,
        startDate,
        endDate,
        visibility: DISCOUNT_VISIBILITY.PRIVATE,
        branchId: data.branchId ?? null,
        startHour: data.startHour ?? null,
        endHour: data.endHour ?? null,
      },
      { transaction: t },
    );

    await DiscountUser.bulkCreate(
      validUserIds.map((userId) => ({ discountId: discount.id, userId })),
      { transaction: t },
    );

    const title = SEGMENT_LABEL[segment]
      ? `Ưu đãi ${SEGMENT_LABEL[segment]} 🎁`
      : "Bạn nhận được mã ưu đãi 🎁";
    const message = buildReadablePromotionMessage(discount);
    const readableTitle =
      PROMOTION_SEGMENT_TITLE[segment] || "Bạn nhận được mã ưu đãi riêng";

    for (const userId of validUserIds) {
      await sendUserNotification(
        userId,
        NOTIFICATION_TYPE_PROMOTION,
        readableTitle,
        message,
        { transaction: t },
      );
    }

    return { discount: discount.toJSON(), assignedCount: validUserIds.length };
  });

  return result;
};

// Danh sách khách đã được gán 1 mã PRIVATE + trạng thái dùng (đọc từ DiscountUsers).
const getDiscountRecipientsService = async (discountId) => {
  const discount = await Discount.findByPk(discountId, {
    attributes: ["id", "code", "visibility", "type", "value", "usageCount"],
  });
  if (!discount) throw new NotFoundError("Không tìm thấy mã giảm giá");

  const recipients = await sequelize.query(
    `
      SELECT du.userId,
             p.fullName,
             u.email,
             du.isUsed,
             du.usedAt
      FROM DiscountUsers du
      INNER JOIN Users u ON u.id = du.userId
      LEFT JOIN Profiles p ON p.userId = u.id
      WHERE du.discountId = :discountId
      ORDER BY du.isUsed ASC, du.id ASC
    `,
    {
      replacements: { discountId: Number(discountId) },
      type: QueryTypes.SELECT,
    },
  );

  const usedCount = recipients.filter((r) => r.isUsed).length;

  return {
    discount: discount.toJSON(),
    recipients: recipients.map((r) => ({
      userId: Number(r.userId),
      fullName: r.fullName || null,
      email: r.email,
      isUsed: !!r.isUsed,
      usedAt: r.usedAt,
    })),
    summary: { total: recipients.length, used: usedCount },
  };
};

const adminDiscountService = {
  getAdminDiscountsService,
  getDiscountRecipientsService,
  createAdminDiscountService,
  updateAdminDiscountService,
  toggleAdminDiscountActiveService,
  deleteAdminDiscountService,
  createTargetedDiscountService,
};

export default adminDiscountService;
