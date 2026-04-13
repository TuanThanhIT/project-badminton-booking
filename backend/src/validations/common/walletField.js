import Joi from "joi";

export const amountField = Joi.number()
  .integer() // VND không có số lẻ
  .min(10000) // tối thiểu 10k
  .max(50000000) // tối đa 50 triệu
  .multiple(1000) // bội số 1000 (thực tế hay dùng)
  .required()
  .messages({
    "number.base": "Amount must be a number",
    "number.integer": "Amount must be an integer",
    "number.min": "Minimum deposit is 10,000 VND",
    "number.max": "Maximum deposit is 50,000,000 VND",
    "number.multiple": "Amount must be multiple of 1,000",
    "any.required": "Amount is required",
  });
