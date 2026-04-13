import { Court } from "../../models/index.js";
import { Op } from "sequelize";

const getCourtsService = async (query) => {
  // Query hỗ trợ:
  // - /user/courts                 -> lấy tất cả sân
  // - /user/courts?ids=1,2,3       -> lấy theo danh sách id
  const rawIds = typeof query.ids === "string" ? query.ids : "";
  const ids = rawIds
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isInteger(v) && v > 0);

  const where = {};
  if (ids.length > 0) {
    where.id = { [Op.in]: ids };
  }

  const courts = await Court.findAll({
    where,
    attributes: ["id", "branchId", "courtName", "location"],
    order: [["id", "ASC"]],
  });

  return courts;
};

const courtService = {
  getCourtsService,
};

export default courtService;
