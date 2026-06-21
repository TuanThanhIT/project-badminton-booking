import Joi from "joi";

const optionalPositiveInt = Joi.number().integer().positive().optional();
const optionalBool = Joi.boolean().optional();

export const userRecommendationQuerySchema = {
  query: Joi.object({
    topK: Joi.number().integer().min(1).max(20).optional(),
    naturalLanguage: Joi.alternatives()
      .try(Joi.boolean(), Joi.string().valid("true", "false", "1", "0"))
      .optional(),
  }),
};

export const adminInsightsQuerySchema = {
  query: Joi.object({
    lookbackDays: Joi.number().integer().min(7).max(365).optional(),
    lowFillThreshold: Joi.number().min(0).max(100).optional(),
    churnDaysThreshold: Joi.number().integer().min(1).max(180).optional(),
    naturalLanguage: Joi.alternatives()
      .try(Joi.boolean(), Joi.string().valid("true", "false", "1", "0"))
      .optional(),
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
