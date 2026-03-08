import { Category } from "../../models/index.js";
import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import NotFoundError from "../../errors/NotFoundError.js";

const getCategoriesByGroupNameService = async () => {
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

const getOtherCategoriesByGroupNameService = async (data) => {
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

const getCatesByGroupNameService = async (data) => {
  const { groupName } = data;
  const categories = await Category.findAll({
    where: { menuGroup: groupName },
    attributes: ["id", "cateName"],
  });
  return categories;
};

const getAllGroupNameService = async () => {
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
  getCategoriesByGroupNameService,
  getOtherCategoriesByGroupNameService,
  getCatesByGroupNameService,
  getAllGroupNameService,
};

export default categoryService;
