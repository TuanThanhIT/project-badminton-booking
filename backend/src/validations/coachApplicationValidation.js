import Joi from "joi";
import { idParams } from "./common/numberField.js";
import { pageField, limitField } from "./common/paginationFields.js";
import { COACH_APPLICATION_STATUS } from "../constants/coachApplicationConstant.js";

export const submitCoachApplicationSchema = {
  body: Joi.object({
    experienceYears: Joi.number().integer().min(0).max(50).required().messages({
      "any.required": "Số năm kinh nghiệm là bắt buộc",
    }),
    certificate: Joi.string().min(2).max(500).required().messages({
      "any.required": "Thông tin chứng chỉ là bắt buộc",
    }),
    introduction: Joi.string().min(20).max(2000).required().messages({
      "any.required": "Giới thiệu bản thân là bắt buộc",
      "string.min": "Giới thiệu cần ít nhất 20 ký tự",
    }),
    phoneContact: Joi.string().max(20).allow("", null).optional(),
    certificateImages: Joi.array()
      .items(Joi.string().uri().max(1000))
      .max(5)
      .optional(),
  }),
};

export const getCoachApplicationsSchema = {
  query: Joi.object({
    page: pageField,
    limit: limitField,
    status: Joi.string()
      .valid(...Object.values(COACH_APPLICATION_STATUS))
      .optional(),
    search: Joi.string().max(100).allow("").optional(),
  }),
};

export const applicationIdParamSchema = {
  params: Joi.object({
    id: idParams("id"),
  }),
};

export const rejectCoachApplicationSchema = {
  params: Joi.object({
    id: idParams("id"),
  }),
  body: Joi.object({
    rejectReason: Joi.string().min(5).max(500).required().messages({
      "any.required": "Vui lòng nhập lý do từ chối",
    }),
  }),
};
