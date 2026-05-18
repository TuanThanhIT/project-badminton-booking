import { col, fn, literal, Op } from "sequelize";
import {
  Branch,
  BranchImage,
  Booking,
  Category,
  Discount,
  Feedback,
  Order,
  OrderDetail,
  Product,
  ProductVariant,
  Profile,
  User,
  VariantStock,
} from "../../models/index.js";

import { ORDER_STATUS } from "../../constants/orderConstant.js";
import { BOOKING_STATUS } from "../../constants/bookingConstant.js";
import { DISCOUNT_APPLY_TYPE } from "../../constants/discountConstant.js";

const bannerSlides = [
  {
    id: 1,
    title: "Đặt sân cầu lông nhanh hơn mỗi ngày",
    subtitle:
      "Chọn chi nhánh, xem lịch trống và giữ sân online trong vài thao tác.",
    imageUrl: "/img/banner2.webp",
    primaryAction: { label: "Đặt sân ngay", href: "/branches" },
    secondaryAction: { label: "Mua sắm dụng cụ", href: "/products" },
  },
  {
    id: 2,
    title: "Dụng cụ cầu lông chính hãng",
    subtitle: "Vợt, giày, áo quần và phụ kiện từ các nhóm sản phẩm phổ biến.",
    imageUrl: "/img/banner1.webp",
    primaryAction: { label: "Khám phá shop", href: "/products" },
    secondaryAction: { label: "Xem danh mục", href: "/products" },
  },
  {
    id: 3,
    title: "Sân tốt, lịch rõ, thanh toán gọn.",
    subtitle:
      "Trải nghiệm đặt sân và mua hàng tập trung trên một tài khoản B-Hub.",
    imageUrl: "/img/banner3.webp",
    primaryAction: { label: "Tìm chi nhánh", href: "/branches" },
    secondaryAction: { label: "Xem sản phẩm", href: "/products" },
  },
];

const badmintonCategories = [
  {
    id: 1,
    title: "Vợt cầu lông",
    groupName: "Vợt cầu lông",
    imageUrl: "/img/votcaulong.webp",
  },
  {
    id: 2,
    title: "Giày cầu lông",
    groupName: "Giày cầu lông",
    imageUrl: "/img/giaycaulong.webp",
  },
  {
    id: 3,
    title: "Áo cầu lông",
    groupName: "Áo cầu lông",
    imageUrl: "/img/aocaulong.webp",
  },
  {
    id: 4,
    title: "Váy cầu lông",
    groupName: "Váy cầu lông",
    imageUrl: "/img/vaycaulong.webp",
  },
  {
    id: 5,
    title: "Quần cầu lông",
    groupName: "Quần cầu lông",
    imageUrl: "/img/quancaulong.webp",
  },
  {
    id: 6,
    title: "Túi vợt cầu lông",
    groupName: "Túi vợt cầu lông",
    imageUrl: "/img/tuivotcaulong.webp",
  },
  {
    id: 7,
    title: "Balo cầu lông",
    groupName: "Balo cầu lông",
    imageUrl: "/img/balocaulong.webp",
  },
  {
    id: 8,
    title: "Phụ kiện cầu lông",
    groupName: "Phụ kiện cầu lông",
    imageUrl: "/img/phukiencaulong.webp",
  },
];

const toNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  return Number.isNaN(num) ? defaultValue : num;
};

const roundRating = (value) => {
  const num = Number(value || 0);
  return Number(num.toFixed(1));
};

const formatBranchAddress = (branch) =>
  [branch.address, branch.wardName, branch.districtName, branch.provinceName]
    .filter(Boolean)
    .join(", ");

const getSuccessOrderStatuses = () => {
  return [ORDER_STATUS.COMPLETED];
};

const getSuccessBookingStatuses = () => {
  return [BOOKING_STATUS.PAID, BOOKING_STATUS.COMPLETED];
};

const getCategoryGroups = async () => {
  const categoryRows = await Category.findAll({
    attributes: ["id", "cateName", "menuGroup"],
    order: [
      ["menuGroup", "ASC"],
      ["cateName", "ASC"],
    ],
  });

  const categoryMap = categoryRows.reduce((acc, category) => {
    const data = category.toJSON();

    if (!acc[data.menuGroup]) {
      acc[data.menuGroup] = {
        menuGroup: data.menuGroup,
        items: [],
      };
    }

    acc[data.menuGroup].items.push({
      id: data.id,
      cateName: data.cateName,
    });

    return acc;
  }, {});

  return Object.values(categoryMap);
};

