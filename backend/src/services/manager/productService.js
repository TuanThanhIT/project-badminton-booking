import {
  BranchManager,
  Category,
  Product,
  ProductImage,
  ProductVariant,
  VariantStock,
} from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";

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
  const stock = Number(branchStock?.stock || 0);

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
    stock,
    stockStatus: getStockStatus(stock),
  };
};

const getStockStatus = (stock) => {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= 5) return "LOW_STOCK";
  return "IN_STOCK";
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
    stockStatus: getStockStatus(totalStock),
    variants,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };

  if (includeDetail) {
    result.images = item.images || [];
  }

  return result;
};

const getProductCategoriesService = async () => {
  const categories = await Category.findAll({
    attributes: ["id", "cateName", "menuGroup"],
    order: [
      ["menuGroup", "ASC"],
      ["cateName", "ASC"],
    ],
  });

  return categories.map((category) => category.toJSON());
};

const getProductsService = async (managerId, data = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    keyword,
    categoryId,
    brand,
    stockStatus,
  } = data;
  const branchId = await getManagerBranchId(managerId);
  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 10, 1);
  const keywordText = String(keyword || search || "").trim().toLowerCase();

  const where = {};

  if (categoryId) {
    where.categoryId = Number(categoryId);
  }

  const rows = await Product.findAll({
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
    order: [["createdAt", "DESC"]],
  });

  let products = rows.map((product) => normalizeProduct(product, branchId));

  if (keywordText) {
    products = products.filter((product) => {
      const text = [
        product.productName,
        product.brand,
        ...product.variants.map((variant) => variant.sku || ""),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(keywordText);
    });
  }

  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))].sort();

  if (brand) {
    products = products.filter((product) => product.brand === String(brand));
  }

  if (stockStatus) {
    products = products.filter((product) => product.stockStatus === stockStatus);
  }

  const count = products.length;
  const offset = (pageNumber - 1) * limitNumber;
  const pagedProducts = products.slice(offset, offset + limitNumber);

  return {
    branchId,
    products: pagedProducts,
    brands,
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

export default {
  getProductCategoriesService,
  getProductsService,
  getProductDetailService,
};
