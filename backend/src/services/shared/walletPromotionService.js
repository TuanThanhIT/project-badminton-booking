import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { Discount, DiscountUsage } from "../../models/index.js";
import {
  DISCOUNT_APPLICATION_MODE,
  DISCOUNT_APPLY_TYPE,
  DISCOUNT_TYPE,
  DISCOUNT_USAGE_LIMIT_PERIOD,
  DISCOUNT_USAGE_REFERENCE_TYPE,
  DISCOUNT_USAGE_STATUS,
  WALLET_PAYMENT_PROMOTION,
} from "../../constants/discountConstant.js";
import { PAYMENT_METHOD_STATUS } from "../../constants/paymentConstant.js";

export const WALLET_PROMOTION_ERROR = Object.freeze({
  NOT_WALLET_PAYMENT: "NOT_WALLET_PAYMENT",
  STACKING_NOT_ALLOWED: "STACKING_NOT_ALLOWED",
  PROMOTION_NOT_FOUND: "PROMOTION_NOT_FOUND",
  PROMOTION_INACTIVE: "PROMOTION_INACTIVE",
  PROMOTION_NOT_STARTED: "PROMOTION_NOT_STARTED",
  PROMOTION_EXPIRED: "PROMOTION_EXPIRED",
  APPLY_TYPE_NOT_MATCHED: "APPLY_TYPE_NOT_MATCHED",
  BRANCH_NOT_MATCHED: "BRANCH_NOT_MATCHED",
  MIN_AMOUNT_NOT_REACHED: "MIN_AMOUNT_NOT_REACHED",
  TOTAL_USAGE_LIMIT_REACHED: "TOTAL_USAGE_LIMIT_REACHED",
  MONTHLY_USAGE_LIMIT_REACHED: "MONTHLY_USAGE_LIMIT_REACHED",
  REFERENCE_ALREADY_USED: "REFERENCE_ALREADY_USED",
});

const DEFAULT_RESPONSE = {
  eligible: false,
  discountId: null,
  campaignKey: WALLET_PAYMENT_PROMOTION.CAMPAIGN_KEY,
  discountRate: 0,
  maxDiscount: 0,
  discountAmount: 0,
  monthlyUsageCount: 0,
  monthlyUsageLimit: 5,
  remainingUsageCount: 5,
  reason: null,
};

const toMoney = (value) => Math.max(0, Math.round(Number(value || 0)));

const getVietnamMonthRange = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const startUtcMs = Date.UTC(year, month - 1, 1, -7, 0, 0, 0);
  const endUtcMs = Date.UTC(year, month, 1, -7, 0, 0, 0);

  return {
    start: new Date(startUtcMs),
    end: new Date(endUtcMs),
  };
};

export const getWalletPaymentPromotion = async ({
  transaction,
  lock = false,
} = {}) =>
  Discount.findOne({
    where: {
      campaignKey: WALLET_PAYMENT_PROMOTION.CAMPAIGN_KEY,
      applicationMode: DISCOUNT_APPLICATION_MODE.AUTOMATIC,
    },
    transaction,
    lock: lock && transaction ? transaction.LOCK.UPDATE : undefined,
  });

export const getMonthlyWalletPromotionUsage = async ({
  userId,
  discountId,
  transaction,
}) => {
  if (!userId || !discountId) return 0;

  const range = getVietnamMonthRange();

  return DiscountUsage.count({
    where: {
      userId,
      discountId,
      status: DISCOUNT_USAGE_STATUS.USED,
      usedAt: {
        [Op.gte]: range.start,
        [Op.lt]: range.end,
      },
    },
    transaction,
  });
};

const buildResponse = ({ discount, monthlyUsageCount, discountAmount, reason }) => {
  const monthlyUsageLimit = Number(discount?.usageLimitPerUser || 5);
  const remainingUsageCount = Math.max(
    monthlyUsageLimit - Number(monthlyUsageCount || 0),
    0,
  );

  return {
    ...DEFAULT_RESPONSE,
    eligible: !reason && discountAmount > 0,
    discountId: discount?.id || null,
    campaignKey:
      discount?.campaignKey || WALLET_PAYMENT_PROMOTION.CAMPAIGN_KEY,
    discountRate:
      discount?.type === DISCOUNT_TYPE.PERCENT
        ? Number(discount.value || 0)
        : 0,
    maxDiscount: Number(discount?.maxDiscount || 0),
    discountAmount: reason ? 0 : toMoney(discountAmount),
    monthlyUsageCount: Number(monthlyUsageCount || 0),
    monthlyUsageLimit,
    remainingUsageCount,
    reason: reason || null,
  };
};

