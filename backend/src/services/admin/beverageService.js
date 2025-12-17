import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Beverage } from "../../models/index.js";
import { Op } from "sequelize";

const addBeverageService = async (name, thumbnailUrl, price, stock) => {
  try {
    const checkBeverage = await Beverage.findOne({ where: { name } });
    if (checkBeverage) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Đồ uống này đã tồn tại!");
    }

    const beverage = await Beverage.create({
      name,
      thumbnailUrl,
      price,
      stock,
    });

    return beverage;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};
const updateBeverageService = async (beverageId, data) => {
  const beverage = await Beverage.findByPk(beverageId);

  if (!beverage) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy đồ uống!");
  }

  await beverage.update(data);

  return {
    message: "Cập nhật đồ uống thành công!",
    beverage,
  };
};

const getBeverageByIdService = async (beverageId) => {
  const beverage = await Beverage.findByPk(beverageId);

  if (!beverage) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy đồ uống!");
  }

  return beverage;
};

const getAllBeveragesService = async ({
  page = 1,
  limit = 10,
  keyword = "",
}) => {
  const offset = (page - 1) * limit;

  const { rows, count } = await Beverage.findAndCountAll({
    where: keyword
      ? {
          name: {
            [Op.like]: `%${keyword}%`,
          },
        }
      : {},
    order: [["createdDate", "DESC"]],
    limit,
    offset,
  });

  return {
    beverages: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const beverageService = {
  addBeverageService,
  updateBeverageService,
  getBeverageByIdService,
  getAllBeveragesService,
};

export default beverageService;
