import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Product, ProductVarient } from "../../models/index.js";
import { Op } from "sequelize";

const getProductsService = async (keyword) => {
  try {
    const where = {};
    if (keyword) {
      where.productName = { [Op.like]: `%${keyword}%` };
    }
    const products = await Product.findAll({
      where,
      attributes: ["productName", "thumbnailUrl"],
      include: [
        {
          model: ProductVarient,
          as: "varients",
          attributes: ["sku", "price", "stock", "size", "color", "material"],
        },
      ],
    });

    // Flatten data đơn giản với flatMap (hay)
    return products.flatMap((product) =>
      product.varients.map((variant) => ({
        productName: product.productName,
        thumbnailUrl: product.thumbnailUrl,
        ...variant.get(), // lấy tất cả field của variant
      }))
    );
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const productService = {
  getProductsService,
};
export default productService;