const getProductFeedbackStatsMap = async (productIds = []) => {
  if (!productIds.length) return new Map();

  const rows = await Feedback.findAll({
    attributes: [
      [col("variant.productId"), "productId"],
      [fn("AVG", col("Feedback.rating")), "avgRating"],
      [fn("COUNT", col("Feedback.id")), "reviewCount"],
    ],
    where: {
      variantId: { [Op.ne]: null },
    },
    include: [
      {
        model: ProductVariant,
        as: "variant",
        attributes: [],
        required: true,
        where: {
          productId: { [Op.in]: productIds },
        },
      },
    ],
    group: [col("variant.productId")],
    raw: true,
  });

  return new Map(
    rows.map((row) => [
      Number(row.productId),
      {
        avgRating: roundRating(row.avgRating),
        reviewCount: toNumber(row.reviewCount),
      },
    ]),
  );
};

const formatProduct = (product, extra = {}) => {
  const data = product.toJSON();
  const variants = data.variants || [];

  const minVariant = variants.reduce((best, variant) => {
    if (!best) return variant;

    return Number(variant.price || 0) < Number(best.price || 0)
      ? variant
      : best;
  }, null);

  const minPrice = minVariant ? toNumber(minVariant.price) : 0;
  const discount = minVariant ? toNumber(minVariant.discount) : 0;
  const minDiscountedPrice = minPrice - (minPrice * discount) / 100;

  const totalStock = variants.reduce((sum, variant) => {
    const stocks = variant.stocks || [];

    return (
      sum +
      stocks.reduce((stockSum, stockItem) => {
        return stockSum + toNumber(stockItem.stock);
      }, 0)
    );
  }, 0);

  const createdDate = data.createdDate ? new Date(data.createdDate) : null;
  const now = new Date();

  const diffDays = createdDate
    ? (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    : 999;

  return {
    id: data.id,
    productName: data.productName,
    brand: data.brand,
    thumbnailUrl: data.thumbnailUrl,
    createdDate: data.createdDate,
    category: data.category || null,

    minPrice,
    discount,
    minDiscountedPrice,
    totalStock,
    isNew: diffDays <= 15,

    soldCount: toNumber(extra.soldCount),
    avgRating: roundRating(extra.avgRating),
    reviewCount: toNumber(extra.reviewCount),
  };
};

const getProductCardsByIds = async (productIds = [], extraMap = new Map()) => {
  if (!productIds.length) return [];

  const productRows = await Product.findAll({
    where: {
      id: { [Op.in]: productIds },
    },
    attributes: [
      "id",
      "productName",
      "brand",
      "thumbnailUrl",
      "categoryId",
      "createdDate",
    ],
    include: [
      {
        model: ProductVariant,
        as: "variants",
        attributes: ["id", "price", "discount", "color", "size", "material"],
        required: true,
        include: [
          {
            model: VariantStock,
            as: "stocks",
            attributes: ["stock"],
            required: false,
          },
        ],
      },
      {
        model: Category,
        as: "category",
        attributes: ["id", "cateName", "menuGroup"],
      },
    ],
  });

  const productMap = new Map(
    productRows.map((product) => [Number(product.id), product]),
  );

  return productIds
    .map((id) => {
      const product = productMap.get(Number(id));
      if (!product) return null;

      return formatProduct(product, extraMap.get(Number(id)) || {});
    })
    .filter(Boolean);
};

const getHotProducts = async (limit = 4) => {
  const successOrderStatuses = getSuccessOrderStatuses();

  const soldRows = await OrderDetail.findAll({
    attributes: [
      [col("variant.productId"), "productId"],
      [fn("SUM", col("OrderDetail.quantity")), "soldCount"],
    ],
    include: [
      {
        model: ProductVariant,
        as: "variant",
        attributes: [],
        required: true,
      },
      {
        model: Order,
        as: "order",
        attributes: [],
        required: true,
        where: {
          orderStatus: { [Op.in]: successOrderStatuses },
        },
      },
    ],
    group: [col("variant.productId")],
    order: [
      [literal("soldCount"), "DESC"],
      [col("variant.productId"), "DESC"],
    ],
    limit,
    raw: true,
  });

  if (!soldRows.length) {
    const fallbackProducts = await Product.findAll({
      attributes: ["id"],
      order: [["createdDate", "DESC"]],
      limit,
      raw: true,
    });

    const fallbackIds = fallbackProducts.map((item) => Number(item.id));
    const ratingMap = await getProductFeedbackStatsMap(fallbackIds);

    return getProductCardsByIds(fallbackIds, ratingMap);
  }

  const productIds = soldRows.map((item) => Number(item.productId));

  const soldMap = new Map(
    soldRows.map((item) => [
      Number(item.productId),
      {
        soldCount: toNumber(item.soldCount),
      },
    ]),
  );

  const ratingMap = await getProductFeedbackStatsMap(productIds);

  const extraMap = new Map(
    productIds.map((id) => [
      id,
      {
        ...(soldMap.get(id) || {}),
        ...(ratingMap.get(id) || {}),
      },
    ]),
  );

  return getProductCardsByIds(productIds, extraMap);
};

const getTopRatedProducts = async (limit = 4) => {
  const ratingRows = await Feedback.findAll({
    attributes: [
      [col("variant.productId"), "productId"],
      [fn("AVG", col("Feedback.rating")), "avgRating"],
      [fn("COUNT", col("Feedback.id")), "reviewCount"],
    ],
    where: {
      variantId: { [Op.ne]: null },
    },
    include: [
      {
        model: ProductVariant,
        as: "variant",
        attributes: [],
        required: true,
      },
    ],
    group: [col("variant.productId")],
    order: [
      [literal("avgRating"), "DESC"],
      [literal("reviewCount"), "DESC"],
      [col("variant.productId"), "DESC"],
    ],
    limit,
    raw: true,
  });

  if (!ratingRows.length) return [];

  const productIds = ratingRows.map((item) => Number(item.productId));

  const extraMap = new Map(
    ratingRows.map((item) => [
      Number(item.productId),
      {
        avgRating: roundRating(item.avgRating),
        reviewCount: toNumber(item.reviewCount),
      },
    ]),
  );

  return getProductCardsByIds(productIds, extraMap);
};

const getNewProductsByGroup = async (
  categoryGroups = [],
  limitPerGroup = 4,
) => {
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  const result = await Promise.all(
    categoryGroups.map(async (group) => {
      const categoryIds = group.items.map((item) => item.id);

      if (!categoryIds.length) {
        return {
          menuGroup: group.menuGroup,
          products: [],
        };
      }

      const productRows = await Product.findAll({
        where: {
          categoryId: { [Op.in]: categoryIds },
          createdDate: { [Op.gte]: fifteenDaysAgo },
        },
        attributes: ["id"],
        order: [["createdDate", "DESC"]],
        limit: limitPerGroup,
        raw: true,
      });

      const productIds = productRows.map((item) => Number(item.id));
      const ratingMap = await getProductFeedbackStatsMap(productIds);
      const products = await getProductCardsByIds(productIds, ratingMap);

      return {
        menuGroup: group.menuGroup,
        products,
      };
    }),
  );

  return result;
};

const getActiveDiscounts = async () => {
  const today = new Date().toISOString().slice(0, 10);

  const discountRows = await Discount.findAll({
    where: {
      isActive: true,
      startDate: { [Op.lte]: today },
      endDate: { [Op.gte]: today },
    },
    attributes: [
      "id",
      "code",
      "type",
      "applyType",
      "value",
      "maxDiscount",
      "minAmount",
      "usageLimit",
      "usageCount",
      "startDate",
      "endDate",
    ],
    order: [
      ["applyType", "ASC"],
      ["value", "DESC"],
      ["minAmount", "ASC"],
    ],
    limit: 12,
  });

  const discounts = discountRows.map((item) => item.toJSON());

  const discountsByApplyType = {
    [DISCOUNT_APPLY_TYPE.ORDER]: [],
    [DISCOUNT_APPLY_TYPE.BOOKING]: [],
    [DISCOUNT_APPLY_TYPE.ALL]: [],
  };

  discounts.forEach((discount) => {
    if (!discountsByApplyType[discount.applyType]) {
      discountsByApplyType[discount.applyType] = [];
    }

    discountsByApplyType[discount.applyType].push(discount);
  });

  return {
    discounts,
    discountsByApplyType,
  };
};

const getBranchCardsByIds = async (branchIds = [], extraMap = new Map()) => {
  if (!branchIds.length) return [];

  const branchRows = await Branch.findAll({
    where: {
      id: { [Op.in]: branchIds },
      isActive: true,
    },
    attributes: [
      "id",
      "branchName",
      "description",
      "address",
      "wardName",
      "districtName",
      "provinceName",
      "phoneNumber",
      "latitude",
      "longitude",
    ],
    include: [
      {
        model: BranchImage,
        as: "images",
        attributes: ["imageUrl"],
        required: false,
      },
    ],
  });

  const branchMap = new Map(
    branchRows.map((branch) => [Number(branch.id), branch]),
  );

  return branchIds
    .map((id) => {
      const branch = branchMap.get(Number(id));
      if (!branch) return null;

      const data = branch.toJSON();
      const extra = extraMap.get(Number(id)) || {};

      return {
        id: data.id,
        branchName: data.branchName,
        phoneNumber: data.phoneNumber,
        description: data.description,
        fullAddress: formatBranchAddress(data),
        imageUrl: data.images?.[0]?.imageUrl || "/img/branch.jpg",
        latitude: data.latitude,
        longitude: data.longitude,

        avgRating: roundRating(extra.avgRating),
        reviewCount: toNumber(extra.reviewCount),
        bookingCount: toNumber(extra.bookingCount),
        bookingRevenue: toNumber(extra.bookingRevenue),
        orderCount: toNumber(extra.orderCount),
        revenue: toNumber(extra.revenue),
      };
    })
    .filter(Boolean);
};

const getHotBranches = async (limit = 3) => {
  const scoreRows = await Feedback.findAll({
    attributes: [
      "branchId",
      [fn("AVG", col("rating")), "avgRating"],
      [fn("COUNT", col("id")), "reviewCount"],
    ],
    where: {
      branchId: { [Op.ne]: null },
    },
    group: ["branchId"],
    order: [
      [literal("avgRating"), "DESC"],
      [literal("reviewCount"), "DESC"],
      ["branchId", "DESC"],
    ],
    limit,
    raw: true,
  });

  let branchIds = scoreRows.map((item) => Number(item.branchId));

  const scoreMap = new Map(
    scoreRows.map((item) => [
      Number(item.branchId),
      {
        avgRating: roundRating(item.avgRating),
        reviewCount: toNumber(item.reviewCount),
      },
    ]),
  );

  if (!branchIds.length) {
    const fallbackBranches = await Branch.findAll({
      where: { isActive: true },
      attributes: ["id"],
      order: [["createdDate", "DESC"]],
      limit,
      raw: true,
    });

    branchIds = fallbackBranches.map((item) => Number(item.id));
  }

  return getBranchCardsByIds(branchIds, scoreMap);
};

const getMostBookedBranches = async (limit = 4) => {
  const successBookingStatuses = getSuccessBookingStatuses();

  const rows = await Booking.findAll({
    attributes: [
      "branchId",
      [fn("COUNT", col("Booking.id")), "bookingCount"],
      [fn("SUM", col("Booking.totalAmount")), "bookingRevenue"],
    ],
    where: {
      bookingStatus: { [Op.in]: successBookingStatuses },
    },
    group: ["branchId"],
    order: [
      [literal("bookingCount"), "DESC"],
      [literal("bookingRevenue"), "DESC"],
      ["branchId", "DESC"],
    ],
    limit,
    raw: true,
  });

  const branchIds = rows.map((item) => Number(item.branchId));

  const statMap = new Map(
    rows.map((item) => [
      Number(item.branchId),
      {
        bookingCount: toNumber(item.bookingCount),
        bookingRevenue: toNumber(item.bookingRevenue),
      },
    ]),
  );

  return getBranchCardsByIds(branchIds, statMap);
};

const getTopSellingBranches = async (limit = 4) => {
  const successOrderStatuses = getSuccessOrderStatuses();

  const rows = await Order.findAll({
    attributes: [
      "branchId",
      [fn("COUNT", col("Order.id")), "orderCount"],
      [fn("SUM", col("Order.totalAmount")), "revenue"],
    ],
    where: {
      orderStatus: { [Op.in]: successOrderStatuses },
    },
    group: ["branchId"],
    order: [
      [literal("revenue"), "DESC"],
      [literal("orderCount"), "DESC"],
      ["branchId", "DESC"],
    ],
    limit,
    raw: true,
  });

  const branchIds = rows.map((item) => Number(item.branchId));

  const statMap = new Map(
    rows.map((item) => [
      Number(item.branchId),
      {
        orderCount: toNumber(item.orderCount),
        revenue: toNumber(item.revenue),
      },
    ]),
  );

  return getBranchCardsByIds(branchIds, statMap);
};

const getBestSellingCategories = async (limit = 8) => {
  const successOrderStatuses = getSuccessOrderStatuses();

  const rows = await OrderDetail.findAll({
    attributes: [
      [col("variant.product.category.menuGroup"), "menuGroup"],
      [col("variant.product.category.id"), "categoryId"],
      [col("variant.product.category.cateName"), "cateName"],
      [fn("SUM", col("OrderDetail.quantity")), "soldCount"],
      [fn("COUNT", fn("DISTINCT", col("variant.product.id"))), "productCount"],
    ],
    include: [
      {
        model: ProductVariant,
        as: "variant",
        attributes: [],
        required: true,
        include: [
          {
            model: Product,
            as: "product",
            attributes: [],
            required: true,
            include: [
              {
                model: Category,
                as: "category",
                attributes: [],
                required: true,
              },
            ],
          },
        ],
      },
      {
        model: Order,
        as: "order",
        attributes: [],
        required: true,
        where: {
          orderStatus: { [Op.in]: successOrderStatuses },
        },
      },
    ],
    group: [
      col("variant.product.category.menuGroup"),
      col("variant.product.category.id"),
      col("variant.product.category.cateName"),
    ],
    order: [[literal("soldCount"), "DESC"]],
    limit,
    raw: true,
  });

  return rows.map((item) => ({
    menuGroup: item.menuGroup,
    categoryId: item.categoryId,
    cateName: item.cateName,
    soldCount: toNumber(item.soldCount),
    productCount: toNumber(item.productCount),
  }));
};

const getCustomerReviews = async (limit = 6) => {
  const rows = await Feedback.findAll({
    where: {
      rating: { [Op.gte]: 4 },
      [Op.or]: [
        { branchId: { [Op.ne]: null } },
        { variantId: { [Op.ne]: null } },
      ],
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "email"],
        required: false,
        include: [
          {
            model: Profile,
            as: "profile",
            attributes: ["fullName", "avatar"],
            required: false,
          },
        ],
      },
      {
        model: Branch,
        as: "branch",
        attributes: ["id", "branchName"],
        required: false,
      },
      {
        model: ProductVariant,
        as: "variant",
        attributes: ["id", "productId", "color", "size"],
        required: false,
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "productName", "thumbnailUrl"],
            required: false,
          },
        ],
      },
    ],
    order: [
      ["rating", "DESC"],
      ["id", "DESC"],
    ],
    limit,
  });

  return rows.map((item) => {
    const data = item.toJSON();

    return {
      id: data.id,
      targetType: data.branchId ? "BRANCH" : "PRODUCT",
      rating: data.rating,
      content:
        data.content ||
        data.comment ||
        data.feedbackContent ||
        data.description ||
        "Khách hàng hài lòng với trải nghiệm tại B-Hub.",
      createdDate: data.createdDate,

      user: {
        id: data.user?.id || null,
        fullName:
          data.user?.profile?.fullName ||
          data.user?.email ||
          "Khách hàng B-Hub",
        avatar: data.user?.profile?.avatar || null,
      },

      branch: data.branch
        ? {
            id: data.branch.id,
            branchName: data.branch.branchName,
          }
        : null,

      product: data.variant?.product
        ? {
            id: data.variant.product.id,
            productName: data.variant.product.productName,
            thumbnailUrl: data.variant.product.thumbnailUrl,
            variantInfo: [data.variant.color, data.variant.size]
              .filter(Boolean)
              .join(" / "),
          }
        : null,
    };
  });
};

