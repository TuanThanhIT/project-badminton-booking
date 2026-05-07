import sequelize from "../../config/db.js";
import { Op } from "sequelize";
import BadRequestError from "../../errors/BadRequestError.js";
import { Discount } from "../../models/index.js";

export const applyDiscountUsage = async (discountId, t) => {
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
};
