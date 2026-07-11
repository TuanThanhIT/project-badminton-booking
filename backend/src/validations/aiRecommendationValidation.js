import Joi from "joi";

const optionalPositiveInt = Joi.number().integer().positive().optional();
const optionalBool = Joi.boolean().optional();

const dateField = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .messages({
    "string.pattern.base": "Ngày phải có định dạng YYYY-MM-DD",
  });

const countDaysInclusive = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

export const adminInsightsQuerySchema = {
  query: Joi.object({
    startDate: dateField,
    endDate: dateField,
    lookbackDays: Joi.number().integer().min(7).max(365).optional(),
    lowFillThreshold: Joi.number().min(0).max(100).optional(),
    churnDaysThreshold: Joi.number().integer().min(1).max(180).optional(),
    naturalLanguage: Joi.alternatives()
      .try(Joi.boolean(), Joi.string().valid("true", "false", "1", "0"))
      .optional(),
  }).custom((value, helpers) => {
    const { startDate, endDate } = value;
    if (Boolean(startDate) !== Boolean(endDate)) {
      return helpers.message(
        "Cần chọn cả ngày bắt đầu và ngày kết thúc",
      );
    }
    if (startDate && endDate) {
      if (startDate > endDate) {
        return helpers.message("Ngày bắt đầu không được sau ngày kết thúc");
      }
      const days = countDaysInclusive(startDate, endDate);
      if (days < 7) {
        return helpers.message("Khoảng thời gian tối thiểu là 7 ngày");
      }
      if (days > 365) {
        return helpers.message("Khoảng thời gian tối đa là 365 ngày");
      }
    }
    return value;
  }),
};

export const productRecommendationQuerySchema = {
  query: Joi.object({
    topK: Joi.number().integer().min(1).max(20).optional(),
  }),
};

export const relatedProductQuerySchema = {
  query: Joi.object({
    productId: optionalPositiveInt.required(),
    topK: Joi.number().integer().min(1).max(20).optional(),
  }),
};