export const calculateWalletPaymentDiscount = ({ discount, eligibleAmount }) => {
  const amount = toMoney(eligibleAmount);
  if (!discount || amount <= 0) return 0;

  const raw =
    discount.type === DISCOUNT_TYPE.PERCENT
      ? (amount * Number(discount.value || 0)) / 100
      : Number(discount.value || 0);

  const capped =
    discount.type === DISCOUNT_TYPE.PERCENT && discount.maxDiscount
      ? Math.min(raw, Number(discount.maxDiscount))
      : raw;

  return Math.min(toMoney(capped), amount);
};

export const validateWalletPromotionEligibility = async ({
  userId,
  paymentMethod,
  targetType,
  eligibleAmount,
  voucherDiscountAmount = 0,
  branchId = null,
  transaction,
  lock = false,
  referenceType = null,
  referenceId = null,
}) => {
  const promotion = await getWalletPaymentPromotion({ transaction, lock });

  if (!promotion) {
    return { ...DEFAULT_RESPONSE, reason: WALLET_PROMOTION_ERROR.PROMOTION_NOT_FOUND };
  }

  const monthlyUsageCount = await getMonthlyWalletPromotionUsage({
    userId,
    discountId: promotion.id,
    transaction,
  });

  const fail = (reason) =>
    buildResponse({
      discount: promotion,
      monthlyUsageCount,
      discountAmount: 0,
      reason,
    });

  if (paymentMethod !== PAYMENT_METHOD_STATUS.WALLET) {
    return fail(WALLET_PROMOTION_ERROR.NOT_WALLET_PAYMENT);
  }

  if (!promotion.isActive) return fail(WALLET_PROMOTION_ERROR.PROMOTION_INACTIVE);

  const today = new Date().toISOString().split("T")[0];
  if (promotion.startDate > today) {
    return fail(WALLET_PROMOTION_ERROR.PROMOTION_NOT_STARTED);
  }
  if (promotion.endDate < today) {
    return fail(WALLET_PROMOTION_ERROR.PROMOTION_EXPIRED);
  }

  if (
    promotion.requiredPaymentMethod &&
    promotion.requiredPaymentMethod !== paymentMethod
  ) {
    return fail(WALLET_PROMOTION_ERROR.NOT_WALLET_PAYMENT);
  }

  if (
    promotion.applyType !== DISCOUNT_APPLY_TYPE.ALL &&
    promotion.applyType !== targetType
  ) {
    return fail(WALLET_PROMOTION_ERROR.APPLY_TYPE_NOT_MATCHED);
  }

  if (
    targetType === DISCOUNT_USAGE_REFERENCE_TYPE.BOOKING &&
    promotion.branchId != null &&
    Number(promotion.branchId) !== Number(branchId)
  ) {
    return fail(WALLET_PROMOTION_ERROR.BRANCH_NOT_MATCHED);
  }

  if (toMoney(eligibleAmount) < Number(promotion.minAmount || 0)) {
    return fail(WALLET_PROMOTION_ERROR.MIN_AMOUNT_NOT_REACHED);
  }

  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
    return fail(WALLET_PROMOTION_ERROR.TOTAL_USAGE_LIMIT_REACHED);
  }

  const monthlyLimit =
    promotion.usageLimitPeriod === DISCOUNT_USAGE_LIMIT_PERIOD.MONTHLY
      ? Number(promotion.usageLimitPerUser || 0)
      : 0;
  if (monthlyLimit > 0 && monthlyUsageCount >= monthlyLimit) {
    return fail(WALLET_PROMOTION_ERROR.MONTHLY_USAGE_LIMIT_REACHED);
  }

  if (Number(voucherDiscountAmount || 0) > 0 || promotion.allowStacking === false) {
    if (Number(voucherDiscountAmount || 0) > 0) {
      return fail(WALLET_PROMOTION_ERROR.STACKING_NOT_ALLOWED);
    }
  }

  if (referenceType && referenceId) {
    const existingUsage = await DiscountUsage.findOne({
      where: {
        discountId: promotion.id,
        referenceType,
        referenceId,
        status: {
          [Op.in]: [DISCOUNT_USAGE_STATUS.PENDING, DISCOUNT_USAGE_STATUS.USED],
        },
      },
      transaction,
      lock: lock && transaction ? transaction.LOCK.UPDATE : undefined,
    });
    if (existingUsage) return fail(WALLET_PROMOTION_ERROR.REFERENCE_ALREADY_USED);
  }

  const discountAmount = calculateWalletPaymentDiscount({
    discount: promotion,
    eligibleAmount,
  });

  return buildResponse({
    discount: promotion,
    monthlyUsageCount,
    discountAmount,
    reason: null,
  });
};

export const assertNoWalletVoucherStacking = ({
  paymentMethod,
  voucherDiscountAmount = 0,
}) => {
  if (
    paymentMethod === PAYMENT_METHOD_STATUS.WALLET &&
    Number(voucherDiscountAmount || 0) > 0
  ) {
    throw new BadRequestError(
      "Uu dai Vi B-Hub khong duoc ap dung dong thoi voi voucher. Vui long chon mot trong hai uu dai.",
    );
  }
};

