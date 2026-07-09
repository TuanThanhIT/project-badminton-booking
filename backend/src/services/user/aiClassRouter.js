import { AI_CONTEXT, AI_TOOL_NAMES } from "../../constants/aiConstant.js";
import { relaxProductTypos } from "./aiTextUtils.js";
import { executeAiTool } from "./aiToolsService.js";

const AI_CARDS_PREFIX = "<<AI_CARDS>>";
const AI_CARDS_SUFFIX = "<<END_AI_CARDS>>";

const CLASS_INTENT_PATTERNS = [
  /tim lop|lop hoc|lop class|lop ca|dang ky lop|hoc cau long/,
  /hlv|huan luyen|coach|day cau long/,
  /lop.*(nguoi moi|moi bat dau|trung binh|trung cap|nang cao|lau nam|choi lau)/,
  /(nguoi moi|moi bat dau|trung binh|trung cap|nang cao|lau nam|choi lau).*lop/,
  /goi y.*lop|lop.*goi y/,
  /^lop\b/,
];

const CLASS_EXCLUDE_PATTERNS = [
  /dang ky.*hlv|tro thanh.*hlv|become-coach/,
  /lop cua toi|my-classes/,
];

const formatVnd = (value) =>
  value != null && Number(value) > 0
    ? `${Number(value).toLocaleString("vi-VN")} ₫`
    : "Liên hệ";

const buildClassCards = (classes) =>
  classes.slice(0, 3).map((c) => ({
    type: "class",
    id: c.id,
    name: c.title,
    price: c.tuitionFee ?? null,
    branchName: c.coachName || null,
    url: c.url || `/posts?postId=${c.id}`,
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

const buildHeader = (result) => {
  if (result.inputLevelLabel) {
    return `Dưới đây là một số lớp học cầu lông cho ${result.inputLevelLabel.toLowerCase()}:`;
  }
  return "Dưới đây là một số lớp học cầu lông trên B-Hub:";
};

const formatClassAnswer = (result) => {
  const classes = result.classes || [];
  if (!classes.length) {
    const scope = result.inputLevelLabel
      ? ` cho ${result.inputLevelLabel.toLowerCase()}`
      : "";
    return `Hiện chưa có lớp học${scope} trên B-Hub. Bạn có thể xem thêm tại [Bài đăng](/posts) hoặc đăng ký làm HLV tại [Trở thành HLV](/become-coach).`;
  }

  const bullets = classes
    .slice(0, 3)
    .map((c) => {
      const level = c.inputLevelLabel ? ` — ${c.inputLevelLabel}` : "";
      const fee = c.tuitionFee != null ? ` — ${formatVnd(c.tuitionFee)}` : "";
      const coach = c.coachName ? ` — HLV ${c.coachName}` : "";
      return `• ${c.title}${coach}${level}${fee} [Xem lớp học](${c.url || `/posts?postId=${c.id}`})`;
    })
    .join("\n");

  return `${buildHeader(result)}\n\n${bullets}\n\nBạn có thể xem thêm tại [Bài đăng](/posts).`;
};

export const detectClassSearchIntent = (message, context = AI_CONTEXT.GENERAL) => {
  const norm = relaxProductTypos(message);
  if (!norm || norm.length < 3) return false;
  if (CLASS_EXCLUDE_PATTERNS.some((pattern) => pattern.test(norm))) return false;

  if (context === AI_CONTEXT.COACH) {
    return CLASS_INTENT_PATTERNS.some((pattern) => pattern.test(norm));
  }

  if (context === AI_CONTEXT.BOOKING || context === AI_CONTEXT.SHOPPING) {
    return false;
  }

  return CLASS_INTENT_PATTERNS.some((pattern) => pattern.test(norm));
};

export const tryClassRouter = async (message, context, options = {}) => {
  if (!detectClassSearchIntent(message, context)) return null;

  const result = await executeAiTool(
    AI_TOOL_NAMES.SEARCH_CLASS_POSTS,
    {},
    {
      userMessage: message,
      userId: options.userId,
      defaultBranchId: options.defaultBranchId,
    },
  );

  if (result?.error) return null;

  const answer = appendAiCards(formatClassAnswer(result), buildClassCards(result.classes || []));

  return {
    tier: "1.5-class",
    intent: "class-search",
    answer,
    search: {
      inputLevel: result.inputLevel,
      inputLevelLabel: result.inputLevelLabel,
      count: result.classes?.length || 0,
    },
  };
};

export default tryClassRouter;
