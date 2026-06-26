import sequelize from "../../config/db.js";
import { Op } from "sequelize";
import BadRequestError from "../../errors/BadRequestError.js";
import { Discount, DiscountUser } from "../../models/index.js";

export const applyDiscountUsage = async (discountId, t, userId = null) => {
  if (!discountId) return;

  const [affected] = await Discount.update(
    {
      usageCount: sequelize.literal("usageCount + 1"),
    },
    {
      where: {
        id: discountId,
        isActive: true,
        [Op.or]: [
          { usageLimit: null },
          sequelize.where(
            sequelize.col("usageCount"),
            "<",
            sequelize.col("usageLimit"),
          ),
        ],
      },
      transaction: t,
    },
  );

  if (affected === 0) {
    throw new BadRequestError("Mã giảm giá đã hết lượt sử dụng");
  }

  // Mã PRIVATE: đánh dấu user đã dùng (1 lần / khách).
  if (userId) {
    await DiscountUser.update(
      { isUsed: true, usedAt: new Date() },
      {
        where: { discountId, userId, isUsed: false },
        transaction: t,
      },
    );
  }
};

// Hoàn lại lượt dùng mã khi booking bị hủy/thất bại (chưa hoàn tất).
// Idempotent ở mức nghiệp vụ vì các luồng hủy đều khóa theo trạng thái (chỉ chạy 1 lần/booking).
export const restoreDiscountUsage = async (discountId, t, userId = null) => {
  if (!discountId) return;

  await Discount.update(
    {
      usageCount: sequelize.literal("GREATEST(usageCount - 1, 0)"),
    },
    {
      where: { id: discountId },
      transaction: t,
    },
  );

  // Mã PRIVATE: trả lại lượt cho khách (có thể dùng lại).
  if (userId) {
    await DiscountUser.update(
      { isUsed: false, usedAt: null },
      {
        where: { discountId, userId },
        transaction: t,
      },
    );
  }
};
