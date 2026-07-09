import { AI_CONTEXT, AI_TOOL_NAMES } from "../../constants/aiConstant.js";
import { relaxProductTypos } from "./aiTextUtils.js";
import { executeAiTool } from "./aiToolsService.js";

const AI_CARDS_PREFIX = "<<AI_CARDS>>";
const AI_CARDS_SUFFIX = "<<END_AI_CARDS>>";

const PRODUCT_CATALOG_KEYWORDS =
  /vot|cay vot|giay|ao cau|quan cau|vay cau|balo|tui vot|phu kien|san pham|dung cu/;

const PRODUCT_INTENT_PATTERNS = [
  /goi y.*(vot|giay|san pham|dung cu)/,
  /(vot|giay).*(goi y|phu hop|nen mua|chon|tim)/,
  /(vot|giay).*(gia|trieu|ngan sach|khoang|tren|duoi)/,
  /(gia|trieu|ngan sach|tren|duoi).*(vot|giay)/,
  /^(vot|giay)\b.*(tren|duoi|gia|trieu|\d)/,
  /mua.*(vot|giay|dung cu)/,
  /(vot|giay).*(cho nguoi|moi choi|lau nam|choi lau|trung cap|nang cao)/,
  /(vot|giay)\s+\d/,
  /^(vot|giay)\b/,
];

const PRODUCT_EXCLUDE_PATTERNS = [
  /chi tiet san pham|thong so ky thuat/,
  /dat hang|don hang|gio hang/,
  /doi tra|bao hanh/,
];

const formatVnd = (value) =>
  value != null ? `${Number(value).toLocaleString("vi-VN")} ₫` : "Liên hệ";

const buildPriceLabel = ({ minPrice, maxPrice }) => {
  if (minPrice && maxPrice) {
    return `khoảng ${formatVnd(minPrice)} – ${formatVnd(maxPrice)}`;
  }
  if (minPrice) return `từ ${formatVnd(minPrice)} trở lên`;
  if (maxPrice) return `dưới ${formatVnd(maxPrice)}`;
  return null;
};

const buildHeader = (result) => {
  const parts = [];
  if (result.groupName) parts.push(result.groupName.toLowerCase());
  if (result.playerLevelLabel) parts.push(`cho ${result.playerLevelLabel.toLowerCase()}`);
  const priceLabel = buildPriceLabel(result);
  if (priceLabel) parts.push(priceLabel);

  if (!parts.length) return "Dưới đây là một số sản phẩm phù hợp trên B-Hub:";
  return `Dưới đây là một số ${parts.join(" ")}:`;
};

const buildProductCards = (products) =>
  products.slice(0, 4).map((p) => ({
    type: "product",
    id: p.id,
    name: p.name,
    price: p.minPrice,
    image: p.thumbnailUrl || null,
    url: p.url || `/product/${p.id}`,
  }));

const appendAiCards = (text, cards) => {
  if (!cards.length) return text;
  const unique = [];
  const seen = new Set();
  for (const card of cards) {
    const key = `${card.type}-${card.id || card.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(card);
  }
  return `${text}\n${AI_CARDS_PREFIX}${JSON.stringify(unique)}${AI_CARDS_SUFFIX}`;
};

const formatProductAnswer = (result) => {
  const products = result.products || [];
  if (!products.length) {
    const priceLabel = buildPriceLabel(result);
    const levelLabel = result.playerLevelLabel
      ? `cho ${result.playerLevelLabel.toLowerCase()}`
      : null;
    const scope = [result.groupName, levelLabel, priceLabel].filter(Boolean).join(" ");
    return `Hiện chưa có sản phẩm${scope ? ` ${scope}` : ""} trên B-Hub. Bạn có thể xem thêm tại [Sản phẩm](/products).`;
  }

  const bullets = products
    .slice(0, 4)
    .map(
      (p) =>
        `• ${p.name} — ${formatVnd(p.minPrice)} [Xem sản phẩm](${p.url || `/product/${p.id}`})`,
    )
    .join("\n");

  return `${buildHeader(result)}\n\n${bullets}\n\nBạn có thể xem thêm tại [Sản phẩm](/products).`;
};

/**
 * Nhận diện câu hỏi gợi ý / tìm sản phẩm (cần tra DB, không để LLM tự trả lời từ lịch sử).
 */
export const detectProductSearchIntent = (message, context = AI_CONTEXT.GENERAL) => {
  const norm = relaxProductTypos(message);
  if (!norm || norm.length < 3) return false;
  if (PRODUCT_EXCLUDE_PATTERNS.some((pattern) => pattern.test(norm))) return false;

  if (context === AI_CONTEXT.SHOPPING) {
    return PRODUCT_CATALOG_KEYWORDS.test(norm) || PRODUCT_INTENT_PATTERNS.some((p) => p.test(norm));
  }

  if (context === AI_CONTEXT.BOOKING || context === AI_CONTEXT.COACH) {
    if (!PRODUCT_CATALOG_KEYWORDS.test(norm)) return false;
  }

  return PRODUCT_INTENT_PATTERNS.some((pattern) => pattern.test(norm));
};

/**
 * Tầng 1.5: tra sản phẩm server-side — không phụ thuộc LLM có gọi tool hay không.
 */
export const tryProductRouter = async (message, context, options = {}) => {
  if (!detectProductSearchIntent(message, context)) return null;

  const result = await executeAiTool(
    AI_TOOL_NAMES.SEARCH_PRODUCTS,
    {},
    {
      userMessage: message,
      playerLevel: options.playerLevel,
      userId: options.userId,
    },
  );

  if (result?.error) return null;

  const answer = appendAiCards(formatProductAnswer(result), buildProductCards(result.products || []));

  return {
    tier: "1.5-product",
    intent: "product-search",
    answer,
    search: {
      groupName: result.groupName,
      playerLevel: result.playerLevel,
      minPrice: result.minPrice,
      maxPrice: result.maxPrice,
      count: result.products?.length || 0,
    },
  };
};

export default tryProductRouter;
