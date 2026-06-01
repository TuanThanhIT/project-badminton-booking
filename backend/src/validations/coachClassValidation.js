import Joi from "joi";
import { idParams } from "./common/numberField.js";
import { pageField, limitField } from "./common/paginationFields.js";
import { ENROLLMENT_STATUS } from "../constants/classConstant.js";

export const postIdParamSchema = {
  params: Joi.object({
    postId: idParams("postId"),
  }),
};

export const enrollmentIdParamSchema = {
  params: Joi.object({
    enrollmentId: idParams("enrollmentId"),
  }),
};

export const getCoachEnrollmentsSchema = {
  query: Joi.object({
    page: pageField,
    limit: limitField,
    postId: Joi.number().integer().positive().optional(),
    status: Joi.string()
      .valid(...Object.values(ENROLLMENT_STATUS))
      .optional(),
  }),
};

export const getMyEnrollmentsSchema = {
  query: Joi.object({
    page: pageField,
    limit: limitField,
    status: Joi.string()
      .valid(...Object.values(ENROLLMENT_STATUS))
      .optional(),
  }),
};

export const updateEnrollmentSchema = {
  params: Joi.object({
    enrollmentId: idParams("enrollmentId"),
  }),
  body: Joi.object({
    status: Joi.string()
      .valid(...Object.values(ENROLLMENT_STATUS))
      .required(),
    coachNote: Joi.string().max(500).allow("", null).optional(),
    rejectReason: Joi.string().max(500).allow("", null).optional(),
  }),
};

export const addMemberSchema = {
  params: Joi.object({
    postId: idParams("postId"),
  }),
  body: Joi.object({
    studentUserId: idParams("studentUserId"),
  }),
};

export const notifyClassSchema = {
  params: Joi.object({
    postId: idParams("postId"),
  }),
  body: Joi.object({
    title: Joi.string().max(255).allow("", null).optional(),
    message: Joi.string().min(1).max(1000).required(),
    alsoSendChat: Joi.boolean().optional(),
  }),
};

export const updateClassStatusSchema = {
  params: Joi.object({
    postId: idParams("postId"),
  }),
  body: Joi.object({
    action: Joi.string().valid("lock", "unlock", "end").required().messages({
      "any.only": "action phải là lock, unlock hoặc end",
    }),
  }),
};
