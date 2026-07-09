import { Op } from "sequelize";
import {
  Branch,
  Category,
  Product,
  ProductVariant,
  Profile,
  User,
} from "../../models/index.js";
import { POST_TYPE } from "../../constants/postConstant.js";
import { PLAYER_LEVEL } from "../../constants/userConstant.js";
import courtService from "./courtService.js";
import productService from "./productService.js";
import postService from "./postService.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { AI_TOOL_NAMES } from "../../constants/aiConstant.js";
import { getTodayInVietnam, parseNaturalDate } from "./aiBookingParser.js";
import { extractPriceConstraints, normalizeText, relaxProductTypos } from "./aiTextUtils.js";

const PLAYER_LEVEL_LABELS = {
  [PLAYER_LEVEL.BEGINNER]: "Mới bắt đầu",
  [PLAYER_LEVEL.RECREATIONAL]: "Chơi giải trí",
  [PLAYER_LEVEL.INTERMEDIATE]: "Trung bình",
  [PLAYER_LEVEL.ADVANCED]: "Khá / Nâng cao",
  [PLAYER_LEVEL.COMPETITIVE]: "Thi đấu phong trào",
};

const PRODUCT_HINTS_BY_LEVEL = {
  [PLAYER_LEVEL.BEGINNER]:
    "Ưu tiên vợt nhẹ, cân bằng, giá vừa phải; giày có đệm tốt.",
  [PLAYER_LEVEL.RECREATIONAL]:
    "Vợt linh hoạt, dễ điều khiển; giày thoáng, ổn định mắt cá.",
  [PLAYER_LEVEL.INTERMEDIATE]:
    "Có thể chọn vợt cứng hơn, đánh nhanh; giày hỗ trợ di chuyển đa hướng.",
  [PLAYER_LEVEL.ADVANCED]:
    "Vợt theo lối đánh (tấn công/phòng thủ); giày chuyên dụng.",
  [PLAYER_LEVEL.COMPETITIVE]:
    "Trang bị chuyên sâu theo sở thích thi đấu; chú ý độ bền và trọng lượng.",
};

const getTomorrowDate = () => {
  const today = getTodayInVietnam();
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().split("T")[0];
};

