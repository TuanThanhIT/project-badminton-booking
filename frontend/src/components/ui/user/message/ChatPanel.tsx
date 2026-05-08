import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronUp,
  CornerUpLeft,
  CornerUpRight,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type {
  ChatMessage,
  Conversation,
  ReplyToMessage,
} from "../../../../types/message";
import type { UserSearchHit } from "../../../../types/userSearch";
import MemberSearchPicker from "./MemberSearchPicker";
import { formatRelativeTimeVi } from "../../../../utils/formatRelativeTimeVi";
import { ROLE_NAME } from "../../../../utils/constants/role";

type ChatPanelProps = {
  conversation?: Conversation;
  conversations?: Conversation[];
  messages: ChatMessage[];
  currentUserId?: number;
  isGroupAdmin?: boolean;
  onSend: (body: string, replyToId?: number) => Promise<void>;
  onUploadFile: (file: File, caption?: string) => Promise<void>;
  onRecall: (messageId: number) => Promise<void>;
  onForward?: (toConversationId: number, message: ChatMessage) => Promise<void>;
  onLeaveGroup?: () => Promise<void>;
  onDeleteGroup?: () => Promise<void>;
  onAddMembers?: (userIds: number[]) => Promise<void>;
  onRemoveMember?: (userId: number) => Promise<void>;
};

const dayKeyVi = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

const UserAvatar = ({
  name,
  url,
  sizeClass = "w-8 h-8",
}: {
  name: string;
  url?: string | null;
  sizeClass?: string;
}) => {
  const [imgErr, setImgErr] = useState(false);
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div
      className={`${sizeClass} rounded-full shrink-0 overflow-hidden flex items-center justify-center bg-gradient-to-br from-sky-400 to-emerald-500 text-white text-xs font-bold`}
    >
      {url && !imgErr ? (
        <img
          src={url}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setImgErr(true)}
        />
      ) : (
        letter
      )}
    </div>
  );
};

const ReplyQuoteBar = ({
  replyTarget,
  isMine,
  onJump,
}: {
  replyTarget: ReplyToMessage;
  isMine: boolean;
  onJump?: () => void;
}) => {
  const isImage = replyTarget.type === "IMAGE";
  const isFile = replyTarget.type === "FILE";
  const hasMedia =
    (isImage || isFile) && replyTarget.mediaUrl && !replyTarget.isRecalled;
  const preview = replyTarget.isRecalled
    ? "Tin nhắn đã thu hồi"
    : replyTarget.body?.trim() ||
      (isImage ? "Ảnh" : isFile ? "Tệp đính kèm" : "");

  return (
    <button
      type="button"
      onClick={onJump}
      className={`mb-1.5 w-full text-left rounded-xl overflow-hidden border-l-[3px] flex items-center gap-2 transition-opacity hover:opacity-75 active:opacity-60 ${
        isMine ? "border-sky-300 bg-sky-700/30" : "border-sky-400 bg-sky-50/80"
      } ${onJump ? "cursor-pointer" : "cursor-default"}`}
    >
      {/* Image thumbnail */}
      {isImage && hasMedia && (
        <img
          src={replyTarget.mediaUrl!}
          alt=""
          className="w-10 h-10 object-cover shrink-0"
        />
      )}

      {/* Text content */}
      <div className="min-w-0 flex-1 px-2.5 py-1.5">
        <p
          className={`text-[11px] font-semibold truncate ${isMine ? "text-sky-200" : "text-sky-600"}`}
        >
          {replyTarget.senderName}
        </p>
        <p
          className={`text-[11px] truncate flex items-center gap-1 ${isMine ? "text-sky-100/80" : "text-gray-500"}`}
        >
          {isImage && !replyTarget.isRecalled && <span>📷</span>}
          {isFile && !replyTarget.isRecalled && (
            <Paperclip className="w-3 h-3 shrink-0" />
          )}
          {preview}
        </p>
      </div>
    </button>
  );
};

