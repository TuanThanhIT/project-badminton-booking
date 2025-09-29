import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Category } from "../../models/index.js";
import { Op } from "sequelize";

const getCategoriesByGroupNameService = async () => {
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

const getOtherCategoriesByGroupNameService = async (cateId) => {
  try {
    const category = await Category.findByPk(cateId);
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Danh mục không tồn tại!");
    }

    const menuGroup = category.menuGroup;
    const otherCategories = await Category.findAll({
      where: { menuGroup: menuGroup, id: { [Op.ne]: cateId } },
      attributes: ["id", "cateName"],
    });
    return otherCategories;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const categoryCustomerService = {
  getCategoriesByGroupNameService,
  getOtherCategoriesByGroupNameService,
};

export default categoryCustomerService;
