import categoryCustomerService from "../../services/customer/categoryService.js";
const getCategoriesByGroupName = async (req, res, next) => {
  try {
    const cateGroup =
      await categoryCustomerService.getCategoriesByGroupNameService();
    return res.status(200).json(cateGroup);
  } catch (error) {
    next(error);
  }
};

const getOtherCategoriesByGroupName = async (req, res, next) => {
  try {
    const cate_id = req.params.cate_id;
    const otherCategories =
      await categoryCustomerService.getOtherCategoriesByGroupNameService(
        cate_id
      );
    return res.status(200).json(otherCategories);
  } catch (error) {
    next(error);
  }
};

const categoryCustomerController = {
  getCategoriesByGroupName,
  getOtherCategoriesByGroupName,
};

export default categoryCustomerController;
