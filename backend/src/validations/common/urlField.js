import Joi from "joi";

export const thumbnailUrlField = Joi.string()
  .uri()
  .allow(null)
  .optional()
  .messages({
    "string.base": "Thumbnail URL must be a string",
    "string.uri": "Thumbnail URL must be a valid URL",
  });
