import { Beverage } from "../../models/index.js";
import { Op } from "sequelize";

const getBeveragesService = async (data) => {
  const { keyword } = data;
  const where = {};
  if (keyword) {
    where.name = { [Op.like]: `%${keyword}%` }; // tìm tên chứa keyword
  }

  const beverages = await Beverage.findAll({
    where,
    attributes: ["id", "name", "thumbnailUrl", "price", "stock"],
    order: [["name", "ASC"]], // sắp xếp theo tên nếu muốn
  });

  return beverages;
};

const beverageService = {
  getBeveragesService,
};

export default beverageService;
