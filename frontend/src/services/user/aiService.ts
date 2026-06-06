import type {
  AiChatContextType,
  AiChatRequest,
  AiStoredMessage,
  AiStreamCallbacks,
} from "../../types/ai";

const getBackendUrl = () =>
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const GUEST_TOKEN_KEY = "bhub_ai_guest_token";

export const getAiGuestToken = () => {
  let token = localStorage.getItem(GUEST_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(GUEST_TOKEN_KEY, token);
  }
  return token;
};

export const getSessionStorageKey = (context: AiChatContextType) =>
  `bhub_ai_session_${context}`;

export const getStoredSessionId = (context: AiChatContextType) => {
  const raw = localStorage.getItem(getSessionStorageKey(context));
  if (!raw) return undefined;
  const id = Number(raw);
  return Number.isNaN(id) ? undefined : id;
};

export const setStoredSessionId = (
  context: AiChatContextType,
  sessionId?: number,
) => {
  const key = getSessionStorageKey(context);
  if (!sessionId) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, String(sessionId));
};

const getAccessToken = () => localStorage.getItem("accessToken");

const buildAuthHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const parseSseBlock = (block: string) => {
  let event = "message";
  let data = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    if (line.startsWith("data:")) data += line.slice(5).trim();
  }
  if (!data) return null;
  try {
    return { event, data: JSON.parse(data) as Record<string, unknown> };
  } catch {
    return null;
  }
};

export const generateAiStreamingResponse = async (
  payload: AiChatRequest,
  callbacks: AiStreamCallbacks,
): Promise<void> => {
  const guestToken = payload.guestToken || getAiGuestToken();
  const response = await fetch(`${getBackendUrl()}/user/ai/chat/stream`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({ ...payload, guestToken }),
  });

  if (!response.ok) {
    let message = "Không thể kết nối trợ lý AI.";
    try {
      const err = await response.json();
      message = (err?.message as string) || message;
    } catch {
      /* ignore */
    }
    callbacks.onError?.(message);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError?.("Trình duyệt không hỗ trợ streaming.");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      const parsed = parseSseBlock(part);
      if (!parsed) continue;

      if (parsed.event === "message" && parsed.data.content) {
        callbacks.onChunk(String(parsed.data.content));
      }
      if (parsed.event === "status" && parsed.data.message) {
        callbacks.onStatus?.(String(parsed.data.message));
      }
      if (parsed.event === "complete") {
        callbacks.onComplete?.({
          sessionId: parsed.data.sessionId
            ? Number(parsed.data.sessionId)
            : undefined,
          guestToken: parsed.data.guestToken
            ? String(parsed.data.guestToken)
            : guestToken,
        });
        return;
      }
      if (parsed.event === "error" && parsed.data.error) {
        callbacks.onError?.(String(parsed.data.error));
        return;
      }
    }
  }
};

export const fetchAiSessionMessages = async (
  sessionId: number,
  guestToken?: string,
): Promise<AiStoredMessage[]> => {
  const params = new URLSearchParams();
  if (guestToken) params.set("guestToken", guestToken);

  const response = await fetch(
    `${getBackendUrl()}/user/ai/sessions/${sessionId}/messages?${params}`,
    { headers: buildAuthHeaders() },
  );
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.message || "Không tải được lịch sử chat");
  }
  return (json.data?.messages || []) as AiStoredMessage[];
};

export const clearAiSession = async (
  sessionId: number,
  guestToken?: string,
): Promise<void> => {
  const params = new URLSearchParams();
  if (guestToken) params.set("guestToken", guestToken);

  const response = await fetch(
    `${getBackendUrl()}/user/ai/sessions/${sessionId}?${params}`,
    { method: "DELETE", headers: buildAuthHeaders() },
  );
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.message || "Không xóa được phiên chat");
  }
};

export const sendAiChat = async (payload: AiChatRequest) => {
  const guestToken = payload.guestToken || getAiGuestToken();
  const response = await fetch(`${getBackendUrl()}/user/ai/chat`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({ ...payload, guestToken }),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.message || "Lỗi gọi AI");
  }
  return json.data as {
    answer: string;
    sessionId: number;
    guestToken?: string;
  };
};

const aiService = {
  generateAiStreamingResponse,
  fetchAiSessionMessages,
  clearAiSession,
  sendAiChat,
  getAiGuestToken,
  getStoredSessionId,
  setStoredSessionId,
};

export default aiService;
