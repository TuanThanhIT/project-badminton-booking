import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  Category,
  Product,
  ProductImage,
  ProductVarient,
} from "../../models/index.js";

const createProductService = async (
  productName,
  brand,
  description,
  thumbnailUrl,
  categoryId
) => {
  try {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Danh mục không tồn tại!");
    }

    const product = await Product.create({
      productName,
      brand,
      description,
      thumbnailUrl,
      categoryId,
    });
    return product;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const createProductVarientService = async (
  sku,
  price,
  stock,
  discount,
  color,
  size,
  material,
  productId
) => {
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tại!");
    }
    const productVarient = await ProductVarient.create({
      sku,
      price,
      stock,
      discount,
      color,
      size,
      material,
      productId,
    });
    return productVarient;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const createProductImagesService = async (imageUrls, productId) => {
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tại!");
    }

    const productImages = await Promise.all(
      imageUrls.map((imageUrl) =>
        ProductImage.create({
          imageUrl,
          productId,
        })
      )
    );

    return productImages;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const productService = {
  createProductService,
  createProductVarientService,
  createProductImagesService,
};
export default productService;
