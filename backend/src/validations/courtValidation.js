import Joi from "joi";
import { idParams, priceField } from "./common/numberField.js";
import { limitField, pageField } from "./common/paginationFields.js";
import { dateField } from "./common/searchFields.js";
import { locationField, nameCourtField } from "./common/courtFields.js";
import { thumbnailUrlField } from "./common/urlField.js";
import { DAY_OF_WEEK, PERIOD_TYPE } from "../constants/courtConstant.js";

export const getCourtsSchema = {
  query: Joi.object({
    date: dateField,
    page: pageField,
    limit: limitField,
  }),
};

export const getCourtScheduleSchema = {
  query: Joi.object({
    courtId: idParams("courtId"),
    date: dateField,
  }),
};

export const getCourtScheduleByDateSchema = {
  query: Joi.object({
    date: dateField,
  }),
};

export const createCourtSchema = {
  body: Joi.object({
    name: nameCourtField.required(),
    location: locationField.required(),
    thumbnailUrl: thumbnailUrlField,
  }),
};

export const updateCourtSchema = {
  params: Joi.object({
    courtId: idParams("courtId"),
  }),
  body: Joi.object({
    name: nameCourtField.optional(),
    location: locationField.optional(),
    thumbnailUrl: thumbnailUrlField,
  })
    .min(1)
    .message({
      "object.min": "At least one field must be provided to update court",
    }),
};

export const getCourtByIdSchema = {
  params: Joi.object({
    courtId: idParams("courtId"),
  }),
};

export const createCourtPriceSchema = {
  body: Joi.object({
    dayOfWeek: Joi.string()
      .valid(...Object.values(DAY_OF_WEEK))
      .required()
      .messages({
        "any.required": "Day of week is required",
        "any.only": "Day of week must be a valid weekday",
        "string.base": "Day of week must be a string",
      }),
    startTime: Joi.string()
      .pattern(/^\d{2}:\d{2}$/)
      .required()
      .messages({
        "any.required": "Start time is required",
        "string.pattern.base": "Start time must be in HH:mm format",
      }),

    endTime: Joi.string()
      .pattern(/^\d{2}:\d{2}$/)
      .required()
      .messages({
        "any.required": "End time is required",
        "string.pattern.base": "End time must be in HH:mm format",
      }),
    price: priceField,
    periodType: Joi.string()
      .valid(...Object.values(PERIOD_TYPE))
      .required()
      .messages({
        "any.required": "Period type is required",
        "any.only": "Period type must be Daytime, Evening, or Weekend",
        "string.base": "Period type must be a string",
      }),
  }),
};

export const createWeeklySlotsSchema = {
  body: Joi.object({
    startDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        "any.required": "Start date is required",
        "string.pattern.base": "Start date must be in YYYY-MM-DD format",
      }),
  }),
};
// Thêm vào file validations/courtValidation.js
export const getAvailableCourtsSchema = {
  query: Joi.object({
    branchId: idParams("branchId").required(),
    date: dateField.required(),
    startTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
    endTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
  }),
};