// Cộng 1 giờ vào "HH:mm" (chặn trần 23:59) để mặc định khung 1 tiếng khi thiếu endTime
const addOneHour = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const total = Math.min(h * 60 + m + 60, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const MENU_GROUP_BY_KEYWORD = [
  { pattern: /vợt|vot/i, group: "Vợt cầu lông" },
  { pattern: /giày|giay/i, group: "Giày cầu lông" },
  { pattern: /váy|vay/i, group: "Váy cầu lông" },
  { pattern: /áo|ao/i, group: "Áo cầu lông" },
  { pattern: /quần|quan/i, group: "Quần cầu lông" },
  { pattern: /túi|tui|balo/i, group: "Túi vợt & Balo" },
  { pattern: /phụ kiện|phu kien/i, group: "Phụ kiện" },
];

const inferMenuGroup = (text) => {
  const relaxed = relaxProductTypos(text);
  if (!relaxed) return null;
  for (const { pattern, group } of MENU_GROUP_BY_KEYWORD) {
    if (pattern.test(relaxed)) return group;
  }
  return null;
};

const SKILL_LEVEL_PATTERNS = [
  {
    pattern: /mới chơi|người mới|mới bắt đầu|tập chơi|căn bản|beginner/i,
    level: PLAYER_LEVEL.BEGINNER,
  },
  {
    pattern: /giải trí|chơi vui|recreational/i,
    level: PLAYER_LEVEL.RECREATIONAL,
  },
  {
    pattern: /trung bình|trung cấp|intermediate/i,
    level: PLAYER_LEVEL.INTERMEDIATE,
  },
  {
    pattern:
      /nâng cao|khá|advanced|lâu năm|lau nam|người chơi lâu|nguoi choi lau|chơi lâu|choi lau|nhiều năm|nhieu nam|kinh nghiệm|kinh nghiem/i,
    level: PLAYER_LEVEL.ADVANCED,
  },
  {
    pattern: /thi đấu|competitive|phong trào/i,
    level: PLAYER_LEVEL.COMPETITIVE,
  },
];

const KNOWN_BRANDS = /yonex|victor|lining|mizuno|apacs|kawasaki/i;

const BEGINNER_DESC_PATTERN =
  /moi bat dau|moi choi|can ban|de lam quen|goi y cho nguoi moi|phu hop nguoi moi|nguoi moi/i;
const ADVANCED_DESC_PATTERN =
  /nang cao|tan cong|thi dau|cao cap|trung-cao|trung cao|luc danh|chuyen dung|thi dau phong trao/i;
const INTERMEDIATE_DESC_PATTERN = /trung cap|trung binh|trung-cao/i;
const RECREATIONAL_DESC_PATTERN = /giai tri|choi vui/i;

const PERSONALIZED_LEVEL_HINT =
  /phu hop|goi y|nen mua|tu van|chon giup|cho toi\b|danh cho toi/i;

export const messageMentionsSkillLevel = (text) =>
  SKILL_LEVEL_PATTERNS.some(({ pattern }) => pattern.test(text || ""));

const shouldUseProfileLevel = (text) =>
  messageMentionsSkillLevel(text) || PERSONALIZED_LEVEL_HINT.test(text || "");

/** Ưu tiên trình độ trong câu hỏi; profile chỉ dùng khi user hỏi gợi ý cá nhân chung chung. */
export const resolvePlayerLevel = (text, { toolLevel, profileLevel } = {}) => {
  for (const { pattern, level } of SKILL_LEVEL_PATTERNS) {
    if (pattern.test(text || "")) return level;
  }
  if (toolLevel) return toolLevel;
  if (profileLevel && shouldUseProfileLevel(text)) return profileLevel;
  return null;
};

const inferPlayerLevel = (text, options = {}) => resolvePlayerLevel(text, options);

const extractBrandKeyword = (text) => {
  const match = text?.match(KNOWN_BRANDS);
  return match ? match[0] : null;
};

const toPriceNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.round(num) : null;
};

/** Cách 2: hỏi theo trình độ → browse theo groupName + playerLevel, keyword chỉ giữ thương hiệu */
const normalizeProductSearchArgs = (args, options = {}) => {
  let keyword = args.keyword?.trim() || null;
  let groupName = args.groupName?.trim() || null;
  const userMessage = relaxProductTypos(options.userMessage || "");

  const combined = [userMessage, keyword, groupName].filter(Boolean).join(" ");
  let playerLevel = inferPlayerLevel(combined, {
    toolLevel: args.playerLevel || null,
    profileLevel: shouldUseProfileLevel(combined) ? options.playerLevel : null,
  });

  const priceFromMessage = extractPriceConstraints(userMessage);
  let minPrice = toPriceNumber(args.minPrice) ?? priceFromMessage.minPrice;
  let maxPrice = toPriceNumber(args.maxPrice) ?? priceFromMessage.maxPrice;

  if (!groupName) {
    groupName = inferMenuGroup(combined);
  }

  if (playerLevel) {
    const brand = extractBrandKeyword(combined);
    keyword = brand;
    if (!groupName) {
      if (/vợt|vot/i.test(combined)) groupName = "Vợt cầu lông";
      else if (/giày|giay/i.test(combined)) groupName = "Giày cầu lông";
    }
  } else if (keyword && SKILL_LEVEL_PATTERNS.some(({ pattern }) => pattern.test(keyword))) {
    playerLevel = inferPlayerLevel(keyword, {
      toolLevel: null,
      profileLevel: shouldUseProfileLevel(combined) ? options.playerLevel : null,
    });
    keyword = extractBrandKeyword(keyword);
    if (!groupName) groupName = inferMenuGroup(combined);
  }

  const browseByLevel = Boolean(playerLevel && groupName && !keyword);
  const hasPriceFilter = Boolean(minPrice || maxPrice);
  const baseLimit = browseByLevel
    ? Math.min(Number(args.limit) || 15, 20)
    : Math.min(Number(args.limit) || 8, 12);
  const limit =
    browseByLevel || hasPriceFilter ? Math.min(baseLimit * 4, 60) : baseLimit;

  return {
    keyword,
    groupName,
    playerLevel,
    minPrice,
    maxPrice,
    limit,
    browseByLevel,
    hasPriceFilter,
  };
};

