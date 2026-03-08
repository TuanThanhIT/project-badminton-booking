import { literal } from "sequelize";

export const SORT_OPTIONS = Object.freeze({
  price_asc: [[literal("minPrice"), "ASC"]],
  price_desc: [[literal("minPrice"), "DESC"]],
  newest: [["createdDate", "DESC"]],
  oldest: [["createdDate", "ASC"]],
});
