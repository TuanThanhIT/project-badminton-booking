import { useCallback, useEffect, useRef, useState } from "react";
import { Drawer, Input, Button, Segmented, Tooltip, Spin } from "antd";
import { Bot, Send, Trash2, X, User } from "lucide-react";
import { useAIChat } from "../../contexts/AIChatContext";
import { useAppSelector } from "../../redux/hook";
import {
  clearAiSession,
  fetchAiSessionMessages,
  generateAiStreamingResponse,
  getAiGuestToken,
  getStoredSessionId,
  setStoredSessionId,
} from "../../services/user/aiService";
import type { AiChatContextType, AiChatMessage } from "../../types/ai";
import AiMessageContent from "./AiMessageContent";

const CONTEXT_OPTIONS: { label: string; value: AiChatContextType }[] = [
  { label: "Tổng quát", value: "general" },
  { label: "Đặt sân", value: "booking" },
  { label: "Mua sắm", value: "shopping" },
  { label: "HLV / Lớp", value: "coach" },
];

const CONTEXT_HINTS: Record<AiChatContextType, string> = {
  general: "FAQ B-Hub, luật cầu lông, hướng dẫn sử dụng",
  booking: "Tra cứu sân trống, đặt sân, đặt tháng",
  shopping: "Tư vấn vợt, giày, phụ kiện theo trình độ",
  coach: "Tìm lớp học, HLV, đăng ký dạy",
};

