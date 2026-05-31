import Joi from "joi";
import { dateField } from "./common/searchFields.js";
import { idParams } from "./common/numberField.js";
import {
  cashField,
  shiftWageField,
  timeField,
  workDateField,
} from "./common/shiftFields.js";
import { pageField, limitField } from "./common/paginationFields.js";

const optionalTimeField = Joi.string()
  .pattern(/^\d{1,2}:\d{2}(:\d{2})?$/)
  .optional()
  .messages({
    "string.base": "Time must be a string",
    "string.pattern.base": "Invalid time format (HH:MM or HH:MM:SS)",
  });

export const getWorkShiftByDateSchema = {
  query: Joi.object({
    date: dateField.required(),
  }),
};

export const getCurrentWorkShiftSchema = {
  query: Joi.object({
    date: dateField.required(),
    time: timeField,
  }),
};

export const updateCheckInAndCashRegisterSchema = {
  params: Joi.object({
    workShiftId: idParams("workShiftId"),
  }),
  body: Joi.object({
    checkInTime: timeField,
    openingCash: cashField,
  }),
};

export const updateCheckOutAndCashRegisterSchema = {
  params: Joi.object({
    workShiftId: idParams("workShiftId"),
  }),
  body: Joi.object({
    checkOutTime: timeField,
    closingCash: cashField,
  }),
};

export const getShiftAssignmentsSchema = {
  params: Joi.object({
    workShiftId: idParams("workShiftId"),
  }),
};

export const updateShiftAssignmentTimeSchema = {
  params: Joi.object({
    workShiftId: idParams("workShiftId"),
    assignmentId: idParams("assignmentId"),
  }),
  body: Joi.object({
    checkInTime: optionalTimeField,
    checkOutTime: optionalTimeField,
  }).or("checkInTime", "checkOutTime"),
};

export const createWorkShiftSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      "string.base": "Shift name must be a string",
      "string.empty": "Shift name is required",
      "string.min": "Shift name must be at least 2 characters",
      "string.max": "Shift name must be less than or equal to 100 characters",
      "any.required": "Shift name is required",
    }),
    workDate: workDateField.required(),
    startTime: Joi.string()
      .pattern(/^\d{2}:\d{2}$/)
      .required()
      .messages({
        "string.pattern.base": "Start time must be in format HH:mm",
        "any.required": "Start time is required",
      }),
    endTime: Joi.string()
      .pattern(/^\d{2}:\d{2}$/)
      .required()
      .messages({
        "string.pattern.base": "End time must be in format HH:mm",
        "any.required": "End time is required",
      }),
    shiftWage: shiftWageField,
  }),
};

export const createWorkShiftsSchema = {
  body: Joi.object({
    workDate: workDateField.required(),
    shiftWage: shiftWageField,
  }),
};

export const getAllWorkShiftsSchema = {
  query: Joi.object({
    workDate: workDateField.optional(),
    page: pageField,
    limit: limitField,
  }),
};
