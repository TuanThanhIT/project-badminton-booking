import Joi from "joi";
import { keywordField } from "./common/searchFields.js";

export const getAllBranchSchema = {
  query: Joi.object({
    keyword: keywordField,
  }),
};
