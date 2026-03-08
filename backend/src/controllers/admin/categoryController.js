import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import categoryAdminService from "../../services/admin/categoryService.js";

const createCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const category = await categoryAdminService.createCategoryService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Tạo danh mục sản phẩm thành công", category));
});

const getCategories = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const cates = await categoryAdminService.getCategoriesService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy tất cả danh mục thành công", cates));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { cateId } = req.params;
  const data = { cateId, ...req.body };
  const category = await categoryAdminService.updateCategoryService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật danh mục thành công", category));
});

const getListCategory = asyncHandler(async (req, res) => {
  const categories = await categoryAdminService.getListCategoryService();
  return res
    .status(200)
    .json(new SuccessResponse("Lấy tất cả danh mục thành công", categories));
});

const categoryAdminController = {
  createCategory,
  getCategories,
  updateCategory,
  getListCategory,
};
export default categoryAdminController;