const ForwardModal = ({
  message,
  conversations,
  currentConversationId,
  currentUserId,
  onSelect,
  onClose,
}: {
  message: ChatMessage;
  conversations: Conversation[];
  currentConversationId: number;
  currentUserId?: number;
  onSelect: (conversationId: number) => Promise<void>;
  onClose: () => void;
}) => {
  const [query, setQuery] = useState("");
  const [sendingId, setSendingId] = useState<number | null>(null);

  const preview = message.isRecalled
    ? "Tin nhắn đã thu hồi"
    : message.body?.trim() ||
      (message.type === "IMAGE" ? "📷 Ảnh" : "📎 Tệp đính kèm");

  const getDisplayInfo = (c: Conversation) => {
    if (c.type === "GROUP") {
      return {
        name: c.conversationName,
        avatar: null,
        sub: `${c.participants.length} thành viên`,
      };
    }
    const other = c.participants.find((p) => p.userId !== currentUserId);
    return {
      name: other?.fullName?.trim() || other?.username || c.conversationName,
      avatar: other?.avatar ?? null,
      sub: "Nhắn tin 1-1",
    };
  };

  const filtered = conversations
    .filter((c) => c.id !== currentConversationId)
    .filter((c) => {
      if (!query.trim()) return true;
      const { name } = getDisplayInfo(c);
      return name.toLowerCase().includes(query.toLowerCase().trim());
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-gray-900 text-sm">
            Chuyển tiếp tin nhắn
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message preview */}
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
          <p className="text-xs text-gray-500 bg-white rounded-xl px-3 py-2 border border-gray-100 line-clamp-2">
            {preview}
          </p>
        </div>

        {/* Search */}
        <div className="px-4 py-2.5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm hội thoại…"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 py-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              {query
                ? "Không tìm thấy hội thoại"
                : "Không có hội thoại nào khác"}
            </p>
          ) : (
            filtered.map((c) => {
              const { name, avatar, sub } = getDisplayInfo(c);
              const isSending = sendingId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={isSending}
                  onClick={async () => {
                    setSendingId(c.id);
                    await onSelect(c.id);
                    setSendingId(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left disabled:opacity-60"
                >
                  {c.type === "GROUP" ? (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <UserAvatar
                      key={c.id}
                      name={name}
                      url={avatar}
                      sizeClass="w-9 h-9"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {name}
                    </p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                  {isSending && (
                    <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const ChatPanel = ({
  conversation,
  conversations = [],
  messages,
  currentUserId,
  isGroupAdmin,
  onSend,
  onUploadFile,
  onRecall,
  onForward,
  onLeaveGroup,
  onDeleteGroup,
  onAddMembers,
  onRemoveMember,
}: ChatPanelProps) => {
  const [body, setBody] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [pendingAdds, setPendingAdds] = useState<UserSearchHit[]>([]);
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  const [forwardTarget, setForwardTarget] = useState<ChatMessage | null>(null);
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToMessage = (messageId: number) => {
    const container = scrollAreaRef.current;
    if (!container) return;
    const el = container.querySelector(
      `[data-msg-id="${messageId}"]`,
    ) as HTMLElement | null;
    if (!el) return;
    container.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setHighlightedMsgId(messageId);
    highlightTimerRef.current = setTimeout(
      () => setHighlightedMsgId(null),
      1500,
    );
  };

  const participantIds = useMemo(
    () => conversation?.participants.map((p) => p.userId) ?? [],
    [conversation?.participants],
  );

  const otherParticipant = useMemo(
    () =>
      conversation?.type === "PRIVATE"
        ? conversation.participants.find((p) => p.userId !== currentUserId)
        : undefined,
    [conversation, currentUserId],
  );

  const sorted = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
      ),
    [messages],
  );

  const rows = useMemo(() => {
    const out: (
      | { kind: "day"; label: string }
      | { kind: "msg"; message: ChatMessage; showMeta: boolean }
    )[] = [];

    let lastDay = "";
    let prev: ChatMessage | null = null;

    for (const m of sorted) {
      const dk = dayKeyVi(m.createdDate);
      if (dk && dk !== lastDay) {
        lastDay = dk;
        out.push({ kind: "day", label: dk });
      }
      const sameSender = prev?.senderId === m.senderId;
      const gapMin =
        prev &&
        (new Date(m.createdDate).getTime() -
          new Date(prev.createdDate).getTime()) /
          60000 <
          4;
      out.push({ kind: "msg", message: m, showMeta: !(sameSender && gapMin) });
      prev = m;
    }
    return out;
  }, [sorted]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [rows.length]);

  useEffect(() => {
    if (replyTarget) textareaRef.current?.focus();
  }, [replyTarget]);

  const handleSend = async () => {
    const text = body.trim();
    if (!text) return;
    await onSend(text, replyTarget?.id);
    setBody("");
    setReplyTarget(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  if (!conversation) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center gap-4 text-gray-400">
        <div className="w-20 h-20 rounded-full bg-sky-50 flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-sky-300" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-500">
            Chào mừng đến B-Hub Chat
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Chọn một hội thoại để bắt đầu nhắn tin
          </p>
        </div>
      </div>
    );
  }

  const isGroup = conversation.type === "GROUP";
  const headerDisplayName = isGroup
    ? conversation.conversationName
    : otherParticipant?.fullName?.trim() ||
      otherParticipant?.username ||
      conversation.conversationName;

  return (
    <section className="flex-1 bg-gray-50 flex flex-col min-w-0 min-h-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between gap-3 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          {isGroup ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {conversation.conversationName.charAt(0).toUpperCase()}
            </div>
          ) : (
            <UserAvatar
              key={conversation.id}
              name={headerDisplayName}
              url={otherParticipant?.avatar}
              sizeClass="w-10 h-10"
            />
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm">
              {headerDisplayName}
            </h3>
            {isGroup ? (
              <p className="text-xs text-gray-500">
                {conversation.participants.length} thành viên
              </p>
            ) : (
              <p className="text-xs text-emerald-500 font-medium">Trực tuyến</p>
            )}
          </div>
        </div>
        {isGroup && (
          <button
            type="button"
            onClick={() => setShowMembers((v) => !v)}
            className={`p-2 rounded-xl transition-colors shrink-0 ${showMembers ? "bg-sky-100 text-sky-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
            title="Thành viên nhóm"
          >
            {showMembers ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <Users className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Members panel */}
      {showMembers && isGroup && (
        <div className="border-b border-gray-100 bg-white px-4 py-3 space-y-3 max-h-64 overflow-y-auto shrink-0">
          <div className="space-y-2">
            {conversation.participants.map((p) => {
              const displayName = p.fullName?.trim()
                ? `${p.fullName} (${p.username})`
                : p.username;
              return (
                <div
                  key={p.userId}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar
                      name={p.fullName || p.username}
                      url={p.avatar}
                      sizeClass="w-7 h-7"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {displayName}
                      </p>
                      {p.role === ROLE_NAME.ADMIN && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                  {isGroupAdmin && p.userId !== currentUserId && (
                    <button
                      type="button"
                      className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      onClick={() => onRemoveMember?.(p.userId)}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {isGroupAdmin && (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <p className="text-xs text-gray-500 font-medium">
                Thêm thành viên
              </p>
              <MemberSearchPicker
                excludeUserIds={participantIds}
                selected={pendingAdds}
                onSelectedChange={setPendingAdds}
                placeholder="Tìm người để thêm…"
              />
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 transition-colors"
                disabled={pendingAdds.length === 0}
                onClick={async () => {
                  if (pendingAdds.length === 0) return;
                  await onAddMembers?.(pendingAdds.map((u) => u.id));
                  setPendingAdds([]);
                }}
              >
                Thêm vào nhóm
              </button>
            </div>
          )}
          <div className="flex gap-4 pt-2 border-t border-gray-100">
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              onClick={() => onLeaveGroup?.()}
            >
              Rời nhóm
            </button>
            {isGroupAdmin && (
              <button
                type="button"
                className="text-xs text-red-500 hover:text-red-600 underline"
                onClick={() => onDeleteGroup?.()}
              >
                Xóa nhóm
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-3 py-4 min-h-0"
      >
        {rows.map((row, idx) => {
          if (row.kind === "day") {
            return (
              <div key={`d-${idx}`} className="flex justify-center py-3">
                <span className="text-[10px] text-gray-400 bg-white/90 px-3 py-1 rounded-full shadow-sm border border-gray-100">
                  {row.label}
                </span>
              </div>
            );
          }

          const m = row.message;
          const mine = m.senderId === currentUserId;
          const recalled = Boolean(m.isRecalled);

          return (
            <div
              key={m.id}
              data-msg-id={m.id}
              className={`flex items-end gap-1.5 rounded-xl px-1 transition-colors duration-300 ${mine ? "flex-row-reverse" : "flex-row"} ${row.showMeta ? "mt-3" : "mt-0.5"} ${highlightedMsgId === m.id ? "bg-sky-100/70" : ""}`}
              onMouseEnter={() => !recalled && setHoveredMsgId(m.id)}
              onMouseLeave={() => setHoveredMsgId(null)}
            >
              {/* Avatar — group, non-mine */}
              {!mine && isGroup ? (
                row.showMeta ? (
                  <UserAvatar
                    name={m.senderName}
                    url={m.senderAvatar}
                    sizeClass="w-8 h-8"
                  />
                ) : (
                  <div className="w-8 shrink-0" />
                )
              ) : null}

              {/* Message column */}
              <div
                className={`max-w-[68%] flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                {/* Sender name (group, non-mine, first in group) */}
                {!mine && isGroup && row.showMeta && (
                  <span className="text-[11px] font-medium text-gray-500 mb-1 ml-1">
                    {m.senderName}
                  </span>
                )}

                {/* Bubble (reply section integrated inside) */}
                <div
                  className={`rounded-2xl overflow-hidden shadow-sm max-w-full ${
                    mine
                      ? "rounded-br-md"
                      : "rounded-bl-md border border-gray-100"
                  } ${recalled ? "opacity-60" : ""}`}
                >
                  {/* Reply section — fused at top of bubble */}
                  {m.replyTo && !recalled && (
                    <button
                      type="button"
                      onClick={() => scrollToMessage(m.replyTo!.id)}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 border-b transition-opacity hover:opacity-80 ${
                        mine
                          ? "bg-sky-600 border-sky-400/30"
                          : "bg-sky-50/80 border-gray-200"
                      }`}
                    >
                      {/* Accent line */}
                      <div
                        className={`w-[3px] self-stretch rounded-full shrink-0 ${
                          mine ? "bg-white/60" : "bg-sky-500"
                        }`}
                      />
                      {/* Image thumbnail */}
                      {m.replyTo.type === "IMAGE" &&
                        m.replyTo.mediaUrl &&
                        !m.replyTo.isRecalled && (
                          <img
                            src={m.replyTo.mediaUrl}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                          />
                        )}
                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-[11px] font-semibold truncate ${
                            mine ? "text-sky-100" : "text-sky-600"
                          }`}
                        >
                          {m.replyTo.senderName}
                        </p>
                        <p
                          className={`text-[11px] truncate mt-0.5 flex items-center gap-1 ${
                            mine ? "text-sky-200/80" : "text-gray-500"
                          }`}
                        >
                          {!m.replyTo.isRecalled &&
                            m.replyTo.type === "IMAGE" && <span>📷</span>}
                          {!m.replyTo.isRecalled &&
                            m.replyTo.type === "FILE" && (
                              <Paperclip className="w-3 h-3 shrink-0" />
                            )}
                          {m.replyTo.isRecalled
                            ? "Tin nhắn đã thu hồi"
                            : m.replyTo.body?.trim() ||
                              (m.replyTo.type === "IMAGE"
                                ? "Ảnh"
                                : m.replyTo.type === "FILE"
                                  ? "Tệp đính kèm"
                                  : "")}
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Main bubble content */}
                  <div
                    className={`relative px-3.5 py-2.5 text-sm ${
                      mine
                        ? "bg-gradient-to-br from-sky-500 to-sky-600 text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    {recalled ? (
                      <p className="text-xs italic opacity-80">
                        Tin nhắn đã thu hồi
                      </p>
                    ) : (
                      <>
                        {m.type === "IMAGE" && m.mediaUrl ? (
                          <a
                            href={m.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block mb-1.5"
                          >
                            <img
                              src={m.mediaUrl}
                              alt=""
                              className="max-h-56 max-w-full rounded-xl object-cover"
                            />
                          </a>
                        ) : null}
                        {m.type === "FILE" && m.mediaUrl ? (
                          <a
                            href={m.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center gap-2 text-sm underline ${mine ? "text-sky-100" : "text-sky-600"}`}
                          >
                            <Paperclip className="w-3.5 h-3.5 shrink-0" />
                            Tải tệp đính kèm
                          </a>
                        ) : null}
                        {m.body?.trim() ? (
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {m.body}
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>

                {/* Time */}
                <span
                  className={`text-[10px] text-gray-400 mt-0.5 px-1 ${mine ? "text-right" : "text-left"}`}
                >
                  {formatRelativeTimeVi(m.createdDate)}
                </span>
              </div>

              {/* Hover action buttons */}
              <div
                className={`flex items-center gap-0.5 shrink-0 transition-opacity duration-100 ${
                  hoveredMsgId === m.id
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                } ${mine ? "flex-row-reverse" : "flex-row"}`}
              >
                <button
                  type="button"
                  title="Trả lời"
                  onClick={() => setReplyTarget(m)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                >
                  <CornerUpLeft className="w-3.5 h-3.5" />
                </button>
                {onForward && (
                  <button
                    type="button"
                    title="Chuyển tiếp"
                    onClick={() => setForwardTarget(m)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                  >
                    <CornerUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {mine && (
                  <button
                    type="button"
                    title="Thu hồi tin nhắn"
                    onClick={() => onRecall(m.id)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply preview bar */}
      {replyTarget && (
        <div className="px-4 py-2 border-t border-gray-100 bg-sky-50 flex items-center gap-3 shrink-0">
          <CornerUpLeft className="w-4 h-4 text-sky-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-sky-700">
              Đang trả lời {replyTarget.senderName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {replyTarget.isRecalled
                ? "Tin nhắn đã thu hồi"
                : replyTarget.body?.trim() ||
                  (replyTarget.type === "IMAGE" ? "📷 Ảnh" : "📎 Tệp")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyTarget(null)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-white transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input bar */}
      <form
        className="px-3 py-3 border-t border-gray-200 bg-white flex items-end gap-2 shrink-0"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSend();
        }}
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.zip"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              await onUploadFile(f, body.trim() || undefined);
              e.target.value = "";
              setBody("");
            }
          }}
        />
        <button
          type="button"
          title="Đính kèm tệp"
          className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-sky-600 transition-colors shrink-0"
          onClick={() => fileRef.current?.click()}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <textarea
          ref={textareaRef}
          value={body}
          rows={1}
          onChange={handleTextareaChange}
          onKeyDown={handleTextareaKeyDown}
          className="flex-1 min-w-0 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-shadow bg-gray-50 focus:bg-white"
          placeholder="Nhập tin nhắn… (Enter để gửi)"
          style={{ height: "40px" }}
        />
        <button
          type="submit"
          disabled={!body.trim()}
          className="p-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40 disabled:pointer-events-none transition-colors shrink-0"
          title="Gửi"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Forward modal */}
      {forwardTarget && (
        <ForwardModal
          message={forwardTarget}
          conversations={conversations}
          currentConversationId={conversation.id}
          currentUserId={currentUserId}
          onSelect={async (toId) => {
            await onForward?.(toId, forwardTarget);
            setForwardTarget(null);
          }}
          onClose={() => setForwardTarget(null)}
        />
      )}
    </section>
  );
};

export default ChatPanel;
