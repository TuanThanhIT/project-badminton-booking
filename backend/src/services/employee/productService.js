import { Product, ProductVarient } from "../../models/index.js";
import { Op } from "sequelize";

const getProductsService = async (data) => {
  const { keyword } = data;
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
        attributes: [
          "id",
          "sku",
          "price",
          "stock",
          "size",
          "color",
          "material",
        ],
      },
    ],
  });

  // Flatten data đơn giản với flatMap (hay)
  return products.flatMap((product) =>
    product.varients.map((variant) => ({
      productName: product.productName,
      thumbnailUrl: product.thumbnailUrl,
      ...variant.get(), // lấy tất cả field của variant
    })),
  );
};

const productService = {
  getProductsService,
};
export default productService;
