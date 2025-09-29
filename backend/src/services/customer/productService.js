import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  Category,
  Product,
  ProductImage,
  ProductVarient,
} from "../../models/index.js";

const getProductsByFilterService = async (cateId) => {
  try {
    const category = await Category.findByPk(cateId);
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Danh mục không tồn tại!");
    }
    const productsFilter = await Product.findAll({
      where: { categoryId: cateId },
      include: [
        {
          model: ProductVarient,
          as: "varients",
        },
        {
          model: ProductImage,
          as: "images",
        },
      ],
    });
    return productsFilter;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const productCustomerService = {
  getProductsByFilterService,
};
export default productCustomerService;
