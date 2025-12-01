import productService from "../../services/employee/productService.js";

const getProducts = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    const products = await productService.getProductsService(keyword);
    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

const productController = {
  getProducts,
};

export default productController;
