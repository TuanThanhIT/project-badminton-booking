import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Beverage } from "../../models/index.js";

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
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};
const beverageService = {
  addBeverageService,
};

export default beverageService;