const resolveCategoryIds = async (groupName) => {
  if (!groupName) return [];
  const categories = await Category.findAll({
    where: { menuGroup: { [Op.like]: `%${groupName}%` } },
    attributes: ["id", "menuGroup", "cateName"],
  });
  return categories.map((c) => c.id);
};

const buildProductWhere = (keyword, categoryIds) => {
  const where = {};
  if (categoryIds.length > 0) {
    where.categoryId = { [Op.in]: categoryIds };
  }
  if (keyword) {
    const like = { [Op.like]: `%${keyword}%` };
    where[Op.or] = [
      { productName: like },
      { brand: like },
      { description: like },
    ];
  }
  return where;
};

const fetchProductsForSearch = async ({
  keyword,
  categoryIds,
  limit,
  minPrice,
  maxPrice,
}) => {
  const hasPriceFilter = Boolean(minPrice || maxPrice);
  const variantWhere = {};
  if (minPrice) variantWhere.price = { ...(variantWhere.price || {}), [Op.gte]: minPrice };
  if (maxPrice) variantWhere.price = { ...(variantWhere.price || {}), [Op.lte]: maxPrice };

  return Product.findAll({
    where: buildProductWhere(keyword, categoryIds),
    attributes: ["id", "productName", "brand", "description", "thumbnailUrl"],
    include: [
      {
        model: ProductVariant,
        as: "variants",
        attributes: ["price", "discount"],
        required: hasPriceFilter,
        ...(hasPriceFilter ? { where: variantWhere } : {}),
      },
    ],
    limit,
    order: [["id", "DESC"]],
  });
};

const mapProductSearchResults = (products) =>
  products.map((p) => {
    const variants = p.variants || [];
    const prices = variants.map(
      (v) => Number(v.price) * (1 - Number(v.discount || 0) / 100),
    );
    const minPrice =
      prices.length > 0 ? Math.round(Math.min(...prices)) : null;
    return {
      id: p.id,
      name: p.productName,
      brand: p.brand,
      minPrice,
      description: p.description?.slice(0, 220) || null,
      thumbnailUrl: p.thumbnailUrl || null,
      url: `/product/${p.id}`,
    };
  });

const filterProductsByPrice = (products, { minPrice, maxPrice }) => {
  if (!minPrice && !maxPrice) return products;
  return products.filter((product) => {
    if (product.minPrice == null) return false;
    if (minPrice && product.minPrice < minPrice) return false;
    if (maxPrice && product.minPrice > maxPrice) return false;
    return true;
  });
};

const productDescriptionText = (product) =>
  normalizeText(`${product.description || ""} ${product.name || ""}`);

