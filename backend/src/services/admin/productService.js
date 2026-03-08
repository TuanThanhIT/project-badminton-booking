import sequelize from "../../config/db.js";
import {
  Category,
  Product,
  ProductImage,
  ProductVarient,
} from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";

const createProductService = async (data) => {
  const { productName, brand, description, thumbnailUrl, categoryId } = data;
  return sequelize.transaction(async (t) => {
    const category = await Category.findByPk(categoryId, { transaction: t });
    if (!category) {
      throw new NotFoundError("Danh mục không tồn tại");
    }
    const product = await Product.create(
      {
        productName,
        brand,
        description,
        thumbnailUrl,
        categoryId,
      },
      { transaction: t },
    );
    return product;
  });
};

const createProductVariantService = async (data) => {
  const { sku, price, stock, discount, color, size, material, productId } =
    data;
  return sequelize.transaction(async (t) => {
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      throw new NotFoundError("Sản phẩm không tồn tại");
    }
    const productVarient = await ProductVarient.create(
      {
        sku,
        price,
        stock,
        discount,
        color,
        size,
        material,
        productId,
      },
      { transaction: t },
    );
    return productVarient;
  });
};

const getProductVariantByIdService = async (data) => {
  const { variantId } = data;
  const variant = await ProductVarient.findByPk(variantId);
  if (!variant) {
    throw new NotFoundError("Biến thể sản phẩm không tồn tại");
  }
  return variant;
};

const updateProductVariantService = async (data) => {
  const { variantId, updateData } = data;
  return sequelize.transaction(async (t) => {
    const variant = await ProductVarient.findByPk(variantId, {
      transaction: t,
    });
    if (!variant) {
      throw new NotFoundError("Biến thể không tồn tại");
    }
    await variant.update(updateData, { transaction: t });
    return variant;
  });
};

const getProductVariantsByProductIdService = async (data) => {
  const { productId } = data;
  const product = await Product.findByPk(productId);
  if (!product) {
    throw new NotFoundError("Sản phẩm không tồn tại");
  }
  const varients = await ProductVarient.findAll({
    where: { productId },
  });
  return varients;
};

const deleteProductVariantService = async (data) => {
  const { variantId } = data;
  return sequelize.transaction(async (t) => {
    const variant = await ProductVarient.findByPk(variantId, {
      transaction: t,
    });
    if (!variant) {
      throw new NotFoundError("Biến thể không tồn tại");
    }
    await variant.destroy();
  });
};

const createProductImagesService = async (data) => {
  const { imageUrls, productId } = data;
  return sequelize.transaction(async (t) => {
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      throw new NotFoundError("Sản phẩm không tồn tại");
    }

    if (imageUrls.length === 0) {
      throw new BadRequestError("Chưa có ảnh nào được upload");
    }

    const productImages = await Promise.all(
      imageUrls.map((imageUrl) =>
        ProductImage.create(
          {
            imageUrl,
            productId,
          },
          { transaction: t },
        ),
      ),
    );

    return productImages;
  });
};

const getAllProductsService = async () => {
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
};

const getProductsService = async (data) => {
  const { page, limit, search } = data;
  const p = page ?? 1;
  const l = limit ?? 10;
  const offset = (p - 1) * l;

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
          `(SELECT IFNULL(SUM(stock), 0) FROM ProductVarients WHERE ProductVarients.productId = Product.id)`,
        ),
        "stock",
      ],
    ],
    include: [
      {
        association: "category",
        attributes: ["id", "cateName"],
      },
    ],
    where: whereCondition,
    order: [["createdDate", "DESC"]],
    limit: l,
    offset,
  });

  const totalPages = Math.ceil(totalItems / l);

  return {
    products,
    pagination: {
      currentPage: p,
      totalPages,
      totalItems,
      itemsPerPage: l,
      hasNextPage: p < totalPages,
      hasPrevPage: p > 1,
    },
  };
};

const getProductByIdService = async (data) => {
  const { productId } = data;
  const product = await Product.findOne({
    where: { id: productId },
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "cateName"],
      },
    ],
  });

  if (!product) {
    throw new NotFoundError("Sản phẩm không tồn tại");
  }

  return product;
};

const updateProductService = async (data) => {
  const { productId, updateData } = data;
  return sequelize.transaction(async (t) => {
    // Kiểm tra sản phẩm
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      throw new NotFoundError("Sản phẩm không tồn tại");
    }

    // Kiểm tra category
    if (updateData.categoryId) {
      const category = await Category.findByPk(updateData.categoryId, {
        transaction: t,
      });
      if (!category) {
        throw new NotFoundError("Danh mục không tồn tại");
      }
    }
    // Cập nhật sản phẩm
    await product.update(updateData, { transaction: t });
    return product;
  });
};

const deleteProductImageService = async (data) => {
  const { imageId } = data;
  return sequelize.transaction(async (t) => {
    const image = await ProductImage.findByPk(imageId, { transaction: t });
    if (!image) {
      throw new NotFoundError("Ảnh không tồn tại");
    }
    await image.destroy();
  });
};

const updateProductImageService = async (data) => {
  const { imageId, updateData } = data;
  return sequelize.transaction(async (t) => {
    const image = await ProductImage.findByPk(imageId, { transaction: t });
    if (!image) {
      throw new NotFoundError("Ảnh không tồn tại");
    }
    await image.update(updateData, { transaction: t });
    return image;
  });
};

const getProductImagesService = async (data) => {
  const { productId } = data;
  const images = await ProductImage.findAll({
    where: { productId },
  });
  return images;
};

const productAdminService = {
  createProductService,
  createProductVariantService,
  getProductVariantByIdService,
  updateProductVariantService,
  createProductImagesService,
  getAllProductsService,
  getProductVariantsByProductIdService,
  getProductsService,
  getProductImagesService,
  getProductByIdService,
  updateProductService,
  updateProductImageService,
  deleteProductVariantService,
  deleteProductImageService,
};
export default productAdminService;
