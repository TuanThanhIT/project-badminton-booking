import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import categoryService from "../../services/user/cateService.js";

const getCategoriesGroupedByMenuGroupController = asyncHandler(
  async (req, res) => {
    const cateGroup =
      await categoryService.getCategoriesGroupedByMenuGroupService();
    return res
      .status(200)
      .json(
        new SuccessResponse(
          "Lấy danh sách danh mục theo nhóm thành công",
          cateGroup,
        ),
      );
  },
);

const getOtherCategoriesInSameGroupController = asyncHandler(
  async (req, res) => {
    const { cateId } = req.params;
    const data = { cateId };
    const otherCategories =
      await categoryService.getOtherCategoriesInSameGroupService(data);
    return res
      .status(200)
      .json(
        "Lấy danh sách danh mục khác theo nhóm thành công",
        otherCategories,
      );
  },
);

const getCategoriesByMenuGroupController = asyncHandler(async (req, res) => {
  const data = { groupName: req.params.groupName };
  const cates = await categoryService.getCategoriesByMenuGroupService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy danh sách danh mục theo nhóm thành công", cates),
    );
});

const getAllMenuGroupsController = asyncHandler(async (req, res) => {
  const groupName = await categoryService.getAllMenuGroupsService();
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy tất cả nhóm danh mục thành công", groupName),
    );
});

const categoryController = {
  getAllMenuGroupsController,
  getCategoriesByMenuGroupController,
  getCategoriesGroupedByMenuGroupController,
  getOtherCategoriesInSameGroupController,
};

export default categoryController;