const filterProductsBySkillLevel = (products, playerLevel) => {
  if (!playerLevel || !products.length) return products;

  const beginnerMatches = products.filter((p) =>
    BEGINNER_DESC_PATTERN.test(productDescriptionText(p)),
  );
  const advancedMatches = products.filter(
    (p) =>
      ADVANCED_DESC_PATTERN.test(productDescriptionText(p)) &&
      !BEGINNER_DESC_PATTERN.test(productDescriptionText(p)),
  );
  const notBeginner = products.filter(
    (p) => !BEGINNER_DESC_PATTERN.test(productDescriptionText(p)),
  );

  switch (playerLevel) {
    case PLAYER_LEVEL.BEGINNER:
      return beginnerMatches.length ? beginnerMatches : products;
    case PLAYER_LEVEL.ADVANCED:
    case PLAYER_LEVEL.COMPETITIVE:
      if (advancedMatches.length) return advancedMatches;
      if (notBeginner.length) return notBeginner;
      return [];
    case PLAYER_LEVEL.INTERMEDIATE: {
      const intermediateMatches = products.filter((p) =>
        INTERMEDIATE_DESC_PATTERN.test(productDescriptionText(p)),
      );
      if (intermediateMatches.length) return intermediateMatches;
      if (notBeginner.length) return notBeginner;
      return products;
    }
    case PLAYER_LEVEL.RECREATIONAL: {
      const recreationalMatches = products.filter((p) =>
        RECREATIONAL_DESC_PATTERN.test(productDescriptionText(p)),
      );
      return recreationalMatches.length ? recreationalMatches : products;
    }
    default:
      return products;
  }
};

const listBranchesTool = async () => {
  const branches = await Branch.findAll({
    where: { isActive: true },
    attributes: ["id", "branchName", "address"],
    order: [["branchName", "ASC"]],
  });
  return {
    branches: branches.map((b) => ({
      id: b.id,
      name: b.branchName,
      address: b.address || null,
    })),
    hint: "Liệt kê tên chi nhánh cho user chọn MỘT chi nhánh. Chưa tra cứu sân.",
  };
};

const searchAvailableCourtsTool = async (args) => {
  const { branchId, date, startTime, endTime } = args;
  if (!branchId || !date || !startTime || !endTime) {
    throw new BadRequestError(
      "Thiếu thông tin: branchId, date, startTime, endTime.",
    );
  }

  const branch = await Branch.findByPk(branchId, {
    attributes: ["id", "branchName", "address"],
  });
  if (!branch) {
    return { error: "Không tìm thấy chi nhánh.", branchId };
  }

  try {
    const courts = await courtService.getAvailableCourtsService({
      branchId: Number(branchId),
      date,
      startTime,
      endTime,
    });

    const available = courts.filter((c) => c.status !== "booked");
    const booked = courts.filter((c) => c.status === "booked");

    return {
      branch: {
        id: branch.id,
        name: branch.branchName,
        address: branch.address,
      },
      date,
      timeSlot: { startTime, endTime },
      availableCount: available.length,
      bookedCount: booked.length,
      availableCourts: available.map((c) => ({
        id: c.id,
        name: c.courtName,
        location: c.location,
        estimatedPrice: c.totalPrice,
        durationHours: c.duration,
      })),
      bookedCourtNames: booked.map((c) => c.courtName),
      bookingUrl: `/branches/${branchId}`,
    };
  } catch (err) {
    const msg = err.message || "Không tra cứu được lịch sân.";
    const isTimingError = /quá khứ|ít nhất 1 tiếng|quá hạn/i.test(msg);
    return {
      branch: { id: branch.id, name: branch.branchName },
      date,
      timeSlot: { startTime, endTime },
      error: msg,
      ...(isTimingError
        ? {
            doNotChangeDate: true,
            instruction:
              "Khung giờ/ngày này không đặt được vì lý do trên. TUYỆT ĐỐI KHÔNG tự đổi sang ngày hoặc giờ khác rồi trả lời như thật. Hãy báo đúng lý do cho user và HỎI họ muốn chọn khung giờ khác (hoặc ngày khác).",
          }
        : {
            suggestion: "Thử khung giờ khác hoặc ngày khác (định dạng YYYY-MM-DD).",
          }),
    };
  }
};

