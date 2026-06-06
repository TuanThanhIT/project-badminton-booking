import dotenv from "dotenv";
import {
  AI_CONTEXT,
  AI_HISTORY_LIMIT,
  AI_MESSAGE_ROLE,
  AI_TOOL_NAMES,
  OPENAI_DEFAULTS,
} from "../../constants/aiConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import UnauthorizedError from "../../errors/UnauthorizedError.js";
import { Branch, Court, Product } from "../../models/index.js";
import B_HUB_KNOWLEDGE_BASE from "./aiKnowledgeBase.js";
import {
  appendSessionMessage,
  loadSessionMessages,
  messagesToPromptHistory,
  resolveSession,
} from "./aiChatHistoryService.js";
import {
  executeAiTool,
  getToolStatusMessage,
  loadUserAiProfile,
} from "./aiToolsService.js";

dotenv.config();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const escapeJsonString = (value) =>
  String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");

const getOpenAiConfig = () => ({
  apiKey: process.env.OPENAI_API_KEY?.trim(),
  url: process.env.OPENAI_API_URL || OPENAI_DEFAULTS.URL,
  model: process.env.OPENAI_MODEL || OPENAI_DEFAULTS.MODEL,
  temperature: Number(process.env.OPENAI_TEMPERATURE ?? OPENAI_DEFAULTS.TEMPERATURE),
  maxTokens: Number(process.env.OPENAI_MAX_TOKENS ?? OPENAI_DEFAULTS.MAX_TOKENS),
});

const assertOpenAiKey = () => {
  const { apiKey } = getOpenAiConfig();
  if (!apiKey) {
    throw new BadRequestError(
      "Chưa cấu hình OPENAI_API_KEY trên server. Vui lòng liên hệ quản trị viên.",
    );
  }
  return apiKey;
};