const getLowStockProducts = async (limit = 4) => {
  const rows = await Product.findAll({
    attributes: [
      "id",
      [fn("SUM", col("variants->stocks.stock")), "totalStock"],
    ],
    include: [
      {
        model: ProductVariant,
        as: "variants",
        attributes: [],
        required: true,
        include: [
          {
            model: VariantStock,
            as: "stocks",
            attributes: [],
            required: true,
          },
        ],
      },
    ],
    group: ["Product.id"],
    having: literal("totalStock > 0 AND totalStock <= 10"),
    order: [[literal("totalStock"), "ASC"]],
    limit,
    raw: true,
    subQuery: false,
  });

  const productIds = rows.map((item) => Number(item.id));
  const ratingMap = await getProductFeedbackStatsMap(productIds);

  return getProductCardsByIds(productIds, ratingMap);
};

const getHomeOverviewStats = async () => {
  const successOrderStatuses = getSuccessOrderStatuses();
  const successBookingStatuses = getSuccessBookingStatuses();

  const [
    branchCount,
    productCount,
    categoryCount,
    bookingCount,
    orderCount,
    reviewCount,
    soldCountResult,
  ] = await Promise.all([
    Branch.count({ where: { isActive: true } }),
    Product.count(),
    Category.count(),

    Booking.count({
      where: {
        bookingStatus: { [Op.in]: successBookingStatuses },
      },
    }),

    Order.count({
      where: {
        orderStatus: { [Op.in]: successOrderStatuses },
      },
    }),

    Feedback.count(),

    OrderDetail.findOne({
      attributes: [[fn("SUM", col("quantity")), "totalSold"]],
      include: [
        {
          model: Order,
          as: "order",
          attributes: [],
          required: true,
          where: {
            orderStatus: { [Op.in]: successOrderStatuses },
          },
        },
      ],
      raw: true,
    }),
  ]);

  return {
    branchCount,
    productCount,
    categoryCount,
    bookingCount,
    orderCount,
    reviewCount,
    soldCount: toNumber(soldCountResult?.totalSold),
  };
};

