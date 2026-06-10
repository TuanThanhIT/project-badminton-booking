import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  CornerUpLeft,
  CornerUpRight,
  FileText,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  Trash2,
  UserPlus,
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
import { formatLastSeen } from "../../../../utils/formatLastSeen";
import { ROLE_NAME } from "../../../../utils/constants/role";

type ChatPanelProps = {
  conversation?: Conversation;
  conversations?: Conversation[];
  messages: ChatMessage[];
  loadingMessages?: boolean;
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
  searchUsers?: (q: string, limit?: number) => Promise<UserSearchHit[]>;
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
  sizeClass = "w-9 h-9",
  rounded = "rounded-2xl",
  isOnline,
}: {
  name: string;
  url?: string | null;
  sizeClass?: string;
  rounded?: string;
  isOnline?: boolean;
}) => {
  const [imgErr, setImgErr] = useState(false);
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div className={`relative shrink-0 ${sizeClass}`}>
      <div
        className={`${sizeClass} ${rounded} overflow-hidden flex items-center justify-center bg-sky-100 text-sky-700 text-xs font-medium ring-1 ring-sky-200`}
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
      {isOnline ? (
        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
      ) : null}
    </div>
  );
};

const messagePreview = (
  message: Pick<ChatMessage, "body" | "type" | "isRecalled">,
) => {
  if (message.isRecalled) return "Tin nhắn đã thu hồi";
  if (message.body?.trim()) return message.body.trim();
  if (message.type === "IMAGE") return "Ảnh";
  if (message.type === "FILE") return "Tệp đính kèm";
  return "Tin nhắn";
};

