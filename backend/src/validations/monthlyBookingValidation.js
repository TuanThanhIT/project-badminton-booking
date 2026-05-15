import Joi from "joi";

export const createMonthlyBookingSchema = {
  body: Joi.object({
    branchId: Joi.number().integer().positive().required().messages({
      "number.base": "Branch ID must be a number",
      "number.integer": "Branch ID must be an integer",
      "number.positive": "Branch ID must be positive",
      "any.required": "Branch ID is required",
    }),

    courtId: Joi.number().integer().positive().required().messages({
      "number.base": "Court ID must be a number",
      "number.integer": "Court ID must be an integer",
      "number.positive": "Court ID must be positive",
      "any.required": "Court ID is required",
    }),

    startDate: Joi.date().required().messages({
      "date.base": "Start date must be a valid date",
      "any.required": "Start date is required",
    }),

    endDate: Joi.date().required().messages({
      "date.base": "End date must be a valid date",
      "any.required": "End date is required",
    }),

    // daysOfWeek: Joi.string().trim().required().messages({
    //   "string.base": "Days of week must be a string",
    //   "string.empty": "Days of week is required",
    //   "any.required": "Days of week is required",
    // }),
    daysOfWeek: Joi.array().items(Joi.string()).min(1).required(),

    startTime: Joi.string().required().messages({
      "string.base": "Start time must be a string",
      "string.empty": "Start time is required",
      "any.required": "Start time is required",
    }),

    endTime: Joi.string().required().messages({
      "string.base": "End time must be a string",
      "string.empty": "End time is required",
      "any.required": "End time is required",
    }),

    totalAmount: Joi.number().positive().optional().messages({
      "number.base": "Total amount must be a number",
      "number.positive": "Total amount must be greater than 0",
    }),

    discountId: Joi.number().integer().positive().allow(null).optional(),

    note: Joi.string().allow(null, "").max(500).messages({
      "string.max": "Note must not exceed 500 characters",
    }),
  }),
};

export const calculateMonthlyBookingSchema = {
  body: Joi.object({
    branchId: Joi.number().required(),

    courtId: Joi.number().required(),

    startDate: Joi.date().required(),

    endDate: Joi.date().required(),

    daysOfWeek: Joi.array()
      .items(
        Joi.string().valid(
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ),
      )
      .min(1)
      .required(),

    startTime: Joi.string().required(),

    endTime: Joi.string().required(),
  }),
};

// export const createMonthlyBookingSchema = {
//   body: Joi.object({
//     branchId: Joi.number().required(),

//     courtId: Joi.number().required(),

//     startDate: Joi.date().required(),

//     endDate: Joi.date().required(),

//     daysOfWeek: Joi.array()
//       .items(
//         Joi.string().valid(
//           "Sunday",
//           "Monday",
//           "Tuesday",
//           "Wednesday",
//           "Thursday",
//           "Friday",
//           "Saturday",
//         ),
//       )
//       .min(1)
//       .required(),

//     startTime: Joi.string().required(),

//     endTime: Joi.string().required(),

//     totalAmount: Joi.number().required(),

//     note: Joi.string().allow("").optional(),
//   }),
// };
