import Joi from "joi";
import { endDateField, startDateField } from "./common/discountFields.js";
import { dateField } from "./common/searchFields.js";
import { limitField, pageField } from "./common/paginationFields.js";

export const getDashboardOverviewSchema = {
  query: Joi.object({
    startDate: startDateField,
    endDate: endDateField,
  }),
};

export const getRevenueByDaySchema = {
  query: Joi.object({
    date: dateField,
  }),
};

export const getBookingOrderListSchema = {
  query: Joi.object({
    startDate: startDateField,
    endDate: endDateField,
    page: pageField,
    limit: limitField,
  }),
};

export const getRevenueProductSchema = {
  query: Joi.object({
    startDate: startDateField,
    endDate: endDateField,
    page: pageField,
    limit: limitField,
  }),
};

export const getRevenueBeverageSchema = {
  query: Joi.object({
    startDate: startDateField,
    endDate: endDateField,
    page: pageField,
    limit: limitField,
  }),
};
