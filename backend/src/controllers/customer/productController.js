import productCustomerService from "../../services/customer/productService.js";

const getProductsByFilter = async (req, res, next) => {
  try {
    const cateId = req.query.category_id;
    const productsFilter =
      await productCustomerService.getProductsByFilterService(cateId);
    return res.status(200).json(productsFilter);
  } catch (error) {
    next(error);
  }
};

const productCustomerController = {
  getProductsByFilter,
};
export default productCustomerController;
