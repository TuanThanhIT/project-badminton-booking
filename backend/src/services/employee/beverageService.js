import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Beverage } from "../../models/index.js";
import { Op } from "sequelize";

const getBeveragesService = async (keyword) => {
  try {
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
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const beverageService = {
  getBeveragesService,
};

export default beverageService;
