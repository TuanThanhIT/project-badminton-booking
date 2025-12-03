import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import sequelize from "../../config/db.js";
import { Op } from "sequelize";
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

const createProductVariantService = async (
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
const getProductVariantsByProductIdService = async (productId) => {
  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tại!");
    }

    const varients = await ProductVarient.findAll({
      where: { productId },
    });

    return varients;
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

const getAllProductsService = async () => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          attributes: ["id", "cateName"],
        },
      ],
      order: [["createdDate", "DESC"]],
    });

    return products;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

export const getProductsService = async (page = 1, limit = 10, search = "") => {
  try {
    const offset = (page - 1) * limit;

    // Điều kiện search
    const whereCondition = search
      ? {
          productName: { [sequelize.Op.like]: `%${search}%` },
        }
      : {};

    // Đếm tổng số product
    const totalItems = await Product.count({ where: whereCondition });

    // Lấy danh sách product + category
    const products = await Product.findAll({
      attributes: [
        "id",
        "productName",
        "brand",
        "thumbnailUrl",
        "categoryId",
        [
          sequelize.literal(
            `(SELECT IFNULL(SUM(stock), 0) FROM ProductVarients WHERE ProductVarients.productId = Product.id)`
          ),
          "stock",
        ],
      ],
      include: [
        {
          association: "Category",
          attributes: ["id", "cateName"],
        },
      ],
      where: whereCondition,
      order: [["createdDate", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getProductByIdService = async (productId) => {
  try {
    const product = await Product.findOne({
      where: { id: productId },
      include: [
        {
          model: Category,
          attributes: ["id", "cateName"],
        },
      ],
    });

    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tại!");
    }

    return product;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const updateProductService = async (
  productId,
  productName,
  brand,
  description,
  thumbnailUrl,
  categoryId
) => {
  try {
    // Kiểm tra sản phẩm
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tại!");
    }

    // Kiểm tra category
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Danh mục không tồn tại!");
    }

    // Cập nhật sản phẩm
    await product.update({
      productName,
      brand,
      description,
      thumbnailUrl: thumbnailUrl ?? product.thumbnailUrl, // giữ ảnh cũ nếu không upload mới
      categoryId,
    });

    return product;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const productAdminService = {
  createProductService,
  createProductVariantService,
  createProductImagesService,
  getAllProductsService,
  getProductVariantsByProductIdService,
  getProductsService,
  getProductByIdService,
  updateProductService,
};
export default productAdminService;
