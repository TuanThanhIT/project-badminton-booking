import Joi from "joi";
import {
  addressField,
  fullNameField,
  phoneNumberField,
} from "./common/userSchema.js";

export const updateProfileSchema = {
  body: Joi.object({
    fullName: fullNameField,
    dob: Joi.date().less("now").messages({
      "date.base": "Date of birth must be a valid date",
      "date.less": "Date of birth must be in the past",
    }),
    gender: Joi.string().valid("male", "female", "other").messages({
      "any.only": "Gender must be male, female or other",
    }),
    address: addressField,
    phoneNumber: phoneNumberField,
  }).min(1), // bắt buộc phải có 1 field để update
};

export const updateUserInfoSchema = {
  body: Joi.object({
    fullName: fullNameField,
    address: addressField,
    phoneNumber: phoneNumberField,
  }).min(1),
};
