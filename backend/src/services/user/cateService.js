import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { Category } from "../../models/index.js";

const getCategoriesGroupedByMenuGroupService = async () => {
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
};

const getOtherCategoriesInSameGroupService = async (data) => {
  const { cateId } = data;
  return sequelize.transaction(async (t) => {
    const category = await Category.findByPk(cateId, { transaction: t });
    if (!category) {
      throw new NotFoundError("Danh mục không tồn tại");
    }

    const menuGroup = category.menuGroup;
    const otherCategories = await Category.findAll({
      where: { menuGroup: menuGroup, id: { [Op.ne]: cateId } },
      attributes: ["id", "cateName"],
    });
    return otherCategories;
  });
};

const getCategoriesByMenuGroupService = async (data) => {
  const { groupName } = data;
  const categories = await Category.findAll({
    where: { menuGroup: groupName },
    attributes: ["id", "cateName"],
  });
  return categories;
};

const getAllMenuGroupsService = async () => {
  const categories = await Category.findAll();
  const cateGroups = [];
  categories.map((cate) => {
    if (!cateGroups.includes(cate.menuGroup)) {
      cateGroups.push(cate.menuGroup);
    }
  });
  return cateGroups;
};

const categoryService = {
  getAllMenuGroupsService,
  getCategoriesByMenuGroupService,
  getOtherCategoriesInSameGroupService,
  getCategoriesGroupedByMenuGroupService,
};

export default categoryService;
