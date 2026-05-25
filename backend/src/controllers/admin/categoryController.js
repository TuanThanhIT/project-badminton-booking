import adminCategoryService from "../../services/admin/categoryService.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";

const getCategoriesController = async (req, res) => {
  const data = await adminCategoryService.getAdminCategoriesService(req.query);
  return res.json(new SuccessResponse("Lấy danh sách danh mục thành công", data));
};

const createCategoryController = async (req, res) => {
  const data = await adminCategoryService.createAdminCategoryService(req.body);
  return res.status(201).json(new SuccessResponse("Tạo danh mục thành công", data));
};

const updateCategoryController = async (req, res) => {
  const data = await adminCategoryService.updateAdminCategoryService(req.params.categoryId, req.body);
  return res.json(new SuccessResponse("Cập nhật danh mục thành công", data));
};

const deleteCategoryController = async (req, res) => {
  const data = await adminCategoryService.deleteAdminCategoryService(req.params.categoryId);
  return res.json(new SuccessResponse("Xóa danh mục thành công", data));
};

const adminCategoryController = {
  getCategoriesController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
};

export default adminCategoryController;