const searchProductsTool = async (args, options = {}) => {
  const {
    keyword,
    groupName,
    playerLevel,
    minPrice,
    maxPrice,
    limit,
    browseByLevel,
    hasPriceFilter,
  } = normalizeProductSearchArgs(args, options);

  let categoryIds = await resolveCategoryIds(groupName);

  // Cách 2: browse toàn bộ nhóm danh mục, AI chọn theo mô tả + levelHint
  let products = await fetchProductsForSearch({
    keyword: browseByLevel ? null : keyword,
    categoryIds,
    limit,
    minPrice,
    maxPrice,
  });

  if (products.length === 0 && keyword && categoryIds.length > 0) {
    products = await fetchProductsForSearch({
      keyword: null,
      categoryIds,
      limit,
      minPrice,
      maxPrice,
    });
  }

  if (products.length === 0 && keyword) {
    const inferredGroup = inferMenuGroup(keyword);
    if (inferredGroup) {
      const inferredIds = await resolveCategoryIds(inferredGroup);
      products = await fetchProductsForSearch({
        keyword,
        categoryIds: inferredIds,
        limit,
        minPrice,
        maxPrice,
      });
      if (products.length === 0 && inferredIds.length > 0) {
        products = await fetchProductsForSearch({
          keyword: null,
          categoryIds: inferredIds,
          limit,
          minPrice,
          maxPrice,
        });
      }
    }
  }

  const levelHint = playerLevel
    ? PRODUCT_HINTS_BY_LEVEL[playerLevel] ||
      PRODUCT_HINTS_BY_LEVEL[PLAYER_LEVEL.BEGINNER]
    : null;

  const displayLimit = browseByLevel ? 15 : 8;
  const mappedProducts = filterProductsByPrice(
    filterProductsBySkillLevel(mapProductSearchResults(products), playerLevel),
    { minPrice, maxPrice },
  ).slice(0, displayLimit);

  const priceHint = hasPriceFilter
    ? minPrice && maxPrice
      ? `Đã lọc giá từ ${minPrice.toLocaleString("vi-VN")}₫ đến ${maxPrice.toLocaleString("vi-VN")}₫.`
      : minPrice
        ? `Đã lọc giá từ ${minPrice.toLocaleString("vi-VN")}₫ trở lên.`
        : `Đã lọc giá tối đa ${maxPrice.toLocaleString("vi-VN")}₫.`
    : null;

  return {
    searchMode: browseByLevel ? "level_browse" : "keyword",
    keyword,
    groupName: groupName || null,
    playerLevel: playerLevel || null,
    playerLevelLabel: playerLevel
      ? PLAYER_LEVEL_LABELS[playerLevel]
      : null,
    minPrice: minPrice || null,
    maxPrice: maxPrice || null,
    levelHint,
    products: mappedProducts,
    shopUrl: "/products",
    hint:
      mappedProducts.length === 0
        ? playerLevel && hasPriceFilter
          ? `Không có sản phẩm phù hợp trình độ ${PLAYER_LEVEL_LABELS[playerLevel] || playerLevel}${groupName ? ` trong nhóm ${groupName}` : ""}${priceHint ? ` (${priceHint})` : ""}. Gợi ý user xem thêm tại /products hoặc nới ngân sách.`
          : hasPriceFilter
          ? `Không có sản phẩm phù hợp${groupName ? ` trong nhóm ${groupName}` : ""} với khoảng giá yêu cầu. ${priceHint || ""} Hãy báo user và gợi ý nới lỏng ngân sách hoặc xem thêm tại /products.`
          : playerLevel
            ? `Không có sản phẩm phù hợp trình độ ${PLAYER_LEVEL_LABELS[playerLevel] || playerLevel} trong nhóm này.`
          : "Không có sản phẩm trong nhóm này. Kiểm tra groupName (vd: Vợt cầu lông)."
        : playerLevel
          ? `Chọn 2–4 sản phẩm phù hợp playerLevel từ danh sách (đọc description).${priceHint ? ` ${priceHint}` : ""}`
          : priceHint,
  };
};

