import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import {
  BranchManager,
  Category,
  InventoryReceipt,
  Product,
  ProductImage,
  ProductVariant,
  VariantStock,
} from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";

const getManagerBranchId = async (managerId) => {
  const branchManager = await BranchManager.findOne({
    attributes: ["branchId"],
    where: { managerId, isActive: true },
    raw: true,
  });

  if (!branchManager) {
    throw new NotFoundError("Manager chưa được gán chi nhánh đang hoạt động");
  }

  return branchManager.branchId;
};

const normalizeVariant = (variant, branchId) => {
  const branchStock = variant.stocks?.[0];

  return {
    id: variant.id,
    sku: variant.sku,
    price: Number(variant.price || 0),
    discount: Number(variant.discount || 0),
    color: variant.color,
    size: variant.size,
    material: variant.material,
    weight: Number(variant.weight || 0),
    stockId: branchStock?.id || null,
    branchId,
    stock: Number(branchStock?.stock || 0),
  };
};

const parseStock = (stock) => {
  if (stock === undefined || stock === null || stock === "") {
    throw new BadRequestError("Stock is required");
  }

  const stockNumber = Number(stock);

  if (!Number.isInteger(stockNumber) || stockNumber < 0) {
    throw new BadRequestError("Stock must be a non-negative integer");
  }

  return stockNumber;
};

const normalizeProduct = (product, branchId, includeDetail = false) => {
  const item = product.toJSON ? product.toJSON() : product;
  const variants = item.variants?.map((variant) =>
    normalizeVariant(variant, branchId),
  ) || [];
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);

  const result = {
    id: item.id,
    productName: item.productName,
    brand: item.brand,
    description: item.description,
    thumbnailUrl: item.thumbnailUrl,
    categoryId: item.categoryId,
    category: item.category
      ? {
          id: item.category.id,
          cateName: item.category.cateName,
          menuGroup: item.category.menuGroup,
        }
      : null,
    branchId,
    variantCount: variants.length,
    totalStock,
    variants,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };

  if (includeDetail) {
    result.images = item.images || [];
  }

  return result;
};

const getProductsService = async (managerId, data = {}) => {
  const { page = 1, limit = 10, search, categoryId } = data;
  const branchId = await getManagerBranchId(managerId);
  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 10, 1);
  const offset = (pageNumber - 1) * limitNumber;

  const where = {};

  if (search) {
    where[Op.or] = [
      { productName: { [Op.like]: `%${search}%` } },
      { brand: { [Op.like]: `%${search}%` } },
    ];
  }

  if (categoryId) {
    where.categoryId = Number(categoryId);
  }

  const { rows, count } = await Product.findAndCountAll({
    where,
    attributes: [
      "id",
      "productName",
      "brand",
      "description",
      "thumbnailUrl",
      "categoryId",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "cateName", "menuGroup"],
      },
      {
        model: ProductVariant,
        as: "variants",
        attributes: [
          "id",
          "sku",
          "price",
          "discount",
          "color",
          "size",
          "material",
          "weight",
        ],
        include: [
          {
            model: VariantStock,
            as: "stocks",
            attributes: ["id", "branchId", "stock"],
            where: { branchId },
            required: false,
          },
        ],
      },
    ],
    limit: limitNumber,
    offset,
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  return {
    branchId,
    products: rows.map((product) => normalizeProduct(product, branchId)),
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total: count,
    },
  };
};

const getProductDetailService = async (managerId, productId) => {
  const branchId = await getManagerBranchId(managerId);

  const product = await Product.findByPk(productId, {
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "cateName", "menuGroup"],
      },
      {
        model: ProductVariant,
        as: "variants",
        attributes: [
          "id",
          "sku",
          "price",
          "discount",
          "color",
          "size",
          "material",
          "weight",
        ],
        include: [
          {
            model: VariantStock,
            as: "stocks",
            attributes: ["id", "branchId", "stock"],
            where: { branchId },
            required: false,
          },
        ],
      },
      {
        model: ProductImage,
        as: "images",
        attributes: ["id", "imageUrl"],
      },
    ],
  });

  if (!product) {
    throw new NotFoundError("Không tìm thấy sản phẩm");
  }

  return normalizeProduct(product, branchId, true);
};

const updateProductVariantStockService = async (managerId, variantId, data) => {
  const branchId = await getManagerBranchId(managerId);
  const stock = parseStock(data.stock);

  return sequelize.transaction(async (transaction) => {
  const variant = await ProductVariant.findByPk(variantId, {
    attributes: [
      "id",
      "productId",
      "sku",
      "price",
      "discount",
      "color",
      "size",
      "material",
      "weight",
    ],
    transaction,
  });

  if (!variant) {
    throw new NotFoundError("Không tìm thấy biến thể sản phẩm");
  }

  const [variantStock] = await VariantStock.findOrCreate({
    where: {
      variantId: Number(variantId),
      branchId,
    },
    defaults: {
      variantId: Number(variantId),
      branchId,
      stock: 0,
    },
    transaction,
  });

  const previousStock = Number(variantStock.stock || 0);
  const increasedQuantity = stock - previousStock;

  if (previousStock !== stock) {
    await variantStock.update({ stock }, { transaction });
  }

  if (increasedQuantity > 0) {
    const sellingPrice = Number(variant.price || 0);
    const importPrice = Math.round(sellingPrice * 0.8);

    await InventoryReceipt.create(
      {
        branchId,
        managerId,
        productId: variant.productId,
        variantId: Number(variantId),
        quantity: increasedQuantity,
        sellingPrice,
        importPrice,
        totalAmount: importPrice * increasedQuantity,
        previousStock,
        newStock: stock,
        note: data.note || null,
      },
      { transaction },
    );
  }

  const item = variant.toJSON();
  const updatedStock = variantStock.toJSON();
  updatedStock.stock = stock;

  return {
    ...normalizeVariant(
      {
        ...item,
        stocks: [updatedStock],
      },
      branchId,
    ),
    productId: item.productId,
  };
  });
};

export default {
  getProductsService,
  getProductDetailService,
  updateProductVariantStockService,
};
