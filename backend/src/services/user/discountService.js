import { Discount, DiscountUser } from "../../models/index.js";
import { Op } from "sequelize";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js"; // Giả định bạn có class này
import {
  DISCOUNT_APPLY_TYPE,
  DISCOUNT_TARGET_TYPE,
  DISCOUNT_TYPE,
  DISCOUNT_VISIBILITY,
} from "../../constants/discountConstant.js";
import sequelize from "../../config/db.js";
import { redisClient } from "../../config/redis.js";
import { getCheckoutKey } from "../../utils/checkoutKey.js";

/**
 * Kiểm tra mã có khớp phạm vi đặt sân (chi nhánh / khung giờ / mã riêng).
 * context: { userId, branchId, startHour, endHour, transaction }
 */
export const assertBookingDiscountScope = async (discount, context = {}) => {
  const { userId, branchId, startHour, endHour, transaction } = context;

  // Mã riêng (PRIVATE): chỉ user được gán & chưa dùng mới áp được.
  if (discount.visibility === DISCOUNT_VISIBILITY.PRIVATE) {
    if (!userId) {
      throw new BadRequestError("Mã này chỉ dành cho tài khoản được tặng");
    }
    const assignment = await DiscountUser.findOne({
      where: { discountId: discount.id, userId },
      transaction,
    });
    if (!assignment) {
      throw new BadRequestError("Mã này không áp dụng cho tài khoản của bạn");
    }
    if (assignment.isUsed) {
      throw new BadRequestError("Bạn đã sử dụng mã này rồi");
    }
  }

  // Phạm vi chi nhánh.
  if (discount.branchId != null) {
    if (branchId == null || Number(branchId) !== Number(discount.branchId)) {
      throw new BadRequestError(
        "Mã chỉ áp dụng cho một chi nhánh cụ thể, không khớp chi nhánh đang đặt",
      );
    }
  }

  // Phạm vi khung giờ.
  if (discount.startHour != null && discount.endHour != null) {
    if (startHour == null || endHour == null) {
      throw new BadRequestError("Mã chỉ áp dụng cho một khung giờ cụ thể");
    }
    if (
      Number(startHour) < Number(discount.startHour) ||
      Number(endHour) > Number(discount.endHour)
    ) {
      throw new BadRequestError(
        `Mã chỉ áp dụng cho khung ${String(discount.startHour).padStart(2, "0")}:00–${String(discount.endHour).padStart(2, "0")}:00`,
      );
    }
  }
};

const checkDiscountBookingService = async (data) => {
  const { code, bookingAmount, userId, branchId, startHour, endHour } = data;

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
    throw new BadRequestError("Mã không áp dụng cho đặt sân");
  }

  await assertBookingDiscountScope(discount, {
    userId,
    branchId,
    startHour,
    endHour,
  });

  if (bookingAmount < discount.minAmount) {
    throw new BadRequestError(
      `Đơn hàng tối thiểu ${discount.minAmount.toLocaleString()}đ để áp dụng mã này`,
    );
  }

  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    throw new BadRequestError("Mã giảm giá đã hết lượt sử dụng");
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
  const {
    amount,
    targetType = DISCOUNT_TARGET_TYPE.ORDER,
    userId = null,
    branchId = null,
    startHour = null,
    endHour = null,
  } = data;
  const today = new Date().toISOString().split("T")[0];
  const isBooking = targetType === DISCOUNT_TARGET_TYPE.BOOKING;
  const applyTypes = isBooking
    ? [DISCOUNT_APPLY_TYPE.BOOKING, DISCOUNT_APPLY_TYPE.ALL]
    : [DISCOUNT_APPLY_TYPE.ORDER, DISCOUNT_APPLY_TYPE.ALL];

  const attributes = [
    "id",
    "code",
    "type",
    "value",
    "maxDiscount",
    "minAmount",
    "usageLimit",
    "usageCount",
    "startDate",
    "endDate",
    "visibility",
    "branchId",
    "startHour",
    "endHour",
  ];

  // Chỉ lọc cứng theo: còn hiệu lực + đúng loại áp dụng.
  // Các điều kiện mềm (đơn tối thiểu / khung giờ / lượt) -> trả kèm cờ eligible + reason.
  const baseWhere = {
    isActive: true,
    startDate: { [Op.lte]: today },
    endDate: { [Op.gte]: today },
    applyType: { [Op.in]: applyTypes },
  };

  const order = [
    ["minAmount", "DESC"],
    ["value", "DESC"],
  ];

  // Mã PUBLIC luôn hiển thị.
  const publicDiscounts = await Discount.findAll({
    attributes,
    where: { ...baseWhere, visibility: DISCOUNT_VISIBILITY.PUBLIC },
    order,
  });

  let result = publicDiscounts;

  // Mã PRIVATE: chỉ thêm những mã được gán cho user & chưa dùng.
  if (userId) {
    const assignments = await DiscountUser.findAll({
      where: { userId, isUsed: false },
      attributes: ["discountId"],
    });
    const assignedIds = assignments.map((a) => a.discountId);
    if (assignedIds.length) {
      const privateDiscounts = await Discount.findAll({
        attributes,
        where: {
          ...baseWhere,
          visibility: DISCOUNT_VISIBILITY.PRIVATE,
          id: { [Op.in]: assignedIds },
        },
        order,
      });
      result = [...privateDiscounts, ...publicDiscounts];
    }
  }

  const fmt = (v) => `${Number(v || 0).toLocaleString("vi-VN")}đ`;

  const evaluated = [];
  for (const item of result) {
    const d = item.toJSON();

    // ẨN hẳn mã của chi nhánh khác (chỉ áp cho đặt sân) — tránh gây nhiễu.
    if (isBooking && d.branchId != null) {
      if (branchId == null || Number(branchId) !== Number(d.branchId)) {
        continue;
      }
    }

    let eligible = true;
    let reason = null;

    if (d.usageLimit != null && d.usageCount >= d.usageLimit) {
      eligible = false;
      reason = "Mã đã hết lượt sử dụng";
    } else if (Number(amount) < Number(d.minAmount)) {
      eligible = false;
      const diff = Number(d.minAmount) - Number(amount);
      reason = `Cần đơn từ ${fmt(d.minAmount)} (mua thêm ${fmt(diff)})`;
    } else if (isBooking && d.startHour != null && d.endHour != null) {
      if (
        startHour == null ||
        endHour == null ||
        Number(startHour) < Number(d.startHour) ||
        Number(endHour) > Number(d.endHour)
      ) {
        eligible = false;
        reason = `Chỉ áp dụng khung ${String(d.startHour).padStart(2, "0")}:00–${String(d.endHour).padStart(2, "0")}:00`;
      }
    }

    evaluated.push({ ...d, eligible, reason });
  }

  // Mã dùng được lên trước, mã chưa đủ điều kiện xuống dưới.
  evaluated.sort((a, b) => Number(b.eligible) - Number(a.eligible));

  return evaluated;
};

const discountService = {
  checkDiscountBookingService,
  applyDiscountService,
  getDiscountsCheckoutService,
};

export default discountService;