const getHomeDataService = async () => {
  const [categoryGroups, hotProducts, topRatedProducts, discountData] =
    await Promise.all([
      getCategoryGroups(),
      getHotProducts(4),
      getTopRatedProducts(4),
      getActiveDiscounts(),
    ]);

  const [
    newProductsByGroup,
    hotBranches,
    mostBookedBranches,
    topSellingBranches,
    customerReviews,
    bestSellingCategories,
    lowStockProducts,
    overviewStats,
  ] = await Promise.all([
    getNewProductsByGroup(categoryGroups, 4),
    getHotBranches(3),
    getMostBookedBranches(4),
    getTopSellingBranches(4),
    getCustomerReviews(6),
    getBestSellingCategories(8),
    getLowStockProducts(4),
    getHomeOverviewStats(),
  ]);

  const newProducts = newProductsByGroup
    .flatMap((group) => group.products)
    .slice(0, 4);

  return {
    banners: bannerSlides,

    // Danh mục ảnh hard-code cho section dạng ảnh
    badmintonCategories,

    // Danh mục thật từ database
    categoryGroups: categoryGroups.slice(0, 8),

    // Danh mục bán chạy dựa trên OrderDetails
    bestSellingCategories,

    // Sản phẩm mới
    newProducts,
    newProductsByGroup,

    // Sản phẩm bán chạy
    products: hotProducts,
    hotProducts,

    // Sản phẩm được đánh giá cao
    topRatedProducts,

    // Sản phẩm số lượng có hạn
    lowStockProducts,

    // Discount
    discounts: discountData.discounts.slice(0, 4),
    discountsByApplyType: discountData.discountsByApplyType,

    // Chi nhánh đánh giá tốt
    branches: hotBranches,
    hotBranches,

    // Chi nhánh đặt sân nhiều
    mostBookedBranches,

    // Chi nhánh bán hàng tốt
    topSellingBranches,

    // Feedback khách hàng
    customerReviews,

    stats: {
      branchCount: overviewStats.branchCount,
      productCount: overviewStats.productCount,
      categoryGroupCount: categoryGroups.length,
      categoryCount: overviewStats.categoryCount,
      bookingCount: overviewStats.bookingCount,
      orderCount: overviewStats.orderCount,
      reviewCount: overviewStats.reviewCount,
      soldCount: overviewStats.soldCount,
    },
  };
};

const homeService = {
  getHomeDataService,
};

export default homeService;
