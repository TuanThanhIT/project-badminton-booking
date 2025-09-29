import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Category } from "../../models/index.js";

const createCategoryService = async (cateName, menuGroup) => {
  try {
    const category = await Category.findOne({ where: { cateName } });
    if (category) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Danh mục đã tồn tại!");
    }
    const newCate = await Category.create({ cateName, menuGroup });
    return newCate;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const categoryAdminService = {
  createCategoryService,
};

export default categoryAdminService;
