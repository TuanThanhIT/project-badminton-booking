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
import axios from "axios";
import { col, fn, Op } from "sequelize";
import { SORT_OPTIONS } from "../../constants/productConstant.js";
import NotFoundError from "../../errors/NotFoundError.js";
import InternalServerError from "../../errors/InternalServerError.js";

const getSortOption = (sort) => {
  return SORT_OPTIONS[sort] || [];
};

const formatProductCards = async (products) => {
  return Promise.all(
    products.map(async (p) => {
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

      return {
        ...p.toJSON(),
        discount,
        minDiscountedPrice,
        totalStock,
        isNew: diffDays <= 15,
      };
    }),
  );
};

const getProductCardsByIds = async (ids) => {
  const safeIds = ids.map(Number).filter(Boolean);
  if (safeIds.length === 0) return [];

  const products = await Product.findAll({
    where: { id: { [Op.in]: safeIds } },
    attributes: [
      "id",
      "productName",
      "brand",
      "thumbnailUrl",
      "createdAt",
      [fn("MIN", col("variants.price")), "minPrice"],
      [fn("SUM", col("variants->stocks.stock")), "totalStock"],
    ],
    include: [
      {
        model: ProductVariant,
        as: "variants",
        attributes: [],
        include: [
          {
            model: VariantStock,
            as: "stocks",
            attributes: [],
          },
        ],
        required: true,
      },
      {
        model: Category,
        as: "category",
        attributes: ["id", "cateName", "menuGroup"],
      },
    ],
    group: ["Product.id"],
    raw: false,
    nest: true,
  });

  const formatted = await formatProductCards(products);
  const byId = new Map(formatted.map((product) => [Number(product.id), product]));
  return safeIds.map((id) => byId.get(id)).filter(Boolean);
};

const readNumberEnv = (key, fallback) => {
  const value = Number(process.env[key] ?? fallback);
  return Number.isFinite(value) ? value : fallback;
};

const getImageSearchMinScore = ({ hasImage }) =>
  hasImage
    ? readNumberEnv("IMAGE_SEARCH_MIN_SCORE", 0.25)
    : readNumberEnv("IMAGE_SEARCH_TEXT_MIN_SCORE", 0.35);

const isLowQualityTextSearch = (query) => {
  const text = String(query || "").trim().toLowerCase();
  if (!text) return false;

  const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const tokens = normalized.match(/[a-z0-9]+/g) || [];
  if (tokens.length === 0) return true;

  const compact = tokens.join("");
  return /^(.)\1{3,}$/.test(compact) || tokens.every((token) => /(.)\1{3,}/.test(token));
};

const normalizeSearchText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

