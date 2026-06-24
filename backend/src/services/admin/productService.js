import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import { Product, ProductVariant, ProductImage, Category, VariantStock, Branch } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import ConflictError from "../../errors/ConflictError.js";

const getAdminProductsService = async (data) => {
  const { page = 1, limit = 10, search, categoryId, menuGroup } = data;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where[Op.or] = [
      { productName: { [Op.like]: `%${search}%` } },
      { brand: { [Op.like]: `%${search}%` } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  const categoryInclude = {
    model: Category,
    as: "category",
    attributes: ["id", "cateName", "menuGroup"],
    ...(menuGroup ? { where: { menuGroup }, required: true } : {}),
  };

  const { rows, count } = await Product.findAndCountAll({
    where,
    attributes: ["id", "productName", "brand", "description", "thumbnailUrl", "categoryId", "createdAt"],
    include: [
      categoryInclude,
      {
        model: ProductVariant,
        as: "variants",
        attributes: ["id", "sku", "price", "discount", "color", "size", "material", "weight"],
        include: [
          {
            model: VariantStock,
            as: "stocks",
            attributes: ["stock", "branchId"],
            include: [{ model: Branch, as: "branch", attributes: ["id", "branchName"] }],
          },
        ],
      },
    ],
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  const products = rows.map((p) => {
    const prod = p.toJSON();
    const totalStock = prod.variants?.reduce((sum, v) => {
      return sum + (v.stocks?.reduce((s, st) => s + (st.stock || 0), 0) || 0);
    }, 0) || 0;
    return {
      id: prod.id,
      productName: prod.productName,
      brand: prod.brand,
      description: prod.description,
      thumbnailUrl: prod.thumbnailUrl,
      categoryId: prod.categoryId,
      cateName: prod.category?.cateName,
      menuGroup: prod.category?.menuGroup,
      variantCount: prod.variants?.length || 0,
      variants: prod.variants || [],
      totalStock,
      createdAt: prod.createdAt,
      createdDate: prod.createdAt,
    };
  });

  return { products, pagination: { page: Number(page), limit: Number(limit), total: count } };
};

const getAdminProductDetailService = async (productId) => {
  const product = await Product.findByPk(productId, {
    include: [
      { model: Category, as: "category", attributes: ["id", "cateName", "menuGroup"] },
      {
        model: ProductVariant,
        as: "variants",
        attributes: ["id", "sku", "price", "discount", "color", "size", "material", "weight"],
        include: [{
          model: VariantStock,
          as: "stocks",
          attributes: ["stock", "branchId"],
          include: [{ model: Branch, as: "branch", attributes: ["id", "branchName"] }],
        }],
      },
      { model: ProductImage, as: "images", attributes: ["id", "imageUrl"] },
    ],
  });

  if (!product) throw new NotFoundError("Không tìm thấy sản phẩm");
  return product.toJSON();
};

const createAdminProductService = async (data) => {
  const {
    productName,
    brand,
    description,
    thumbnailUrl,
    categoryId,
    imageUrls = [],
    variants = [],
  } = data;

  const category = await Category.findByPk(categoryId);
  if (!category) throw new NotFoundError("Danh mục không tồn tại");

  const existing = await Product.findOne({ where: { productName } });
  if (existing) throw new ConflictError("Tên sản phẩm đã tồn tại");

  const transaction = await sequelize.transaction();
  try {
    const product = await Product.create(
      { productName, brand, description, thumbnailUrl, categoryId },
      { transaction },
    );

    const detailImageUrls = Array.isArray(imageUrls)
      ? imageUrls.map((url) => String(url || "").trim()).filter(Boolean)
      : [];

    if (detailImageUrls.length) {
      await ProductImage.bulkCreate(
        detailImageUrls.map((imageUrl) => ({ productId: product.id, imageUrl })),
        { transaction },
      );
    }

    if (Array.isArray(variants)) {
      for (const item of variants) {
        const variant = await ProductVariant.create(
          {
            productId: product.id,
            sku: item.sku || null,
            price: Number(item.price || 0),
            discount: Number(item.discount || 0),
            color: item.color || null,
            size: item.size || null,
            material: item.material || null,
            weight: item.weight ?? 0.5,
          },
          { transaction },
        );

        await saveVariantStocks({
          variantId: variant.id,
          stocks: item.stocks,
          transaction,
        });
      }
    }

    await transaction.commit();
    return getAdminProductDetailService(product.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateAdminProductService = async (productId, data) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new NotFoundError("Không tìm thấy sản phẩm");

  if (data.productName && data.productName !== product.productName) {
    const existing = await Product.findOne({ where: { productName: data.productName, id: { [Op.ne]: productId } } });
    if (existing) throw new ConflictError("Tên sản phẩm đã tồn tại");
  }
  if (data.categoryId) {
    const category = await Category.findByPk(data.categoryId);
    if (!category) throw new NotFoundError("Danh mục không tồn tại");
  }

  await product.update(data);
  return product.toJSON();
};

const getAdminProductImagesService = async (productId) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new NotFoundError("Không tìm thấy sản phẩm");

  const images = await ProductImage.findAll({
    where: { productId },
    attributes: ["id", "imageUrl"],
    order: [["id", "ASC"]],
  });

  return images.map((image) => image.toJSON());
};

const createAdminProductImagesService = async (productId, data) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new NotFoundError("Không tìm thấy sản phẩm");

  const urls = (data.thumbnailUrls || data.imageUrls || [])
    .map((url) => String(url || "").trim())
    .filter(Boolean);

  if (!urls.length) return [];

  const images = await ProductImage.bulkCreate(
    urls.map((imageUrl) => ({ productId, imageUrl })),
  );

  return images.map((image) => image.toJSON());
};

const updateAdminProductImageService = async (imageId, data) => {
  const image = await ProductImage.findByPk(imageId);
  if (!image) throw new NotFoundError("Không tìm thấy hình ảnh sản phẩm");

  await image.update({ imageUrl: data.imageUrl || data.thumbnailUrl });
  return image.toJSON();
};

const deleteAdminProductImageService = async (imageId) => {
  const image = await ProductImage.findByPk(imageId);
  if (!image) throw new NotFoundError("Không tìm thấy hình ảnh sản phẩm");

  await image.destroy();
  return { id: Number(imageId) };
};

const getAdminProductVariantsService = async (productId) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new NotFoundError("Không tìm thấy sản phẩm");

  const variants = await ProductVariant.findAll({
    where: { productId },
    attributes: ["id", "sku", "price", "discount", "color", "size", "material", "weight", "productId"],
    include: [{
      model: VariantStock,
      as: "stocks",
      attributes: ["branchId", "stock"],
      include: [{ model: Branch, as: "branch", attributes: ["id", "branchName"] }],
    }],
    order: [["id", "ASC"]],
  });

  return variants.map((variant) => variant.toJSON());
};

const normalizeStocks = (stocks = []) => (
  Array.isArray(stocks)
    ? stocks
        .map((stock) => ({
          branchId: Number(stock.branchId),
          stock: Math.max(0, Number(stock.stock || 0)),
        }))
        .filter((stock) => Number.isInteger(stock.branchId) && stock.branchId > 0)
    : []
);

const saveVariantStocks = async ({ variantId, stocks, transaction }) => {
  const normalizedStocks = normalizeStocks(stocks);
  await VariantStock.destroy({ where: { variantId }, transaction });

  if (!normalizedStocks.length) return;

  await VariantStock.bulkCreate(
    normalizedStocks.map((stock) => ({ ...stock, variantId })),
    { transaction },
  );
};

const createAdminProductVariantService = async (productId, data) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new NotFoundError("Không tìm thấy sản phẩm");

  const transaction = await sequelize.transaction();
  try {
    const variant = await ProductVariant.create(
      {
        productId,
        sku: data.sku || null,
        price: data.price,
        discount: data.discount || 0,
        color: data.color || null,
        size: data.size || null,
        material: data.material || null,
        weight: data.weight ?? 0.5,
      },
      { transaction },
    );

    await saveVariantStocks({ variantId: variant.id, stocks: data.stocks, transaction });
    await transaction.commit();

    return ProductVariant.findByPk(variant.id, {
      include: [{
        model: VariantStock,
        as: "stocks",
        include: [{ model: Branch, as: "branch", attributes: ["id", "branchName"] }],
      }],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateAdminProductVariantService = async (variantId, data) => {
  const variant = await ProductVariant.findByPk(variantId);
  if (!variant) throw new NotFoundError("Không tìm thấy biến thể sản phẩm");

  const transaction = await sequelize.transaction();
  try {
    const updateData = {};
    ["sku", "price", "discount", "color", "size", "material", "weight"].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(data, field)) updateData[field] = data[field];
    });

    await variant.update(updateData, { transaction });
    if (Object.prototype.hasOwnProperty.call(data, "stocks")) {
      await saveVariantStocks({ variantId: variant.id, stocks: data.stocks, transaction });
    }

    await transaction.commit();

    return ProductVariant.findByPk(variant.id, {
      include: [{
        model: VariantStock,
        as: "stocks",
        include: [{ model: Branch, as: "branch", attributes: ["id", "branchName"] }],
      }],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteAdminProductVariantService = async (variantId) => {
  const variant = await ProductVariant.findByPk(variantId);
  if (!variant) throw new NotFoundError("Không tìm thấy biến thể sản phẩm");

  const transaction = await sequelize.transaction();
  try {
    await VariantStock.destroy({ where: { variantId }, transaction });
    await variant.destroy({ transaction });
    await transaction.commit();
    return { id: Number(variantId) };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getAdminProductStockBranchesService = async () => {
  const branches = await Branch.findAll({
    attributes: ["id", "branchName"],
    where: { isActive: true },
    order: [["branchName", "ASC"]],
  });

  return branches.map((branch) => branch.toJSON());
};

const deleteAdminProductService = async (productId) => {
  const product = await Product.findByPk(productId);
  if (!product) throw new NotFoundError("Không tìm thấy sản phẩm");

  await product.destroy();
  return { id: Number(productId) };
};

const getAdminCategoriesService = async () => {
  const categories = await Category.findAll({
    attributes: ["id", "cateName", "menuGroup"],
    order: [["cateName", "ASC"]],
  });
  return categories.map((c) => c.toJSON());
};

const adminProductService = {
  getAdminProductsService,
  getAdminProductDetailService,
  createAdminProductService,
  updateAdminProductService,
  deleteAdminProductService,
  getAdminCategoriesService,
  getAdminProductImagesService,
  createAdminProductImagesService,
  updateAdminProductImageService,
  deleteAdminProductImageService,
  getAdminProductVariantsService,
  createAdminProductVariantService,
  updateAdminProductVariantService,
  deleteAdminProductVariantService,
  getAdminProductStockBranchesService,
};

export default adminProductService;
