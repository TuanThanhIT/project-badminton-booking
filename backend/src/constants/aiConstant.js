export const AI_CONTEXT = Object.freeze({
  GENERAL: "general",
  BOOKING: "booking",
  SHOPPING: "shopping",
  COACH: "coach",
});

export const AI_MESSAGE_ROLE = Object.freeze({
  USER: "user",
  ASSISTANT: "assistant",
});

export const AI_HISTORY_LIMIT = 40;

// Số tin nhắn lịch sử thực sự gửi vào prompt mỗi lượt (tiết kiệm token, vẫn lưu đủ AI_HISTORY_LIMIT trong DB)
export const AI_PROMPT_HISTORY_LIMIT = 12;

export const AI_TOOL_NAMES = Object.freeze({
  LIST_BRANCHES: "list_branches",
  SEARCH_AVAILABLE_COURTS: "search_available_courts",
  SEARCH_PRODUCTS: "search_products",
  GET_PRODUCT_DETAIL: "get_product_detail",
  SEARCH_CLASS_POSTS: "search_class_posts",
  GET_BOOKING_RECOMMENDATIONS: "get_booking_recommendations",
});

export const OPENAI_DEFAULTS = Object.freeze({
  URL: "https://api.openai.com/v1/chat/completions",
  MODEL: "gpt-4o-mini",
  TEMPERATURE: 0.4,
  MAX_TOKENS: 600,
  MAX_TOOL_ROUNDS: 5,
});
