import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import categoryService from "../../services/customer/categoryService.js";

const getCategoriesByGroupName = asyncHandler(async (req, res) => {
  const cateGroup = await categoryService.getCategoriesByGroupNameService();
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy danh sách danh mục theo nhóm thành công",
        cateGroup,
      ),
    );
});

const getOtherCategoriesByGroupName = asyncHandler(async (req, res) => {
  const { cateId } = req.params;
  const data = { cateId };
  const otherCategories =
    await categoryService.getOtherCategoriesByGroupNameService(data);
  return res
    .status(200)
    .json("Lấy danh sách danh mục khác theo nhóm thành công", otherCategories);
});

const getCatesByGroupName = asyncHandler(async (req, res) => {
  const data = { groupName: req.params.group_name };
  const cates = await categoryService.getCatesByGroupNameService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy danh sách danh mục theo nhóm thành công", cates),
    );
});

const getAllGroupName = asyncHandler(async (req, res) => {
  const groupName = await categoryService.getAllGroupNameService();
  return res
    .status(200)
    .json(new SuccessResponse("Lấy nhóm danh mục thành công", groupName));
});

const categoryCustomerController = {
  getCategoriesByGroupName,
  getOtherCategoriesByGroupName,
  getCatesByGroupName,
  getAllGroupName,
};

export default categoryCustomerController;
