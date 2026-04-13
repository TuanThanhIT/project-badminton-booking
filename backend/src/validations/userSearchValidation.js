import Joi from "joi";

export const searchUsersSchema = {
  query: Joi.object({
    q: Joi.string().trim().min(1).max(50).required(),
    limit: Joi.number().integer().min(1).max(25).optional(),
  }),
};
