import {
  Branch,
  Category,
  Feedback,
  Product,
  ProductImage,
  ProductVariant,
  Profile,
  User,
  VariantStock,
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
    groupName,
  } = data;

  const p = Number(page) || 1;
  const l = Number(limit) || 10;

  const offset = (p - 1) * l;

  let categoryIds = [];

  if (cateId) {
    const category = await Category.findByPk(cateId);
    if (!category) {
      throw new NotFoundError("Danh muc khong ton tai");
    }
    categoryIds = [Number(cateId)];
  } else if (groupName) {
    const categories = await Category.findAll({
      where: { menuGroup: groupName },
      attributes: ["id"],
      raw: true,
    });

    categoryIds = categories.map((category) => category.id);

    if (categoryIds.length === 0) {
      throw new NotFoundError("Nhom danh muc khong ton tai");
    }
  } else {
    throw new NotFoundError("Danh muc khong ton tai");
  }

  // X? l� keyword
  const kw = keyword && keyword !== "null" ? keyword : undefined;

  const whereCondition = {
    categoryId:
      categoryIds.length === 1 ? categoryIds[0] : { [Op.in]: categoryIds },
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
      "createdAt",
      [fn("MIN", col("variants.price")), "minPrice"],
      [fn("SUM", col("variants->stocks.stock")), "totalStock"], // ?? t?ng stock
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
        },
        include: [
          {
            model: VariantStock,
            as: "stocks",
            attributes: [], // ?? QUAN TR?NG
            ...(branchIds?.length > 0 && {
              where: { branchId: { [Op.in]: branchIds } },
              required: true,
            }),
          },
        ],
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
        include: [
          {
            model: VariantStock,
            as: "stocks",
            attributes: ["stock"],
          },
        ],
      });

      const discount = variant ? variant.discount : 0;

      const minDiscountedPrice = minPrice - (minPrice * discount) / 100;

      let totalStock = 0;

      if (variant && variant.stocks) {
        totalStock = variant.stocks.reduce((sum, s) => sum + s.stock, 0);
      }

      const created = new Date(p.get("createdAt"));
      const now = new Date();
      const diffDays =
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

      const isNew = diffDays <= 15;

      return {
        ...p.toJSON(),
        discount,
        minDiscountedPrice,
        totalStock,
        isNew,
      };
    }),
  );

  return { products: productFormatted, total, page: p, limit: l };
};

const getProductDetailService = async (data) => {
  const { productId } = data;

  const product = await Product.findByPk(productId, {
    attributes: ["id", "productName", "brand", "description", "categoryId"],
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
        ],
        include: [
          {
            model: VariantStock,
            as: "stocks",
            attributes: ["id", "stock"],
            include: [
              {
                model: Branch,
                as: "branch",
                attributes: ["id", "branchName"],
              },
            ],
          },
        ],
      },
      {
        model: ProductImage,
        as: "images",
      },
    ],
  });

  if (!product) {
    throw new NotFoundError("S?n ph?m kh�ng t?n t?i");
  }

  const variantsFormatted = product.variants.map((v) => {
    const variant = v.toJSON();

    const discountPrice =
      variant.price - (variant.price * variant.discount) / 100;

    // t?ng stock
    const totalStock = variant.stocks.reduce((total, s) => total + s.stock, 0);

    // chuy?n stocks -> branches
    const branches = variant.stocks.map((s) => ({
      id: s.branch.id,
      branchName: s.branch.branchName,
      stock: s.stock,
    }));

    return {
      ...variant,
      discountPrice,
      totalStock,
      branches,
      stocks: undefined,
    };
  });

  const productDetail = {
    ...product.toJSON(),
    variants: variantsFormatted,
  };

  return productDetail;
};

const getProductFeedbacksService = async (data) => {
  const { productId, page = 1, limit = 10, rating } = data;

  const safePage = Number(page);
  const safeLimit = Number(limit);
  const offset = (safePage - 1) * safeLimit;

  const whereClause = {};

  if (rating) {
    whereClause.rating = rating;
  }

  const { rows: feedbacks, count } = await Feedback.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: ProductVariant,
        as: "variant",
        where: { productId },
        attributes: ["id", "color", "size", "material"],
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "username"],
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["fullName", "avatar"],
          },
        ],
      },
    ],
    order: [["updatedAt", "DESC"]],
    limit: safeLimit,
    offset,
  });

  // t�nh rating trung b�nh (to�n b? feedback c?a product)
  const allFeedbacks = await Feedback.findAll({
    include: [
      {
        model: ProductVariant,
        as: "variant",
        where: { productId },
        attributes: [],
      },
    ],
    attributes: ["rating"],
  });

  const totalRating = allFeedbacks.reduce((sum, item) => sum + item.rating, 0);

  const averageRating =
    allFeedbacks.length > 0
      ? Number((totalRating / allFeedbacks.length).toFixed(1))
      : 0;

  return {
    productId: Number(productId),
    totalFeedbacks: count,
    averageRating,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(count / safeLimit),

    feedbacks: feedbacks.map((fb) => ({
      id: fb.id,
      content: fb.content,
      rating: fb.rating,
      updatedAt: fb.updatedAt,

      variant: {
        id: fb.variant?.id,
        color: fb.variant?.color,
        size: fb.variant?.size,
        material: fb.variant?.material,
      },

      user: {
        id: fb.user?.id,
        username: fb.user?.username,
        fullName: fb.user?.profile?.fullName,
        avatar: fb.user?.profile?.avatar,
      },
    })),
  };
};

const productService = {
  getProductsByFilterService,
  getProductDetailService,
  getProductFeedbacksService,
};

export default productService;

