import Joi from "joi";
import { AI_CONTEXT } from "../constants/aiConstant.js";

const contextField = Joi.string()
  .valid(...Object.values(AI_CONTEXT))
  .default(AI_CONTEXT.GENERAL)
  .messages({
    "any.only": "Context phải là general, booking, shopping hoặc coach",
  });

const optionalId = Joi.number().integer().positive().optional();

const chatBodySchema = Joi.object({
    message: Joi.string().trim().min(1).max(2000).required().messages({
      "any.required": "Tin nhắn không được để trống",
      "string.max": "Tin nhắn tối đa 2000 ký tự",
    }),
    context: contextField,
    sessionId: optionalId,
    guestToken: Joi.string().trim().max(64).optional(),
    branchId: optionalId,
    courtId: optionalId,
    productId: optionalId,
    history: Joi.array()
      .items(
        Joi.object({
          role: Joi.string().valid("user", "assistant").required(),
          content: Joi.string().trim().max(2000).required(),
        }),
      )
      .max(40)
      .optional(),
  });

export const chatSchema = { body: chatBodySchema };
export const chatStreamSchema = chatSchema;

export const sessionIdParamSchema = {
  params: Joi.object({
    sessionId: Joi.number().integer().positive().required(),
  }),
};

export const listSessionsQuerySchema = {
  query: Joi.object({
    context: contextField.optional(),
  }),
};
