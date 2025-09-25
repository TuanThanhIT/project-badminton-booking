import categoryService from "../../services/admin/categoryService.js";

const createCategory = async (req, res, next) => {
  try {
    const { cateName, menuGroup } = req.body;
    const category = await categoryService.createCategoryService(
      cateName,
      menuGroup
    );
    return res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const getCategoryByGroupName = async (req, res, next) => {
  try {
    const cateGroup = await categoryService.getCategoryByGroupNameService();
    return res.status(200).json(cateGroup);
  } catch (error) {
    next(error);
  }
};
const categoryController = {
  createCategory,
  getCategoryByGroupName,
};
export default categoryController;
