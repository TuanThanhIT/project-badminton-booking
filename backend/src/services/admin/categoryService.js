import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Category } from "../../models/index.js";
import { Op } from "sequelize";

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

const getCategoriesService = async (page = 1, limit = 10, search = "") => {
  try {
    const offset = (page - 1) * limit;

    const whereCondition = search
      ? {
          [Op.or]: [
            { cateName: { [Op.like]: `%${search}%` } },
            { menuGroup: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    // Đếm tổng số records
    const totalItems = await Category.count({ where: whereCondition });

    // Lấy data với pagination
    const categories = await Category.findAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdDate", "DESC"]], // Sắp xếp theo ngày tạo mới nhất
    });

    // Tính toán pagination info
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage,
      },
    };
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || "Lỗi khi lấy danh sách category"
    );
  }
};

const updateCategoryService = async (id, cateName, menuGroup) => {
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy category!");
    }

    // Kiểm tra xem tên mới có bị trùng với category khác không
    if (cateName && cateName !== category.cateName) {
      const existingCategory = await Category.findOne({
        where: {
          cateName,
          id: { [Op.ne]: id }, // Loại trừ category hiện tại
        },
      });
      if (existingCategory) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Tên danh mục đã tồn tại!");
      }
    }

    // Cập nhật
    const updateData = {};
    if (cateName) updateData.cateName = cateName;
    if (menuGroup) updateData.menuGroup = menuGroup;

    await category.update(updateData);

    // Lấy lại data mới
    const updatedCategory = await Category.findByPk(id);
    return updatedCategory;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};
const getListCategoryService = async () => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "cateName"],
      order: [["createdDate", "DESC"]],
    });
    return categories;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || "Lỗi khi lấy danh sách category"
    );
  }
};
const categoryAdminService = {
  createCategoryService,
  getCategoriesService,
  updateCategoryService,
  getListCategoryService,
};

export default categoryAdminService;
