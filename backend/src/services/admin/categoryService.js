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

const getCategoryByGroupNameService = async () => {
  try {
    const categories = await Category.findAll();

    const cateGroup = categories.reduce((acc, cate) => {
      if (!acc[cate.menuGroup]) {
        acc[cate.menuGroup] = [];
      }
      acc[cate.menuGroup].push({
        id: cate.id,
        cateName: cate.cateName,
      });
      return acc;
    }, {});

    const result = Object.entries(cateGroup).map(([menuGroup, items]) => ({
      menuGroup,
      items,
    }));
    return result;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const categoryService = {
  createCategoryService,
  getCategoryByGroupNameService,
};

export default categoryService;
