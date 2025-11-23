import categoryAdminService from "../../services/admin/categoryService.js";
import { StatusCodes } from "http-status-codes";

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

const getCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const result = await categoryAdminService.getCategoriesService(
      page,
      limit,
      search
    );

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Lấy danh sách category thành công",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cateName, menuGroup } = req.body;

    const updatedCategory = await categoryAdminService.updateCategoryService(
      id,
      cateName,
      menuGroup
    );

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Cập nhật category thành công",
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

const getListCategory = async (req, res, next) => {
  try {
    const categories = await categoryAdminService.getListCategoryService();
    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Lấy danh sách category thành công",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

const categoryAdminController = {
  createCategory,
  getCategories,
  updateCategory,
  getListCategory,
};
export default categoryAdminController;