const getProductDetailTool = async (args) => {
  const productId = Number(args.productId);
  if (!productId) {
    throw new BadRequestError("productId là bắt buộc.");
  }

  const product = await productService.getProductDetailService(productId);
  const minVariant = product.variants?.reduce(
    (min, v) => {
      const price = Number(v.discountPrice ?? v.price);
      return min === null || price < min ? price : min;
    },
    null,
  );

  return {
    id: product.id,
    name: product.productName,
    brand: product.brand,
    description: product.description?.slice(0, 500),
    minPrice: minVariant,
    variantCount: product.variants?.length || 0,
    url: `/product/${product.id}`,
  };
};

/** Cách 2: hỏi theo trình độ → lọc formData.inputLevel, không search title bằng "người mới" */
const normalizeClassSearchArgs = (args, options = {}) => {
  let search = args.search?.trim() || null;

  const combined = [options.userMessage, search].filter(Boolean).join(" ");
  const inputLevel = inferPlayerLevel(combined, {
    toolLevel: args.inputLevel || null,
    profileLevel: options.playerLevel || null,
  });

  const branchId = args.branchId
    ? Number(args.branchId)
    : options.defaultBranchId
      ? Number(options.defaultBranchId)
      : undefined;
  const city = args.city?.trim();
  const limit = Math.min(Number(args.limit) || 8, 12);

  if (inputLevel) {
    search = null;
  } else if (search) {
    const meaningful = search
      .replace(/lớp|cầu lông|học|tìm|cho|người|mới|chơi|bắt đầu|class/gi, " ")
      .trim();
    if (!meaningful || meaningful.length < 2) {
      search = null;
    }
  } else if (/lớp|class|hlv|học viên/i.test(combined)) {
    search = null;
  }

  return {
    search,
    inputLevel,
    branchId,
    city,
    limit,
    browseMode: !search,
  };
};

const searchClassPostsTool = async (args, options = {}) => {
  const { search, inputLevel, branchId, city, limit, browseMode } =
    normalizeClassSearchArgs(args, options);

  const query = {
    type: POST_TYPE.CLASS,
    page: 1,
    limit,
    hideReposts: "1",
  };
  if (search) query.search = search;
  if (branchId) query["formData[location.branchId]"] = branchId;
  if (city) query["formData[area.city]"] = city;
  if (inputLevel) query["formData[inputLevel]"] = inputLevel;

  let result = await postService.getPostsService(query);
  let posts = result?.data || [];

  // Có trình độ nhưng không khớp → liệt kê tất cả lớp để AI gợi ý
  if (posts.length === 0 && inputLevel) {
    const fallbackQuery = { ...query };
    delete fallbackQuery["formData[inputLevel]"];
    result = await postService.getPostsService(fallbackQuery);
    posts = result?.data || [];
  }

  return {
    searchMode: browseMode ? "level_browse" : "keyword",
    search,
    inputLevel: inputLevel || null,
    inputLevelLabel: inputLevel ? PLAYER_LEVEL_LABELS[inputLevel] : null,
    total: result?.total ?? posts.length,
    classes: posts.slice(0, limit).map((post) => {
      const fd = post.formData || {};
      return {
        id: post.id,
        title: post.title,
        excerpt: post.content?.slice(0, 200),
        coachName: post.author?.profile?.fullName || post.author?.username,
        branchId: fd?.location?.branchId,
        inputLevel: fd?.inputLevel || null,
        inputLevelLabel: fd?.inputLevel
          ? PLAYER_LEVEL_LABELS[fd.inputLevel]
          : null,
        ageRange: fd?.ageRange || null,
        schedule: fd?.schedule || null,
        tuitionFee: fd?.tuitionFee || fd?.fee || null,
        maxStudents: fd?.maxStudents || null,
        url: `/posts?postId=${post.id}`,
      };
    }),
    postsUrl: "/posts",
    becomeCoachUrl: "/become-coach",
    hint:
      posts.length === 0
        ? "Chưa có bài đăng lớp CLASS phù hợp trong hệ thống."
        : inputLevel
          ? "Ưu tiên lớp có inputLevel phù hợp; nếu không khớp hãy gợi ý lớp gần nhất từ danh sách."
          : null,
  };
};

