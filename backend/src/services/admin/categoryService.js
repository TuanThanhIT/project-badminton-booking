import { Op } from "sequelize";
import { Category } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import ConflictError from "../../errors/ConflictError.js";

const getAdminCategoriesService = async (data) => {
  const { page = 1, limit = 20, search, menuGroup } = data;
  const offset = (page - 1) * limit;
  const where = {};
  if (search) where.cateName = { [Op.like]: `%${search}%` };
  if (menuGroup) where.menuGroup = menuGroup;

  const [{ rows, count }, groupRows, totalCategoryCount] = await Promise.all([
    Category.findAndCountAll({
      where,
      attributes: ["id", "cateName", "menuGroup", "createdAt"],
      limit: Number(limit),
      offset: Number(offset),
      order: [
        ["menuGroup", "ASC"],
        ["cateName", "ASC"],
      ],
      distinct: true,
    }),
    Category.findAll({
      attributes: ["menuGroup"],
      group: ["menuGroup"],
      order: [["menuGroup", "ASC"]],
      raw: true,
    }),
    Category.count(),
  ]);

  const menuGroups = groupRows.map((row) => row.menuGroup).filter(Boolean);

  return {
    categories: rows.map((c) => c.toJSON()),
    pagination: { page: Number(page), limit: Number(limit), total: count },
    menuGroups,
    stats: {
      totalCategories: totalCategoryCount,
      totalGroups: menuGroups.length,
      currentPageCount: rows.length,
    },
  };
};

const createAdminCategoryService = async (data) => {
  const { cateName, menuGroup } = data;

  const existing = await Category.findOne({ where: { cateName } });
  if (existing) throw new ConflictError("Tên danh mục đã tồn tại");

  const category = await Category.create({ cateName, menuGroup });
  return category.toJSON();
};

const updateAdminCategoryService = async (categoryId, data) => {
  const category = await Category.findByPk(categoryId);
  if (!category) throw new NotFoundError("Không tìm thấy danh mục");

  if (data.cateName && data.cateName !== category.cateName) {
    const existing = await Category.findOne({
      where: { cateName: data.cateName, id: { [Op.ne]: categoryId } },
    });
    if (existing) throw new ConflictError("Tên danh mục đã tồn tại");
  }

  await category.update(data);
  return category.toJSON();
};

const deleteAdminCategoryService = async (categoryId) => {
  const category = await Category.findByPk(categoryId);
  if (!category) throw new NotFoundError("Không tìm thấy danh mục");

  await category.destroy();
  return { id: Number(categoryId) };
};

const adminCategoryService = {
  getAdminCategoriesService,
  createAdminCategoryService,
  updateAdminCategoryService,
  deleteAdminCategoryService,
};

export default adminCategoryService;