const OPENAI_TOOLS = [
  {
    type: "function",
    function: {
      name: AI_TOOL_NAMES.LIST_BRANCHES,
      description:
        "Lấy danh sách chi nhánh B-Hub (id, tên, địa chỉ). BẮT BUỘC gọi trước khi tra sân trống nếu user chưa nói rõ chi nhánh. Chỉ liệt kê tên, chờ user chọn một chi nhánh.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: AI_TOOL_NAMES.SEARCH_AVAILABLE_COURTS,
      description:
        "Tra cứu sân trống tại ĐÚNG MỘT chi nhánh đã chọn. CHỈ gọi sau khi user đã chọn/nói rõ chi nhánh (hoặc đang ở trang chi nhánh). Không gọi cho nhiều chi nhánh. Ngày YYYY-MM-DD, giờ HH:mm.",
      parameters: {
        type: "object",
        properties: {
          branchId: { type: "number", description: "ID chi nhánh đã chọn" },
          branchName: {
            type: "string",
            description: "Tên chi nhánh user vừa chọn (nếu chưa có branchId)",
          },
          date: { type: "string", description: "Ngày chơi YYYY-MM-DD" },
          startTime: { type: "string", description: "Giờ bắt đầu HH:mm" },
          endTime: { type: "string", description: "Giờ kết thúc HH:mm" },
        },
        required: ["startTime", "endTime"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: AI_TOOL_NAMES.SEARCH_PRODUCTS,
      description:
        "Tìm sản phẩm trong cửa hàng B-Hub. BẮT BUỘC gọi khi user hỏi gợi ý/mua sắm. Dùng groupName (Vợt cầu lông, Giày cầu lông...) để lọc danh mục; keyword tìm trong tên, thương hiệu, mô tả. Kèm playerLevel khi hỏi theo trình độ.",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string" },
          groupName: {
            type: "string",
            description:
              "Nhóm danh mục: Vợt cầu lông, Giày cầu lông, Áo cầu lông, ...",
          },
          playerLevel: {
            type: "string",
            enum: [
              "BEGINNER",
              "RECREATIONAL",
              "INTERMEDIATE",
              "ADVANCED",
              "COMPETITIVE",
            ],
          },
          limit: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: AI_TOOL_NAMES.GET_PRODUCT_DETAIL,
      description: "Lấy chi tiết một sản phẩm theo productId.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "number" },
        },
        required: ["productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: AI_TOOL_NAMES.SEARCH_CLASS_POSTS,
      description:
        "Tìm bài đăng lớp CLASS trên B-Hub. BẮT BUỘC gọi khi user hỏi tìm lớp/HLV. Hỏi theo trình độ → truyền inputLevel (BEGINNER...); không dùng search='người mới'. Có thể kèm branchId.",
      parameters: {
        type: "object",
        properties: {
          search: {
            type: "string",
            description: "Từ khóa cụ thể (tên HLV, tên lớp). Bỏ trống khi hỏi theo trình độ.",
          },
          inputLevel: {
            type: "string",
            enum: [
              "BEGINNER",
              "RECREATIONAL",
              "INTERMEDIATE",
              "ADVANCED",
              "COMPETITIVE",
            ],
          },
          branchId: { type: "number" },
          city: { type: "string" },
          limit: { type: "number" },
        },
      },
    },
  },
];

const getToolsForContext = (context) => {
  switch (context) {
    case AI_CONTEXT.BOOKING:
      return OPENAI_TOOLS.filter((t) =>
        [
          AI_TOOL_NAMES.LIST_BRANCHES,
          AI_TOOL_NAMES.SEARCH_AVAILABLE_COURTS,
        ].includes(t.function.name),
      );
    case AI_CONTEXT.SHOPPING:
      return OPENAI_TOOLS.filter((t) =>
        [
          AI_TOOL_NAMES.SEARCH_PRODUCTS,
          AI_TOOL_NAMES.GET_PRODUCT_DETAIL,
        ].includes(t.function.name),
      );
    case AI_CONTEXT.COACH:
      return OPENAI_TOOLS.filter((t) =>
        [AI_TOOL_NAMES.SEARCH_CLASS_POSTS, AI_TOOL_NAMES.LIST_BRANCHES].includes(
          t.function.name,
        ),
      );
    case AI_CONTEXT.GENERAL:
    default:
      return OPENAI_TOOLS;
  }
};

const loadPageContext = async ({ branchId, courtId, productId }) => {
  const page = {};
  if (branchId) {
    const branch = await Branch.findByPk(branchId, {
      attributes: ["id", "branchName", "address", "phoneNumber"],
    });
    if (branch) {
      page.branch = branch.toJSON();
    }
  }
  if (courtId) {
    const court = await Court.findByPk(courtId, {
      attributes: ["id", "courtName", "location", "branchId"],
    });
    if (court) page.court = court.toJSON();
  }
  if (productId) {
    const product = await Product.findByPk(productId, {
      attributes: ["id", "productName", "brand"],
    });
    if (product) page.product = product.toJSON();
  }
  return page;
};

const getTodayInVietnam = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
};

const sanitizeApiMessage = (message) => {
  if (!message || typeof message !== "object") return message;
  const { _rawChoice, ...rest } = message;
  return rest;
};

const buildSystemPrompt = async ({
  context,
  userProfile,
  pageContext,
}) => {
  const contextBlocks = {
    [AI_CONTEXT.GENERAL]: `
Bạn đang ở chế độ **Tổng quát**: FAQ B-Hub, hướng dẫn sử dụng, luật cầu lông cơ bản.
Dùng knowledge base và công cụ tra cứu khi cần dữ liệu thực tế.
`,
    [AI_CONTEXT.BOOKING]: `
Bạn đang ở chế độ **Đặt sân**: tra cứu sân trống, hướng dẫn đặt sân.

Luồng tra sân trống (bắt buộc theo thứ tự):
1. User hỏi còn sân/giờ/ngày NHƯNG chưa nói chi nhánh → chỉ gọi list_branches, liệt kê tên (và địa chỉ ngắn), hỏi "Bạn muốn tra cứu chi nhánh nào?". KHÔNG gọi search_available_courts, KHÔNG liệt kê sân.
2. User chọn/nói tên chi nhánh (hoặc đang ở trang có branchId) → gọi search_available_courts MỘT lần cho chi nhánh đó.
3. Thiếu ngày → mặc định mai; thiếu giờ → dùng giờ user đã nói hoặc hỏi 1 câu.
4. Trả lời sân: bullet (• Sân XX — giá ₫) + [Đặt sân tại đây](/branches/{branchId}).
`,
    [AI_CONTEXT.SHOPPING]: `
Bạn đang ở chế độ **Mua sắm**: tư vấn vợt, giày, phụ kiện theo trình độ và ngân sách.

Luồng tư vấn sản phẩm (bắt buộc):
1. User hỏi về sản phẩm → LUÔN gọi search_products trước khi trả lời.
2. Hỏi vợt → groupName: "Vợt cầu lông"; hỏi giày → "Giày cầu lông"; tương tự các nhóm khác.
3. Hỏi theo trình độ (người mới, tầm trung...) → truyền playerLevel (BEGINNER, RECREATIONAL...) và groupName phù hợp; keyword có thể là thương hiệu hoặc bỏ trống.
4. Chọn 2–4 sản phẩm từ kết quả (ưu tiên mô tả phù hợp trình độ); bullet tên — giá + link [Xem sản phẩm](/product/{id}).
5. KHÔNG nói "không tìm được" nếu chưa gọi search_products; KHÔNG bịa sản phẩm ngoài kết quả công cụ.
`,
    [AI_CONTEXT.COACH]: `
Bạn đang ở chế độ **HLV & Lớp học**: tìm lớp CLASS, hướng dẫn đăng ký HLV (/become-coach), lớp của tôi (/my-classes).

Luồng tìm lớp (bắt buộc):
1. User hỏi tìm lớp → LUÔN gọi search_class_posts trước khi trả lời.
2. Hỏi người mới / căn bản → inputLevel: BEGINNER; KHÔNG dùng search="người mới".
3. Chọn 1–3 lớp từ kết quả (ưu tiên inputLevel, lịch học, học phí); bullet tên lớp — HLV — học phí + [Xem lớp học](/posts).
4. KHÔNG nói "không có lớp" nếu chưa gọi công cụ hoặc danh sách classes không rỗng.
`,
  };

  const userBlock = userProfile
    ? `
Thông tin người dùng đăng nhập:
- Tên: ${userProfile.fullName}
- Trình độ: ${userProfile.playerLevelLabel || "Chưa cập nhật"} (${userProfile.playerLevel || "N/A"})
`
    : `
Người dùng chưa đăng nhập — chỉ hỗ trợ thông tin chung; nhắc đăng nhập khi cần đặt sân/mua hàng/đăng ký lớp.
`;

  const pageBlock =
    pageContext && Object.keys(pageContext).length > 0
      ? `\nNgữ cảnh trang hiện tại:\n${JSON.stringify(pageContext, null, 2)}\n`
      : "";

  const today = getTodayInVietnam();

  return `Bạn là **B-Hub Assistant** — trợ lý AI của hệ thống đặt sân và mua dụng cụ cầu lông B-Hub.

Hôm nay: ${today} (múi giờ Việt Nam). "Hôm nay"/"mai"/"ngày kia" tính theo ngày này.

Quy tắc trả lời:
- **Tiếng Việt**, thân thiện, **ngắn gọn đúng trọng tâm**: tối đa 3–5 câu hoặc 5 bullet; không mở đầu dài, không lặp lại câu hỏi.
- Đọc **toàn bộ lịch sử hội thoại** phía trên; không hỏi lại thông tin user đã nói (chi nhánh, ngày, giờ, sản phẩm...).
- **Bắt buộc gọi công cụ** khi cần dữ liệu thật. Tra sân trống: list_branches trước nếu chưa có chi nhánh, rồi search_available_courts một chi nhánh.
- **Không bịa** giá, tồn kho, lịch sân — chỉ dùng kết quả công cụ.
- Không đặt sân/mua hàng thay user; chỉ hướng dẫn và gửi link.
- Nếu trang hiện tại có branchId/productId, ưu tiên dùng khi tra cứu.

Định dạng hiển thị trong chat (bắt buộc):
- KHÔNG dùng ** in đậm. Liệt kê sân/sản phẩm: mỗi dòng "• Tên — giá" (vd: • Sân 01 — 300.000 ₫).
- Giá dùng ₫, không viết VNĐ.
- Link luôn markdown + đường dẫn tương đối: [Đặt sân tại đây](/branches/4) hoặc [Xem sản phẩm](/product/5). KHÔNG dùng URL đầy đủ https://...

${contextBlocks[context] || contextBlocks[AI_CONTEXT.GENERAL]}
${userBlock}
${pageBlock}

## Knowledge base
${B_HUB_KNOWLEDGE_BASE}
`.trim();
};

const callOpenAI = async ({ messages, tools, toolChoice = "auto" }) => {
  const { apiKey, url, model, temperature, maxTokens } = {
    ...getOpenAiConfig(),
    apiKey: assertOpenAiKey(),
  };

  const body = {
    model,
    messages: messages.map(sanitizeApiMessage),
    temperature,
    max_tokens: maxTokens,
  };

  if (tools?.length) {
    // Some deployments expect `tools` + `tool_choice` (legacy). Use that format.
    body.tools = tools;
    body.tool_choice = toolChoice;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg =
      data?.error?.message || `OpenAI API error (${response.status})`;
    if (response.status === 401) {
      throw new BadRequestError(
        "API key OpenAI không hợp lệ. Kiểm tra OPENAI_API_KEY.",
      );
    }
    if (response.status === 429) {
      throw new BadRequestError(
        "OpenAI đang giới hạn tần suất. Vui lòng thử lại sau.",
      );
    }
    throw new BadRequestError(errMsg);
  }

  const choice = data?.choices?.[0];
  if (!choice?.message) {
    // helpful debug log
    console.error("OpenAI response missing message:", JSON.stringify(data));
    throw new BadRequestError("OpenAI trả về phản hồi rỗng.");
  }

  // attach raw choice for debugging/inspection downstream
  const message = { ...choice.message, _rawChoice: choice };
  // light logging for troubleshooting during development
  console.debug("OpenAI choice:", {
    role: message.role,
    has_function_call: Boolean(message.function_call),
    content_preview: (message.content || "").slice(0, 200),
  });

  return message;
};

const runToolLoop = async ({
  messages,
  tools,
  playerLevel,
  defaultBranchId,
  userMessage,
  onStatus,
}) => {
  const workingMessages = [...messages];
  let rounds = 0;
  let courtsSearchUsed = false;
  while (rounds < OPENAI_DEFAULTS.MAX_TOOL_ROUNDS) {
    rounds += 1;
    const assistantMessage = await callOpenAI({ messages: workingMessages, tools });

    workingMessages.push(sanitizeApiMessage(assistantMessage));

    // detect tool calls (support multiple response formats)
    const toolCalls =
      assistantMessage.tool_calls ||
      assistantMessage._rawChoice?.message?.tool_calls ||
      (assistantMessage.function_call ? [assistantMessage.function_call] : null) ||
      (assistantMessage._rawChoice && assistantMessage._rawChoice.finish_reason === "function_call" ? [assistantMessage._rawChoice.message?.function_call] : null);

    if (!toolCalls || !toolCalls.length) {
      return assistantMessage.content?.trim() || "";
    }

    for (const toolCall of toolCalls) {
      // normalize to { name, arguments }
      const name = toolCall.function?.name || toolCall.name || toolCall.function_name;
      const rawArgs = toolCall.function?.arguments || toolCall.arguments || toolCall.function_arguments || null;

      const statusMsg = getToolStatusMessage(name);
      if (onStatus) onStatus(statusMsg);

      let args = {};
      try {
        args = typeof rawArgs === "string" ? JSON.parse(rawArgs || "{}") : rawArgs || {};
      } catch (err) {
        args = {};
      }

      if (args.date && typeof args.date === "string") {
        const parsed = parseNaturalDate(args.date);
        if (parsed) args.date = parsed;
      }

      let result;
      if (name === AI_TOOL_NAMES.SEARCH_AVAILABLE_COURTS && courtsSearchUsed) {
        result = {
          error:
            "Đã tra cứu một chi nhánh trong tin nhắn này. Hỏi user chọn chi nhánh khác ở tin nhắn tiếp theo.",
        };
      } else {
        try {
          result = await executeAiTool(name, args, {
            playerLevel,
            defaultBranchId,
            userMessage,
          });
          if (name === AI_TOOL_NAMES.SEARCH_AVAILABLE_COURTS) {
            courtsSearchUsed = true;
          }
        } catch (err) {
          result = { error: err.message || "Lỗi thực thi công cụ." };
        }
      }

      console.debug("Tool result for", name, result && typeof result === 'object' ? Object.keys(result) : String(result));

      const toolContent = JSON.stringify(result);
      if (toolCall.id) {
        workingMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolContent,
        });
      } else {
        workingMessages.push({
          role: "function",
          name,
          content: toolContent,
        });
      }
    }
  }

  const final = await callOpenAI({ messages: workingMessages, tools: undefined });
  return final.content?.trim() || "Xin lỗi, tôi không thể hoàn tất yêu cầu.";
};