const replyPreview = (replyTarget: ReplyToMessage) => {
  if (replyTarget.isRecalled) return "Tin nhắn đã thu hồi";
  if (replyTarget.body?.trim()) return replyTarget.body.trim();
  if (replyTarget.type === "IMAGE") return "Ảnh";
  if (replyTarget.type === "FILE") return "Tệp đính kèm";
  return "Tin nhắn";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[82vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-semibold text-slate-950">
              Chuyển tiếp tin nhắn
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {messagePreview(message)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm hội thoại..."
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              autoFocus
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 bg-slate-50/70">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">
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
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white transition-colors text-left disabled:opacity-60"
                >
                  <UserAvatar name={name} url={avatar} sizeClass="w-11 h-11" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {name}
                    </p>
                    <p className="text-xs text-slate-400">{sub}</p>
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
  loadingMessages = false,
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
  searchUsers,
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
    container.scrollTo({ top: el.offsetTop - 88, behavior: "smooth" });
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

  const privatePresence = useMemo(() => {
    if (conversation?.type !== "PRIVATE") return null;

    return {
      isOnline:
        conversation.otherParticipant?.isOnline ??
        otherParticipant?.isOnline ??
        false,
      lastSeenAt:
        conversation.otherParticipant?.lastSeenAt ??
        otherParticipant?.lastSeenAt ??
        null,
    };
  }, [conversation, otherParticipant]);

  const sorted = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
      const dk = dayKeyVi(m.createdAt);
      if (dk && dk !== lastDay) {
        lastDay = dk;
        out.push({ kind: "day", label: dk });
      }
      const sameSender = prev?.senderId === m.senderId;
      const gapMin =
        prev &&
        (new Date(m.createdAt).getTime() -
          new Date(prev.createdAt).getTime()) /
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
    if (textareaRef.current) textareaRef.current.style.height = "44px";
  };

  const handleTextareaKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 132)}px`;
  };

  const showMessageSkeleton = loadingMessages && rows.length === 0;

  if (!conversation) {
    return (
      <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center gap-5 text-slate-400 px-8">
        <div className="w-24 h-24 rounded-3xl bg-white border border-slate-200 flex items-center justify-center">
          <MessageCircle className="w-12 h-12 text-sky-400" strokeWidth={1.5} />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-lg font-semibold text-slate-800">
            Chào mừng đến B-Hub Chat
          </p>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Chọn một hội thoại bên trái để bắt đầu nhắn tin cùng bạn chơi.
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
    <section className="flex-1 bg-slate-50 flex flex-col min-w-0 min-h-0">
      <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar
            key={conversation.id}
            name={headerDisplayName}
            url={isGroup ? conversation.avatar : otherParticipant?.avatar}
            sizeClass="w-12 h-12"
            isOnline={!isGroup && privatePresence?.isOnline}
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-950 truncate text-base">
              {headerDisplayName}
            </h3>
            {isGroup ? (
              <p className="text-xs text-slate-500 mt-0.5">
                {conversation.membersCount ?? conversation.participants.length} thành viên
                {(conversation.onlineMembersCount || 0) > 0
                  ? ` · ${conversation.onlineMembersCount} người đang hoạt động`
                  : ""}
              </p>
            ) : formatLastSeen(privatePresence?.isOnline, privatePresence?.lastSeenAt) ? (
              <p
                className={`text-xs font-medium mt-0.5 ${
                  privatePresence?.isOnline ? "text-emerald-600" : "text-slate-500"
                }`}
              >
                {formatLastSeen(privatePresence?.isOnline, privatePresence?.lastSeenAt)}
              </p>
            ) : null}
          </div>
        </div>

        {isGroup && (
          <button
            type="button"
            onClick={() => setShowMembers(true)}
            className={`h-10 px-3 rounded-2xl transition-colors shrink-0 flex items-center gap-2 text-sm font-semibold ${
              showMembers
                ? "bg-sky-50 text-sky-700 border border-sky-100"
                : "text-slate-500 hover:bg-slate-100 border border-transparent"
            }`}
            title="Thành viên nhóm"
          >
            <Users className="w-4 h-4" />
            Thành viên
          </button>
        )}
      </div>

      <div className="h-1 shrink-0 overflow-hidden bg-transparent">
        {loadingMessages ? (
          <div className="h-full w-full origin-left animate-pulse bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
        ) : null}
      </div>

      <div
        ref={scrollAreaRef}
        className={`flex-1 overflow-y-auto px-5 py-5 min-h-0 bg-slate-50 transition-opacity duration-200 ${
          loadingMessages && rows.length > 0 ? "opacity-80" : "opacity-100"
        }`}
      >
        {showMessageSkeleton ? (
          <div className="flex min-h-full flex-col justify-end gap-4 opacity-100 transition-opacity duration-200">
            {Array.from({ length: 7 }).map((_, idx) => {
              const mine = idx % 3 === 1;
              return (
                <div
                  key={idx}
                  className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!mine && (
                    <div className="h-9 w-9 shrink-0 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
                  )}
                  <div
                    className={`space-y-2 ${mine ? "items-end" : "items-start"} flex max-w-[70%] flex-col`}
                  >
                    <div
                      className={`h-10 animate-pulse rounded-2xl ${
                        mine ? "w-52 bg-sky-100" : "w-64 bg-white"
                      }`}
                    />
                    <div className="h-2.5 w-16 animate-pulse rounded-full bg-slate-200" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-full items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sky-500">
                <MessageCircle className="h-7 w-7" strokeWidth={1.6} />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-700">
                Chưa có tin nhắn
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Gửi lời chào để bắt đầu cuộc trò chuyện.
              </p>
            </div>
          </div>
        ) : rows.map((row, idx) => {
          if (row.kind === "day") {
            return (
              <div key={`d-${idx}`} className="flex justify-center py-4">
                <span className="text-[11px] text-slate-500 bg-white/90 px-4 py-1.5 rounded-full border border-slate-200 font-semibold">
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
              className={`flex items-end gap-2 rounded-2xl px-1 transition-colors duration-300 ${
                mine ? "flex-row-reverse" : "flex-row"
              } ${row.showMeta ? "mt-4" : "mt-1"} ${
                highlightedMsgId === m.id ? "bg-sky-100/70" : ""
              }`}
              onMouseEnter={() => !recalled && setHoveredMsgId(m.id)}
              onMouseLeave={() => setHoveredMsgId(null)}
            >
              {!mine && isGroup ? (
                row.showMeta ? (
                  <UserAvatar
                    name={m.senderName}
                    url={m.senderAvatar}
                    sizeClass="w-9 h-9"
                    rounded="rounded-2xl"
                  />
                ) : (
                  <div className="w-9 shrink-0" />
                )
              ) : null}

              <div
                className={`max-w-[70%] flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                {!mine && isGroup && row.showMeta && (
                  <span className="text-[11px] font-medium text-slate-500 mb-1 ml-1">
                    {m.senderName}
                  </span>
                )}

                <div
                  className={`rounded-2xl overflow-hidden max-w-full ${
                    mine
                      ? "rounded-br-md"
                      : "rounded-bl-md border border-slate-200"
                  } ${recalled ? "opacity-65" : ""}`}
                >
                  {m.replyTo && !recalled && (
                    <button
                      type="button"
                      onClick={() => scrollToMessage(m.replyTo!.id)}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 border-b transition-opacity hover:opacity-80 ${
                        mine
                          ? "bg-sky-700 border-sky-400/30"
                          : "bg-sky-50 border-slate-200"
                      }`}
                    >
                      <div
                        className={`w-[3px] self-stretch rounded-full shrink-0 ${
                          mine ? "bg-white/60" : "bg-sky-500"
                        }`}
                      />
                      {m.replyTo.type === "IMAGE" &&
                        m.replyTo.mediaUrl &&
                        !m.replyTo.isRecalled && (
                          <img
                            src={m.replyTo.mediaUrl}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                          />
                        )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-[11px] font-medium truncate ${mine ? "text-sky-100" : "text-sky-700"}`}
                        >
                          {m.replyTo.senderName}
                        </p>
                        <p
                          className={`text-[11px] truncate mt-0.5 ${mine ? "text-sky-100/80" : "text-slate-500"}`}
                        >
                          {replyPreview(m.replyTo)}
                        </p>
                      </div>
                    </button>
                  )}

                  <div
                    className={`px-4 py-2.5 text-sm ${
                      mine
                        ? "bg-sky-600 text-white"
                        : "bg-white text-slate-900"
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
                            className="block mb-2"
                          >
                            <img
                              src={m.mediaUrl}
                              alt=""
                              className="max-h-64 max-w-full rounded-2xl object-cover"
                            />
                          </a>
                        ) : null}
                        {m.type === "FILE" && m.mediaUrl ? (
                          <a
                            href={m.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center gap-2 rounded-2xl px-3 py-2 mb-1 text-sm font-semibold ${
                              mine
                                ? "bg-white/10 text-white"
                                : "bg-slate-50 text-sky-700"
                            }`}
                          >
                            <FileText className="w-4 h-4 shrink-0" />
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

                <span
                  className={`text-[10px] text-slate-400 mt-1 px-1 ${mine ? "text-right" : "text-left"}`}
                >
                  {formatRelativeTimeVi(m.createdAt)}
                </span>
              </div>

              <div
                className={`flex shrink-0 items-center gap-0.5 rounded-full border border-slate-200 bg-white/95 p-0.5 shadow-sm transition-all duration-150 ${
                  hoveredMsgId === m.id
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-1 opacity-0"
                } ${mine ? "flex-row-reverse" : "flex-row"}`}
              >
                <button
                  type="button"
                  title="Trả lời"
                  onClick={() => setReplyTarget(m)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-700"
                >
                  <CornerUpLeft className="h-4 w-4" />
                </button>
                {onForward && (
                  <button
                    type="button"
                    title="Chuyển tiếp"
                    onClick={() => setForwardTarget(m)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-700"
                  >
                    <CornerUpRight className="h-4 w-4" />
                  </button>
                )}
                {mine && (
                  <button
                    type="button"
                    title="Thu hồi tin nhắn"
                    onClick={() => onRecall(m.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {replyTarget && (
        <div className="px-5 py-3 border-t border-slate-200 bg-sky-50 flex items-center gap-3 shrink-0">
          <CornerUpLeft className="w-4 h-4 text-sky-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sky-800">
              Đang trả lời {replyTarget.senderName}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {messagePreview(replyTarget)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyTarget(null)}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors flex items-center justify-center shrink-0"
            title="Bỏ trả lời"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form
        className="px-5 py-4 border-t border-slate-200 bg-white flex items-end gap-3 shrink-0"
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
          className="w-11 h-11 rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-sky-600 transition-colors shrink-0 flex items-center justify-center"
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
          className="flex-1 min-w-0 border border-slate-200 rounded-2xl px-4 py-3 text-sm resize-none overflow-hidden focus:outline-none focus:ring-1 focus:ring-sky-100 focus:border-sky-400 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400"
          placeholder="Nhập tin nhắn... Enter để gửi"
          style={{ height: "44px" }}
        />
        <button
          type="submit"
          disabled={!body.trim()}
          className="w-11 h-11 rounded-2xl bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-40 disabled:pointer-events-none transition-colors shrink-0 flex items-center justify-center"
          title="Gửi"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {showMembers &&
        isGroup &&
        createPortal(
          (
        <div
          className="fixed inset-0 z-[9999] flex min-h-dvh w-screen items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="group-members-title"
          onMouseDown={() => setShowMembers(false)}
        >
          <div
            className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <h3
                  id="group-members-title"
                  className="text-base font-semibold text-slate-950"
                >
                  Thành viên nhóm
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {conversation.conversationName} · {conversation.membersCount ?? conversation.participants.length} thành viên
                  {(conversation.onlineMembersCount || 0) > 0
                    ? ` · ${conversation.onlineMembersCount} người đang hoạt động`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMembers(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/70 px-5 py-4">
              <div className="grid gap-3 md:grid-cols-2">
                {[...conversation.participants].sort((a, b) => {
                  if (a.role !== b.role) return a.role === ROLE_NAME.ADMIN ? -1 : 1;
                  if (Boolean(a.isOnline) !== Boolean(b.isOnline)) return a.isOnline ? -1 : 1;
                  return (a.fullName || a.username || "").localeCompare(
                    b.fullName || b.username || "",
                    "vi",
                  );
                }).map((p) => {
                  const displayName = p.fullName?.trim()
                    ? `${p.fullName} (${p.username})`
                    : p.username;
                  const presenceText = formatLastSeen(p.isOnline, p.lastSeenAt);
                  return (
                    <div
                      key={p.userId}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <UserAvatar
                          name={p.fullName || p.username}
                          url={p.avatar}
                          sizeClass="w-10 h-10"
                          isOnline={p.isOnline}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-slate-800">
                            {displayName}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {p.role === ROLE_NAME.ADMIN && (
                              <span className="inline-flex rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                Admin
                              </span>
                            )}
                            {presenceText ? (
                              <span
                                className={`truncate text-[10px] font-medium ${
                                  p.isOnline ? "text-emerald-600" : "text-slate-400"
                                }`}
                              >
                                {presenceText}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      {isGroupAdmin && p.userId !== currentUserId && (
                        <button
                          type="button"
                          className="shrink-0 rounded-lg px-2 py-1 text-xs text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
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
                <div className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <UserPlus className="h-4 w-4 text-sky-600" />
                    Thêm thành viên
                  </p>
                  <MemberSearchPicker
                    excludeUserIds={participantIds}
                    selected={pendingAdds}
                    onSelectedChange={setPendingAdds}
                    searchUsers={searchUsers}
                    placeholder="Tìm người để thêm..."
                  />
                  <button
                    type="button"
                    className="rounded-2xl bg-sky-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-50"
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
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                className="text-xs font-medium text-slate-500 hover:text-slate-800"
                onClick={() => onLeaveGroup?.()}
              >
                Rời nhóm
              </button>
              {isGroupAdmin && (
                <button
                  type="button"
                  className="text-xs font-medium text-rose-500 hover:text-rose-600"
                  onClick={() => onDeleteGroup?.()}
                >
                  Xóa nhóm
                </button>
              )}
            </div>
          </div>
        </div>
          ),
          document.body,
        )}

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
