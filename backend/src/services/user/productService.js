import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError.js";
import {
  Category,
  Product,
  ProductImage,
  ProductVariant,
} from "../../models/index.js";
import { col, fn, Op } from "sequelize";
import { SORT_OPTIONS } from "../../constants/productConstant.js";
import NotFoundError from "../../errors/NotFoundError.js";

const getSortOption = (sort) => {
  return SORT_OPTIONS[sort] || [];
};

const getProductsByFilterService = async (data) => {
  const {
    cateId,
    prices,
    sizes,
    colors,
    materials,
    branchIds,
    excludeProductId,
    sort,
    page,
    limit,
    keyword,
  } = data;

  const p = Number(page) ?? 1;
  const l = Number(limit) ?? 10;

  const offset = (p - 1) * l;

  const category = await Category.findByPk(cateId);
  if (!category) {
    throw new NotFoundError("Danh mục không tồn tại");
  }

  // Xử lý keyword
  const kw = keyword && keyword !== "null" ? keyword : undefined;

  const whereCondition = {
    categoryId: cateId,
    ...(excludeProductId && { id: { [Op.ne]: Number(excludeProductId) } }),
    ...(kw && { productName: { [Op.like]: `%${kw}%` } }),
  };

  const productIdsPage = await Product.findAll({
    where: whereCondition,
    attributes: ["id"],
    limit: l,
    offset,
    raw: true,
  });

  const ids = productIdsPage.map((p) => p.id);
  if (ids.length === 0) {
    return { products: [], total: 0, page: p, limit: l };
  }

  const total = await Product.count({ where: whereCondition });

  const productsFilter = await Product.findAll({
    where: { id: { [Op.in]: ids } },
    attributes: [
      "id",
      "productName",
      "brand",
      "thumbnailUrl",
      "createdDate",
      [fn("MIN", col("variants.price")), "minPrice"],
    ],
    include: [
      {
        model: ProductVariant,
        as: "variants",
        attributes: [],
        where: {
          ...(prices?.length > 0 && {
            price: { [Op.between]: [prices[0], prices[1]] },
          }),
          ...(sizes?.length > 0 && { size: { [Op.in]: sizes } }),
          ...(colors?.length > 0 && { color: { [Op.in]: colors } }),
          ...(materials?.length > 0 && { material: { [Op.in]: materials } }),
          ...(branchIds?.length > 0 && {
            branchId: { [Op.in]: branchIds },
          }),
        },
        required: true,
      },
      {
        model: Category,
        as: "category",
        attributes: ["id", "cateName"],
      },
    ],
    group: ["Product.id"],
    order: getSortOption(sort),
    raw: false,
    nest: true,
  });

  const productFormatted = await Promise.all(
    productsFilter.map(async (p) => {
      const minPrice = parseFloat(p.get("minPrice"));
      const variant = await ProductVariant.findOne({
        where: { productId: p.id, price: minPrice },
        attributes: ["discount"],
      });
      const discount = variant ? variant.discount : 0;
      const minDiscountedPrice = minPrice - (minPrice * discount) / 100;

      const created = new Date(p.get("createdDate"));
      const now = new Date();
      const diffDays =
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      const isNew = diffDays <= 15;

      return { ...p.toJSON(), discount, minDiscountedPrice, isNew };
    }),
  );

  return { products: productFormatted, total, page: p, limit: l };
};

const getProductDetailService = async (data) => {
  const { productId } = data;
  const product = await Product.findByPk(productId, {
    attributes: ["id", "productName", "brand", "description"],
    include: [
      {
        model: ProductVariant,
        as: "variants",
      },
      {
        model: ProductImage,
        as: "images",
      },
    ],
  });

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tạo!");
  }

  const variantsWithDiscount = product.variants.map((v) => {
    const discountPrice = v.price - (v.price * v.discount) / 100;
    return {
      ...v.toJSON(),
      discountPrice,
    };
  });

  const productDetail = {
    ...product.toJSON(),
    variants: variantsWithDiscount, // dùng mảng mới đã tính discountPrice
  };

  return productDetail;
};

const productService = {
  getProductsByFilterService,
  getProductDetailService,
};
export default productService;