// Very small VN natural date parser: returns YYYY-MM-DD or null
const parseNaturalDate = (text) => {
  if (!text) return null;
  const t = String(text).toLowerCase().trim();
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const dmyRegex = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/;
  const ymdMatch = t.match(isoRegex);
  if (ymdMatch) return t;
  const dmyMatch = t.match(dmyRegex);
  if (dmyMatch) {
    const day = String(dmyMatch[1]).padStart(2, "0");
    const month = String(dmyMatch[2]).padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  const now = new Date();
  const todayYmd = () => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  if (t.includes("hôm nay") || t === "hôm nay" || t === "nay") return todayYmd();
  if (t.includes("mai") || t === "mai") {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }
  if (t.includes("ngày kia") || t.includes("kia")) {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }

  // try parse yyyy/mm/dd loosely
  const loose = new Date(t);
  if (!Number.isNaN(loose.getTime())) return loose.toISOString().split("T")[0];
  return null;
};

const assertContextAccess = (context, userId) => {
  if (context === AI_CONTEXT.GENERAL) return;
  if (!userId) {
    throw new UnauthorizedError(
      "Vui lòng đăng nhập để dùng chế độ tư vấn này (đặt sân, mua sắm, HLV). Chế độ Tổng quát vẫn dùng được khi chưa đăng nhập.",
    );
  }
};

const chatService = async (payload, onStatus) => {
  const {
    message,
    context = AI_CONTEXT.GENERAL,
    userId,
    guestToken,
    sessionId,
    branchId,
    courtId,
    productId,
    history,
  } = payload;

  const trimmedMessage = message.trim();
  assertContextAccess(context, userId);
  assertOpenAiKey();

  const { session, guestToken: resolvedGuestToken } = await resolveSession({
    sessionId,
    userId,
    guestToken,
    context,
    branchId,
    courtId,
    productId,
    message: trimmedMessage,
  });

  const storedRows = await loadSessionMessages(session.id, AI_HISTORY_LIMIT);
  const storedHistory = messagesToPromptHistory(storedRows);
  const clientHistory = Array.isArray(history)
    ? history
        .slice(-AI_HISTORY_LIMIT)
        .map((h) => ({
          role: h.role === AI_MESSAGE_ROLE.USER ? AI_MESSAGE_ROLE.USER : AI_MESSAGE_ROLE.ASSISTANT,
          content: String(h.content || ""),
        }))
        .filter((h) => h.content.trim())
    : [];
  const promptHistory =
    storedHistory.length > 0 ? storedHistory : clientHistory;

  await appendSessionMessage(session.id, AI_MESSAGE_ROLE.USER, trimmedMessage);

  const userProfile = await loadUserAiProfile(userId);
  const pageContext = await loadPageContext({ branchId, courtId, productId });
  const systemPrompt = await buildSystemPrompt({
    context,
    userProfile,
    pageContext,
  });

  const tools = getToolsForContext(context);
  const messages = [
    { role: "system", content: systemPrompt },
    ...promptHistory,
    { role: "user", content: trimmedMessage },
  ];

  if (onStatus) onStatus("Đang suy nghĩ...");

  const answer = await runToolLoop({
    messages,
    tools,
    playerLevel: userProfile?.playerLevel,
    defaultBranchId: branchId,
    userMessage: trimmedMessage,
    onStatus,
  });

  if (answer) {
    await appendSessionMessage(session.id, AI_MESSAGE_ROLE.ASSISTANT, answer);
  }

  return {
    answer,
    sessionId: session.id,
    guestToken: resolvedGuestToken,
  };
};

const chatSyncService = async (payload) => chatService(payload);

const streamChatService = async (payload, sendEvent) => {
  const send = (event, data) => {
    if (sendEvent) sendEvent(event, data);
  };

  try {
    const result = await chatService(payload, (status) => {
      send("status", { message: status });
    });

    if (!result?.answer) {
      send("error", { error: "Không nhận được phản hồi từ AI." });
      return;
    }

    const chunks = result.answer.split(/(?<=\s)/).filter(Boolean);
    for (const chunk of chunks) {
      send("message", { content: chunk });
      await sleep(25);
    }
    send("complete", {
      done: true,
      sessionId: result.sessionId,
      guestToken: result.guestToken,
    });
  } catch (err) {
    send("error", {
      error: err.message || "Có lỗi xảy ra khi xử lý yêu cầu AI.",
    });
  }
};

export default {
  chatService,
  chatSyncService,
  streamChatService,
  escapeJsonString,
};