export const createWalletPromotionUsage = async ({
  discountId,
  userId,
  referenceType,
  referenceId,
  discountAmount,
  transaction,
}) => {
  if (!discountId || !discountAmount) return null;

  const [usage, created] = await DiscountUsage.findOrCreate({
    where: { discountId, referenceType, referenceId },
    defaults: {
      discountId,
      userId,
      referenceType,
      referenceId,
      discountAmount,
      status: DISCOUNT_USAGE_STATUS.USED,
      usedAt: new Date(),
    },
    transaction,
    lock: transaction?.LOCK?.UPDATE,
  });

  const shouldIncrementUsageCount =
    created || usage.status !== DISCOUNT_USAGE_STATUS.USED;

  if (usage.status !== DISCOUNT_USAGE_STATUS.USED) {
    await usage.update(
      {
        userId,
        discountAmount,
        status: DISCOUNT_USAGE_STATUS.USED,
        usedAt: new Date(),
        restoredAt: null,
      },
      { transaction },
    );
  }

  if (shouldIncrementUsageCount) {
    const [affected] = await Discount.update(
      { usageCount: sequelize.literal("usageCount + 1") },
      {
        where: {
          id: discountId,
          [Op.or]: [
            { usageLimit: null },
            sequelize.where(
              sequelize.col("usageCount"),
              "<",
              sequelize.col("usageLimit"),
            ),
          ],
        },
        transaction,
      },
    );

    if (affected === 0) {
      throw new BadRequestError("Uu dai Vi B-Hub da het luot su dung");
    }
  }

  return usage;
};

export const cancelWalletPromotionUsage = async ({
  discountId,
  referenceType,
  referenceId,
  transaction,
}) => {
  if (!discountId || !referenceType || !referenceId) return;

  const [affected] = await DiscountUsage.update(
    {
      status: DISCOUNT_USAGE_STATUS.CANCELLED,
      restoredAt: new Date(),
    },
    {
      where: {
        discountId,
        referenceType,
        referenceId,
        status: {
          [Op.in]: [DISCOUNT_USAGE_STATUS.PENDING, DISCOUNT_USAGE_STATUS.USED],
        },
      },
      transaction,
    },
  );

  if (affected > 0) {
    await Discount.update(
      { usageCount: sequelize.literal("GREATEST(usageCount - 1, 0)") },
      { where: { id: discountId }, transaction },
    );
  }
};

export const getWalletPaymentPromotionInfo = async ({ userId = null } = {}) => {
  const promotion = await getWalletPaymentPromotion();

  if (!promotion) {
    return {
      isActive: false,
      title: "Thanh toán bằng Ví B-Hub",
      description: "Chuong trinh uu dai Vi B-Hub hien chua kha dung.",
      discountRate: 0,
      maxDiscount: 0,
      monthlyUsageLimit: 5,
      monthlyUsageCount: userId ? 0 : null,
      remainingUsageCount: userId ? 5 : null,
      applyTypes: [],
      allowStacking: false,
      startDate: null,
      endDate: null,
    };
  }

  const monthlyUsageCount = userId
    ? await getMonthlyWalletPromotionUsage({
        userId,
        discountId: promotion.id,
      })
    : null;
  const monthlyUsageLimit = Number(promotion.usageLimitPerUser || 5);
  const today = new Date().toISOString().split("T")[0];
  const isActive =
    Boolean(promotion.isActive) &&
    promotion.startDate <= today &&
    promotion.endDate >= today;

  return {
    isActive,
    title: "Thanh toán bằng Ví B-Hub",
    description: `Giam ${Number(promotion.value || 0)}%, toi da ${Number(
      promotion.maxDiscount || 0,
    ).toLocaleString("vi-VN")}d moi giao dich.`,
    discountRate:
      promotion.type === DISCOUNT_TYPE.PERCENT
        ? Number(promotion.value || 0)
        : 0,
    maxDiscount: Number(promotion.maxDiscount || 0),
    monthlyUsageLimit,
    monthlyUsageCount,
    remainingUsageCount:
      monthlyUsageCount == null
        ? null
        : Math.max(monthlyUsageLimit - monthlyUsageCount, 0),
    applyTypes:
      promotion.applyType === DISCOUNT_APPLY_TYPE.ALL
        ? [DISCOUNT_APPLY_TYPE.ORDER, DISCOUNT_APPLY_TYPE.BOOKING]
        : [promotion.applyType],
    allowStacking: Boolean(promotion.allowStacking),
    startDate: promotion.startDate,
    endDate: promotion.endDate,
  };
};
