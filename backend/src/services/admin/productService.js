import { Op, fn, col, literal } from "sequelize";
import { Product, ProductVariant, ProductImage, Category, VariantStock } from "../../models/index.js";
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
        attributes: ["id", "price", "discount", "color", "size", "sku"],
        include: [
          { model: VariantStock, as: "stocks", attributes: ["stock", "branchId"] },
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
      totalStock,
      createdAt: prod.createdAt,
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
        include: [{ model: VariantStock, as: "stocks", attributes: ["stock", "branchId"] }],
      },
      { model: ProductImage, as: "images", attributes: ["id", "imageUrl"] },
    ],
  });

  if (!product) throw new NotFoundError("Không tìm thấy sản phẩm");
  return product.toJSON();
};

const createAdminProductService = async (data) => {
  const { productName, brand, description, thumbnailUrl, categoryId } = data;

  const category = await Category.findByPk(categoryId);
  if (!category) throw new NotFoundError("Danh mục không tồn tại");

  const existing = await Product.findOne({ where: { productName } });
  if (existing) throw new ConflictError("Tên sản phẩm đã tồn tại");

  const product = await Product.create({ productName, brand, description, thumbnailUrl, categoryId });
  return product.toJSON();
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
};

export default adminProductService;