const resolveBranchIdByName = async (branchName) => {
  if (!branchName?.trim()) return null;
  const branch = await Branch.findOne({
    where: {
      branchName: { [Op.like]: `%${branchName.trim()}%` },
      isActive: true,
    },
    attributes: ["id", "branchName"],
  });
  return branch?.id ?? null;
};

export const executeAiTool = async (toolName, rawArgs, options = {}) => {
  const args =
    typeof rawArgs === "string" ? JSON.parse(rawArgs || "{}") : rawArgs || {};

  switch (toolName) {
    case AI_TOOL_NAMES.LIST_BRANCHES:
      return listBranchesTool();

    case AI_TOOL_NAMES.SEARCH_AVAILABLE_COURTS: {
      if (!args.branchId && args.branchName) {
        args.branchId = await resolveBranchIdByName(args.branchName);
      }
      if (!args.branchId && options.defaultBranchId) {
        args.branchId = Number(options.defaultBranchId);
      }
      if (!args.date) args.date = getTomorrowDate();
      else {
        const parsed = parseNaturalDate(args.date);
        if (parsed) args.date = parsed;
      }
      if (args.startTime && !args.endTime) {
        args.endTime = addOneHour(args.startTime);
      }
      if (!args.branchId) {
        return {
          needsBranchSelection: true,
          error:
            "Chưa chọn chi nhánh. Gọi list_branches, liệt kê tên chi nhánh và hỏi user chọn MỘT chi nhánh. Không tự tra cứu tất cả chi nhánh.",
        };
      }
      return searchAvailableCourtsTool(args);
    }

    case AI_TOOL_NAMES.SEARCH_PRODUCTS:
      return searchProductsTool(
        {
          ...args,
          // Chỉ dùng playerLevel khi tool/model truyền rõ ràng.
          // Không bơm profile level vào đây để tránh câu hỏi chỉ lọc giá
          // bị gắn nhãn "mới bắt đầu".
          playerLevel: args.playerLevel || null,
        },
        options,
      );

    case AI_TOOL_NAMES.GET_PRODUCT_DETAIL:
      return getProductDetailTool(args);

    case AI_TOOL_NAMES.SEARCH_CLASS_POSTS:
      return searchClassPostsTool(args, options);

    default:
      return { error: `Công cụ không hỗ trợ: ${toolName}` };
  }
};

export const getToolStatusMessage = (toolName) => {
  const messages = {
    [AI_TOOL_NAMES.LIST_BRANCHES]: "Đang lấy danh sách chi nhánh...",
    [AI_TOOL_NAMES.SEARCH_AVAILABLE_COURTS]: "Đang tra cứu sân trống...",
    [AI_TOOL_NAMES.SEARCH_PRODUCTS]: "Đang tìm sản phẩm phù hợp...",
    [AI_TOOL_NAMES.GET_PRODUCT_DETAIL]: "Đang xem chi tiết sản phẩm...",
    [AI_TOOL_NAMES.SEARCH_CLASS_POSTS]: "Đang tìm lớp học / HLV...",
  };
  return messages[toolName] || "Đang tra cứu dữ liệu...";
};

export const loadUserAiProfile = async (userId) => {
  if (!userId) return null;
  const user = await User.findByPk(userId, {
    attributes: ["id", "username", "email"],
    include: [
      {
        model: Profile,
        as: "profile",
        attributes: ["fullName", "level", "phoneNumber"],
      },
    ],
  });
  if (!user) return null;
  const level = user.profile?.level;
  return {
    userId: user.id,
    fullName: user.profile?.fullName || user.username,
    playerLevel: level,
    playerLevelLabel: level ? PLAYER_LEVEL_LABELS[level] : null,
  };
};

export default {
  executeAiTool,
  getToolStatusMessage,
  loadUserAiProfile,
};
