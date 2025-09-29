import categoryAdminService from "../../services/admin/categoryService.js";

const createCategory = async (req, res, next) => {
  try {
    const { cateName, menuGroup } = req.body;
    const category = await categoryAdminService.createCategoryService(
      cateName,
      menuGroup
    );
    return res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const categoryAdminController = {
  createCategory,
};
export default categoryAdminController;
