import { Category } from "../../models/index.js";
import { Op } from "sequelize";
import ConflictError from "../../errors/ConflictError.js";
import sequelize from "../../config/db.js";

const createCategoryService = async (data) => {
  const { cateName, menuGroup } = data;
  const category = await Category.findOne({ where: { cateName } });
  if (category) {
    throw new ConflictError("Danh mục đã tồn tại");
  }
  const newCate = await Category.create({ cateName, menuGroup });
  return newCate;
};

const getCategoriesService = async (data) => {
  const { page, limit, search } = data;
  const p = page ?? 1;
  const l = limit ?? 10;
  const offset = (p - 1) * l;
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
    limit: l,
    offset,
    order: [["createdDate", "DESC"]], // Sắp xếp theo ngày tạo mới nhất
  });

  // Tính toán pagination info
  const totalPages = Math.ceil(totalItems / l);
  const hasNextPage = p < totalPages;
  const hasPrevPage = p > 1;

  return {
    data: categories,
    pagination: {
      currentPage: p,
      totalPages,
      totalItems,
      itemsPerPage: l,
      hasNextPage,
      hasPrevPage,
    },
  };
};

const updateCategoryService = async (data) => {
  const { cateId, cateName, menuGroup } = data;
  return sequelize.transaction(async (t) => {
    const category = await Category.findByPk(cateId, { transaction: t });
    if (!category) {
      throw new NotFoundError("Không tìm thấy danh mục");
    }

    // Kiểm tra xem tên mới có bị trùng với category khác không
    if (cateName && cateName !== category.cateName) {
      const existingCategory = await Category.findOne(
        {
          where: {
            cateName,
            id: { [Op.ne]: cateId }, // Loại trừ category hiện tại
          },
        },
        { transaction: t },
      );
      if (existingCategory) {
        throw new ConflictError("Tên danh mục đã tồn tại");
      }
    }

    // Cập nhật
    const updateData = {};
    if (cateName) updateData.cateName = cateName;
    if (menuGroup) updateData.menuGroup = menuGroup;

    await category.update(updateData, { transaction: t });
    return category;
  });
};

const getListCategoryService = async () => {
  const categories = await Category.findAll({
    attributes: ["id", "cateName"],
    order: [["createdDate", "DESC"]],
  });
  return categories;
};

const categoryAdminService = {
  createCategoryService,
  getCategoriesService,
  updateCategoryService,
  getListCategoryService,
};

export default categoryAdminService;