const parseVietnamesePrice = (rawValue) => {
  const value = String(rawValue || "").trim().toLowerCase().replace(/\s+/g, "");
  const millionMatch = value.match(/^(\d+(?:[.,]\d+)?)(?:tr|trieu|m|million)$/i);
  if (millionMatch) {
    return Math.round(Number(millionMatch[1].replace(",", ".")) * 1000000);
  }

  const thousandMatch = value.match(/^(\d+(?:[.,]\d+)?)(?:k|nghin)$/i);
  if (thousandMatch) {
    return Math.round(Number(thousandMatch[1].replace(",", ".")) * 1000);
  }

  const digits = value.replace(/[^\d]/g, "");
  const number = Number(digits);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const COLOR_RULES = [
  { key: "black", values: ["Đen"], aliases: ["den", "mau den", "black"] },
  { key: "white", values: ["Trắng"], aliases: ["trang", "mau trang", "white"] },
  {
    key: "blue",
    values: ["Xanh dương"],
    aliases: ["xanh duong", "xanh bien", "navy", "blue"],
  },
  {
    key: "green",
    values: ["Xanh lá"],
    aliases: ["xanh la", "xanh luc", "green"],
  },
  { key: "red", values: ["Đỏ"], aliases: ["do", "mau do", "red"] },
  { key: "yellow", values: ["Vàng"], aliases: ["vang", "mau vang", "yellow"] },
  { key: "orange", values: ["Cam"], aliases: ["cam", "mau cam", "orange"] },
  { key: "pink", values: ["Hồng"], aliases: ["hong", "mau hong", "pink"] },
  { key: "purple", values: ["Tím"], aliases: ["tim", "mau tim", "purple"] },
  { key: "gray", values: ["Xám"], aliases: ["xam", "ghi", "mau xam", "gray", "grey"] },
  { key: "brown", values: ["Nâu"], aliases: ["nau", "mau nau", "brown"] },
];

const parseTextColor = (normalizedQuery) =>
  COLOR_RULES.find((rule) =>
    rule.aliases.some((alias) => (
      new RegExp(`(^|\\W)${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`).test(normalizedQuery)
    )),
  ) || null;

const parseTextSearchConstraints = (query) => {
  const normalized = normalizeSearchText(query);
  const constraints = {
    category: null,
    color: null,
    maxPrice: null,
    minPrice: null,
  };

  const categoryRules = [
    {
      key: "shoe",
      menuGroup: "giay cau long",
      includes: ["giay cau long", "giay danh cau", "doi giay"],
      excludes: ["lot giay", "de lot"],
    },
    {
      key: "insole",
      cateName: "lot giay",
      includes: ["lot giay", "de lot"],
    },
    {
      key: "racket",
      menuGroup: "vot cau long",
      includes: ["vot cau long", "cay vot", "vot danh cau"],
    },
    {
      key: "shirt",
      menuGroup: "ao cau long",
      includes: ["ao cau long", "ao the thao", "ao danh cau"],
    },
    {
      key: "shorts",
      menuGroup: "quan cau long",
      includes: ["quan cau long", "quan danh cau"],
    },
    {
      key: "skirt",
      menuGroup: "vay cau long",
      includes: ["vay cau long", "vay danh cau"],
    },
    {
      key: "backpack",
      menuGroup: "balo cau long",
      includes: ["balo cau long", "ba lo cau long"],
    },
    {
      key: "bag",
      menuGroup: "tui vot cau long",
      includes: ["tui vot cau long", "tui cau long", "tui dung vot"],
      excludes: ["balo", "ba lo"],
    },
    {
      key: "shuttle",
      cateName: "qua cau long",
      includes: ["qua cau long", "ong cau long"],
    },
    {
      key: "string",
      cateName: "cuoc dan vot",
      includes: ["cuoc dan vot", "day cuoc", "cuoc cau long"],
    },
    {
      key: "socks",
      cateName: "vo cau long",
      includes: ["vo cau long", "tat cau long"],
    },
  ];

  constraints.category = categoryRules.find((rule) => {
    const hasInclude = rule.includes.some((token) => normalized.includes(token));
    const hasExclude = rule.excludes?.some((token) => normalized.includes(token));
    return hasInclude && !hasExclude;
  }) || null;
  constraints.color = parseTextColor(normalized);

  const priceToken = "(\\d[\\d.,]*(?:\\s*(?:tr|trieu|m|million|k|nghin))?)";
  const maxPatterns = [
    new RegExp(`(?:gia\\s*)?(?:duoi|nho hon|be hon|khong qua|toi da|<=|<)\\s*${priceToken}`, "i"),
    new RegExp(`${priceToken}\\s*(?:tro xuong|do lai)`, "i"),
  ];
  const minPatterns = [
    new RegExp(`(?:gia\\s*)?(?:tren|lon hon|cao hon|tu|>=|>)\\s*${priceToken}`, "i"),
    new RegExp(`${priceToken}\\s*(?:tro len)`, "i"),
  ];
  const rangeMatch = normalized.match(
    new RegExp(`(?:tu|trong khoang)\\s*${priceToken}\\s*(?:den|-|toi)\\s*${priceToken}`, "i"),
  );

  if (rangeMatch) {
    constraints.minPrice = parseVietnamesePrice(rangeMatch[1]);
    constraints.maxPrice = parseVietnamesePrice(rangeMatch[2]);
  } else {
    for (const pattern of maxPatterns) {
      const match = normalized.match(pattern);
      if (match) {
        constraints.maxPrice = parseVietnamesePrice(match[1]);
        break;
      }
    }
    for (const pattern of minPatterns) {
      const match = normalized.match(pattern);
      if (match) {
        constraints.minPrice = parseVietnamesePrice(match[1]);
        break;
      }
    }
  }

  return constraints;
};

const productMatchesTextConstraints = (product, constraints) => {
  const category = product.category || {};
  const menuGroup = normalizeSearchText(category.menuGroup);
  const cateName = normalizeSearchText(category.cateName);

  if (constraints.category?.menuGroup && !menuGroup.includes(constraints.category.menuGroup)) {
    return false;
  }
  if (constraints.category?.cateName && !cateName.includes(constraints.category.cateName)) {
    return false;
  }

  const displayPrice = Number(product.minDiscountedPrice ?? product.minPrice ?? 0);
  if (constraints.maxPrice && displayPrice > constraints.maxPrice) return false;
  if (constraints.minPrice && displayPrice < constraints.minPrice) return false;

  return true;
};

const getFallbackProductIdsByTextConstraints = async (constraints, limit, excludeIds = []) => {
  if (
    !constraints.category &&
    !constraints.color &&
    !constraints.maxPrice &&
    !constraints.minPrice
  ) {
    return [];
  }

  let categoryIds = [];
  if (constraints.category) {
    const categories = await Category.findAll({
      attributes: ["id", "cateName", "menuGroup"],
      raw: true,
    });
    categoryIds = categories
      .filter((category) => {
        const menuGroup = normalizeSearchText(category.menuGroup);
        const cateName = normalizeSearchText(category.cateName);
        if (
          constraints.category.menuGroup &&
          !menuGroup.includes(constraints.category.menuGroup)
        ) {
          return false;
        }
        if (
          constraints.category.cateName &&
          !cateName.includes(constraints.category.cateName)
        ) {
          return false;
        }
        return true;
      })
      .map((category) => category.id);

    if (categoryIds.length === 0) return [];
  }

  const variantWhere = {
    ...(constraints.color && { color: { [Op.in]: constraints.color.values } }),
    ...(constraints.maxPrice || constraints.minPrice
      ? {
          price: {
            ...(constraints.minPrice ? { [Op.gte]: constraints.minPrice } : {}),
            ...(constraints.maxPrice ? { [Op.lte]: constraints.maxPrice } : {}),
          },
        }
      : {}),
  };

  const products = await Product.findAll({
    where: {
      ...(categoryIds.length > 0 && { categoryId: { [Op.in]: categoryIds } }),
      ...(excludeIds.length > 0 && { id: { [Op.notIn]: excludeIds } }),
    },
    attributes: ["id", [fn("MIN", col("variants.price")), "minPrice"]],
    include: [
      {
        model: ProductVariant,
        as: "variants",
        attributes: [],
        where: variantWhere,
        required: true,
      },
    ],
    group: ["Product.id"],
    order: [[fn("MIN", col("variants.price")), "ASC"]],
    limit,
    raw: true,
  });

  return products.map((product) => product.id);
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
      throw new NotFoundError("Danh mục không tồn tại");
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
      throw new NotFoundError("Nhóm danh mục không tồn tại");
    }
  } else {
    throw new NotFoundError("Danh mục không tồn tại");
  }

  // Xử lý keyword
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
      [fn("SUM", col("variants->stocks.stock")), "totalStock"],
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
          ...(colors?.length > 0 && {
            [Op.or]: colors.flatMap((color) => [
              { color },
              { color: { [Op.like]: `${color}/%` } },
              { color: { [Op.like]: `%/${color}` } },
              { color: { [Op.like]: `%/${color}/%` } },
            ]),
          }),
          ...(materials?.length > 0 && { material: { [Op.in]: materials } }),
        },
        include: [
          {
            model: VariantStock,
            as: "stocks",
            attributes: [],
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

  const productFormatted = await formatProductCards(productsFilter);

  return { products: productFormatted, total, page: p, limit: l };
};

const searchProductsByImageService = async ({ image, query, limit }) => {
  if (!image && !query) {
    throw new NotFoundError("Vui lòng cung cấp hình ảnh hoặc nội dung tìm kiếm");
  }

  const hasImage = Boolean(image?.buffer);
  const trimmedQuery = String(query || "").trim();
  const serviceUrl = (
    process.env.AI_SERVICE_URL ||
    "http://localhost:8001"
  ).replace(/\/$/, "");
  const safeLimit = Math.min(Number(limit) || 12, 50);
  const minScore = getImageSearchMinScore({ hasImage });

  const formData = new FormData();

  if (hasImage) {
    const blob = new Blob([image.buffer], {
      type: image.mimetype || "application/octet-stream",
    });
    formData.append("image", blob, image.originalname || "search-image.jpg");
  }
  if (trimmedQuery) formData.append("query", trimmedQuery);
  formData.append("limit", String(safeLimit));

  let data;
  try {
    const response = await axios.post(`${serviceUrl}/search`, formData, {
      timeout: Number(
        process.env.IMAGE_SEARCH_TIMEOUT_MS ||
          process.env.AI_SERVICE_TIMEOUT_MS ||
          60000,
      ),
    });
    data = response.data;
  } catch (error) {
    if (["ECONNREFUSED", "ECONNABORTED", "ETIMEDOUT"].includes(error.code)) {
      throw new InternalServerError(
        "Dịch vụ tìm kiếm hình ảnh chưa sẵn sàng. Vui lòng khởi động ai-service ở port 8001.",
      );
    }
    if (error.response?.data) {
      const detail =
        error.response.data.detail ||
        error.response.data.message ||
        error.response.data;
      throw new InternalServerError(
        typeof detail === "string"
          ? detail
          : "Dịch vụ tìm kiếm hình ảnh đang gặp lỗi.",
      );
    }
    throw error;
  }

  const aiResults = Array.isArray(data?.results)
    ? data.results.filter((item) => Number(item.score) >= minScore)
    : [];
  const productIds = aiResults.map((item) => item.product_id || item.productId);
  const products = await getProductCardsByIds(productIds);
  const scoreById = new Map(
    aiResults.map((item) => [Number(item.product_id || item.productId), item]),
  );

  return {
    products: products.map((product) => ({
      ...product,
      imageSearch: scoreById.get(Number(product.id)) || null,
    })),
    total: products.length,
    page: 1,
    limit: safeLimit,
    query: data?.query || trimmedQuery || null,
    desiredColor: data?.desired_color || null,
    minScore,
    searchMode: data?.search_mode || null,
    appliedFilters: data?.applied_filters || null,
  };
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
    throw new NotFoundError("Sản phẩm không tồn tại");
  }

  const variantsFormatted = product.variants.map((v) => {
    const variant = v.toJSON();

    const discountPrice =
      variant.price - (variant.price * variant.discount) / 100;

    const totalStock = variant.stocks.reduce((total, s) => total + s.stock, 0);

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

  // Tính rating trung bình của toàn bộ đánh giá sản phẩm.
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
  searchProductsByImageService,
};

export default productService;
