import Joi from "joi";
import { idParams } from "./common/numberField.js";
import { ROLE_IN_SHIFT } from "../constants/workShiftConstant.js";

export const assignEmployeeToShiftSchema = {
  body: Joi.object({
    workShiftId: idParams("workShiftId"),
    employeeId: idParams("employeeId"),
    roleInShift: Joi.string()
      .valid(...Object.values(ROLE_IN_SHIFT))
      .required()
      .messages({
        "any.only": "roleInShift must be either Cashier or Staff",
      }),
  }),
};

export const getEmployeesByShiftSchema = {
  params: Joi.object({
    workShiftId: idParams("workShiftId"),
  }),
};

export const updateEmployeeInShiftSchema = {
  params: Joi.object({
    workShiftEmployeeId: idParams("workShiftEmployeeId"),
  }),
  body: Joi.object({
    roleInShift: Joi.string()
      .valid(...Object.values(ROLE_IN_SHIFT))
      .optional()
      .messages({
        "any.only": "roleInShift must be either Cashier or Staff",
      }),

    checkIn: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
      .optional()
      .messages({
        "string.pattern.base":
          "checkIn must be in the format YYYY-MM-DD HH:mm:ss",
      }),

    checkOut: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
      .optional()
      .messages({
        "string.pattern.base":
          "checkOut must be in the format YYYY-MM-DD HH:mm:ss",
      }),
  })
    .min(1)
    .messages({
      "object.min": "At least one field is required to update",
    }),
};

export const removeEmployeeFromShiftSchema = {
  params: Joi.object({
    workShiftEmployeeId: idParams("workShiftEmployeeId"),
  }),
};

export const getAllEmployeesMonthlySalarySchema = {
  query: Joi.object({
    month: Joi.number().integer().min(1).max(12).optional().messages({
      "number.base": "Month must be a number",
      "number.integer": "Month must be an integer",
      "number.min": "Month must be between 1 and 12",
      "number.max": "Month must be between 1 and 12",
    }),

    year: Joi.number()
      .integer()
      .min(2000)
      .max(new Date().getFullYear())
      .optional()
      .messages({
        "number.base": "Year must be a number",
        "number.integer": "Year must be an integer",
        "number.min": "Year must be greater than or equal to 2000",
        "number.max": "Year cannot be greater than the current year",
      }),
  }),
};

export const getWorkShiftEmployeeDetailSchema = {
  params: Joi.object({
    employeeId: idParams("employeeId"),
  }),
};
