import Joi from "joi";
import {
  addressField,
  fullNameField,
  phoneNumberField,
} from "./common/userFields.js";
import {
  emailField,
  passwordField,
  usernameField,
} from "./common/authFields.js";
import { idParams } from "./common/numberField.js";
import { thumbnailUrlField } from "./common/urlField.js";

export const updateProfileSchema = {
  body: Joi.object({
    fullName: fullNameField,
    dob: Joi.date().less("now").messages({
      "date.base": "Date of birth must be a valid date",
      "date.less": "Date of birth must be in the past",
    }),
    gender: Joi.string().valid("male", "female", "other").optional().messages({
      "any.only": "Gender must be male, female or other",
    }),
    address: addressField,
    phoneNumber: phoneNumberField,
    avatar: thumbnailUrlField,
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided to update profile",
    }),
};

export const updateUserInfoSchema = {
  body: Joi.object({
    fullName: fullNameField,
    address: addressField,
    phoneNumber: phoneNumberField,
  })
    .min(1)
    .messages({
      "object.min":
        "At least one field must be provided to update user information",
    }),
};

export const createUserSchema = {
  body: Joi.object({
    username: usernameField,
    password: passwordField,
    email: emailField,
  }),
};

export const getUsersByRoleSchema = {
  params: Joi.object({
    roleId: idParams("roleId"),
  }),
};

export const lockUserSchema = {
  params: Joi.object({
    userId: idParams("userId"),
  }),
};

export const unlockUserSchema = {
  params: Joi.object({
    userId: idParams("userId"),
  }),
};