const QUICK_PROMPTS: Record<AiChatContextType, string[]> = {
  general: [
    "B-Hub có những tính năng gì?",
    "Luật giao cầu trong cầu lông là gì?",
    "Hướng dẫn nạp tiền vào ví",
  ],
  booking: [
    "Liệt kê các chi nhánh B-Hub",
    "Còn sân trống 17:00–19:00 ngày mai không?",
    "Cách đặt sân theo tháng?",
  ],
  shopping: [
    "Vợt nào phù hợp người mới chơi?",
    "Gợi ý giày cầu lông tầm trung",
    "So sánh vợt Yonex và Lining",
  ],
  coach: [
    "Tìm lớp cầu lông cho người mới",
    "Làm sao đăng ký làm HLV?",
    "Lớp học gần chi nhánh tôi",
  ],
};

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const AIChatWidget = () => {
  const {
    isOpen,
    closeChat,
    toggleChat,
    pageHints,
    activeContext,
    setActiveContext,
  } = useAIChat();
  const { accessToken } = useAppSelector((s) => s.auth);

  const [messagesByContext, setMessagesByContext] = useState<
    Record<AiChatContextType, AiChatMessage[]>
  >({
    general: [],
    booking: [],
    shopping: [],
    coach: [],
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  const messages = messagesByContext[activeContext] || [];
  const guestTokenRef = useRef(getAiGuestToken());

  useEffect(() => {
    if (shouldScrollRef.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, statusText, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const sessionId = getStoredSessionId(activeContext);
    if (!sessionId) return;

    let cancelled = false;
    fetchAiSessionMessages(sessionId, guestTokenRef.current)
      .then((rows) => {
        if (cancelled) return;
        setMessagesByContext((prev) => ({
          ...prev,
          [activeContext]: rows.map((m) => ({
            id: String(m.id),
            content: m.content,
            isUser: m.role === "user",
            createdAt: new Date(m.createdAt).getTime(),
          })),
        }));
      })
      .catch(() => {
        if (!cancelled) setStoredSessionId(activeContext);
      });

    return () => {
      cancelled = true;
    };
  }, [activeContext, isOpen]);

  const appendMessage = useCallback(
    (ctx: AiChatContextType, msg: AiChatMessage) => {
      setMessagesByContext((prev) => ({
        ...prev,
        [ctx]: [...(prev[ctx] || []), msg],
      }));
    },
    [],
  );

  const updateAssistantMessage = useCallback(
    (ctx: AiChatContextType, id: string, patch: Partial<AiChatMessage>) => {
      setMessagesByContext((prev) => ({
        ...prev,
        [ctx]: (prev[ctx] || []).map((m) =>
          m.id === id ? { ...m, ...patch } : m,
        ),
      }));
    },
    [],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      if (activeContext !== "general" && !accessToken) {
        appendMessage(activeContext, {
          id: newId(),
          content:
            "Bạn cần đăng nhập để dùng chế độ này. Vẫn có thể dùng chế độ Tổng quát khi chưa đăng nhập.",
          isUser: false,
          createdAt: Date.now(),
        });
        return;
      }

      shouldScrollRef.current = true;
      appendMessage(activeContext, {
        id: newId(),
        content: trimmed,
        isUser: true,
        createdAt: Date.now(),
      });
      setInput("");

      const assistantId = newId();
      appendMessage(activeContext, {
        id: assistantId,
        content: "",
        isUser: false,
        isStreaming: true,
        createdAt: Date.now(),
      });

      setIsLoading(true);
      setStatusText("Đang kết nối trợ lý AI...");

      await generateAiStreamingResponse(
        {
          message: trimmed,
          context: activeContext,
          branchId: pageHints.branchId,
          productId: pageHints.productId,
          courtId: pageHints.courtId,
        },
        {
          onStatus: (msg) => setStatusText(msg),
          onChunk: (chunk) => {
            setStatusText(null);
            setMessagesByContext((prev) => ({
              ...prev,
              [activeContext]: (prev[activeContext] || []).map((m) =>
                m.id === assistantId ? { ...m, content: m.content + chunk } : m,
              ),
            }));
          },
          onError: (err) => {
            updateAssistantMessage(activeContext, assistantId, {
              content: err,
              isStreaming: false,
            });
            setStatusText(null);
            setIsLoading(false);
          },
          onComplete: ({ sessionId, guestToken }) => {
            if (sessionId) setStoredSessionId(activeContext, sessionId);
            if (guestToken) {
              guestTokenRef.current = guestToken;
              localStorage.setItem("bhub_ai_guest_token", guestToken);
            }
            updateAssistantMessage(activeContext, assistantId, {
              isStreaming: false,
            });
            setStatusText(null);
            setIsLoading(false);
          },
        },
      );

      setIsLoading(false);
      setStatusText(null);
    },
    [
      accessToken,
      activeContext,
      appendMessage,
      isLoading,
      pageHints,
      updateAssistantMessage,
    ],
  );

  const handleClearChat = useCallback(async () => {
    const sessionId = getStoredSessionId(activeContext);
    if (sessionId) {
      try {
        await clearAiSession(sessionId, guestTokenRef.current);
      } catch {
        /* ignore */
      }
    }
    setStoredSessionId(activeContext);
    setMessagesByContext((prev) => ({ ...prev, [activeContext]: [] }));
    setInput("");
    setStatusText(null);
  }, [activeContext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <Tooltip title="B-Hub Assistant — Trợ lý AI">
        <button
          type="button"
          onClick={toggleChat}
          className="fixed bottom-24 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-1 focus:ring-sky-400"
          aria-label="Mở trợ lý AI"
        >
          <Bot className="h-7 w-7" />
        </button>
      </Tooltip>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-600">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">B-Hub Assistant</div>
              <div className="text-xs font-normal text-gray-500">
                Trợ lý AI — RAG & tra cứu dữ liệu thật
              </div>
            </div>
          </div>
        }
        placement="right"
        width={520}
        open={isOpen}
        onClose={closeChat}
        closeIcon={<X className="h-5 w-5" />}
        styles={{
          body: { padding: 0, display: "flex", flexDirection: "column" },
        }}
      >
        <div className="flex flex-col h-full min-h-[70vh]">
          <div className="px-4 pt-2 pb-3 border-b border-gray-100 space-y-2">
            <Segmented
              block
              size="small"
              options={CONTEXT_OPTIONS}
              value={activeContext}
              onChange={(v) => setActiveContext(v as AiChatContextType)}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-500 m-0 flex-1">
                {CONTEXT_HINTS[activeContext]}
              </p>
              {messages.length > 0 && (
                <Tooltip title="Xóa lịch sử chat">
                  <button
                    type="button"
                    onClick={handleClearChat}
                    disabled={isLoading}
                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Xóa lịch sử chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Tooltip>
              )}
            </div>
            {pageHints.branchId && activeContext === "booking" && (
              <p className="text-xs text-sky-600 m-0">
                Đang gắn chi nhánh #{pageHints.branchId}
              </p>
            )}
            {pageHints.productId && activeContext === "shopping" && (
              <p className="text-xs text-sky-600 m-0">
                Đang xem sản phẩm #{pageHints.productId}
              </p>
            )}
          </div>

          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50 scroll-smooth"
            onWheel={() => {
              shouldScrollRef.current = false;
            }}
          >
            {messages.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-6">
                <p className="mb-3">Xin chào! Tôi có thể giúp gì cho bạn?</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_PROMPTS[activeContext].map((q) => (
                    <button
                      key={q}
                      type="button"
                      className="text-xs px-2 py-1 rounded-full border border-sky-200 bg-white text-sky-700 hover:bg-sky-50"
                      onClick={() => sendMessage(q)}
                      disabled={isLoading}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                {!msg.isUser && (
                  <div className="mr-3 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm break-words transition-shadow ${
                    msg.isUser
                      ? "bg-sky-600 text-white rounded-br-2xl whitespace-pre-wrap shadow-md"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-2xl shadow-sm"
                  }`}
                >
                  {msg.content ? (
                    <AiMessageContent
                      content={msg.content}
                      isUser={msg.isUser}
                      onNavigate={msg.isUser ? undefined : closeChat}
                    />
                  ) : msg.isStreaming ? (
                    <span className="inline-flex gap-1">
                      <span className="animate-pulse">●</span>
                      <span className="animate-pulse delay-75">●</span>
                      <span className="animate-pulse delay-150">●</span>
                    </span>
                  ) : null}
                  {msg.isStreaming && msg.content && (
                    <span className="inline-block w-1.5 h-4 ml-0.5 bg-gray-400 animate-pulse align-middle" />
                  )}

                  <div
                    className={`text-[10px] mt-2 ${msg.isUser ? "text-white/70 text-right" : "text-gray-400 text-left"}`}
                  >
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </div>

                {msg.isUser && (
                  <div className="ml-3 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-sky-600 text-white flex items-center justify-center shadow">
                      <User className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {statusText && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Spin size="small" />
                <span>{statusText}</span>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex gap-2 items-end">
              <Input.TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi... (Enter gửi, Shift+Enter xuống dòng)"
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="primary"
                icon={<Send className="h-4 w-4" />}
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="!bg-sky-600"
              />
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default AIChatWidget;
