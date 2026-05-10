import { useMemo, useState } from "react";
import { Edit3, Search, Users } from "lucide-react";
import type { Conversation } from "../../../../types/message";
import { formatRelativeTimeVi } from "../../../../utils/formatRelativeTimeVi";

export type SidebarTab = "all" | "unread" | "group";

type ConversationSidebarProps = {
  conversations: Conversation[];
  selectedConversationId?: number;
  currentUserId?: number;
  onSelect: (id: number) => void;
  onCreateGroup: () => void;
};

const lastPreview = (c: Conversation): string => {
  const lm = c.lastMessage;
  if (!lm) return "Chưa có tin nhắn";
  if (lm.isRecalled) return "Tin nhắn đã thu hồi";
  if (lm.type === "IMAGE") return lm.body?.trim() ? lm.body : "📷 Đã gửi một ảnh";
  if (lm.type === "FILE") return lm.body?.trim() ? lm.body : "📎 Đã gửi một tệp";
  return lm.body || "";
};

const ConvAvatar = ({
  name,
  url,
  isGroup,
}: {
  name: string;
  url?: string | null;
  isGroup: boolean;
}) => {
  const [imgErr, setImgErr] = useState(false);
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  if (isGroup) {
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-emerald-500 flex items-center justify-center text-white text-base font-bold shrink-0">
        {letter}
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-300 to-indigo-400 flex items-center justify-center text-white text-base font-bold shrink-0 overflow-hidden">
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

const ConversationSidebar = ({
  conversations,
  selectedConversationId,
  currentUserId,
  onSelect,
  onCreateGroup,
}: ConversationSidebarProps) => {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SidebarTab>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      if (tab === "unread" && (c.unreadCount || 0) < 1) return false;
      if (tab === "group" && c.type !== "GROUP") return false;
      if (!q) return true;
      const name = c.conversationName.toLowerCase();
      const preview = lastPreview(c).toLowerCase();
      return name.includes(q) || preview.includes(q);
    });
  }, [conversations, query, tab]);

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime(),
      ),
    [filtered],
  );

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations],
  );

  return (
    <aside className="w-80 border-r border-gray-200 bg-white flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg text-gray-900">Tin nhắn</h2>
            {totalUnread > 0 && (
              <span className="min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onCreateGroup}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition-colors font-medium"
          >
            <Users className="w-3.5 h-3.5" />
            Tạo nhóm
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm hội thoại…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-shadow"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {(
            [
              ["all", "Tất cả"],
              ["unread", "Chưa đọc"],
              ["group", "Nhóm"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === key
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
            <Edit3 className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
            <p className="text-sm text-gray-400">
              {query ? "Không tìm thấy hội thoại" : "Chưa có hội thoại nào"}
            </p>
          </div>
        ) : (
          sorted.map((conversation) => {
            const unread = conversation.unreadCount || 0;
            const isGroup = conversation.type === "GROUP";
            const otherParticipant = !isGroup
              ? conversation.participants.find((p) => p.userId !== currentUserId)
              : undefined;
            const displayName = isGroup
              ? conversation.conversationName
              : otherParticipant?.fullName?.trim() ||
                otherParticipant?.username ||
                conversation.conversationName;
            const avatarUrl = !isGroup ? otherParticipant?.avatar : conversation.avatar;
            const isSelected = selectedConversationId === conversation.id;
            const preview = lastPreview(conversation);
            const lastMsgSender =
              isGroup && conversation.lastMessage
                ? conversation.lastMessage.senderId === currentUserId
                  ? "Bạn: "
                  : `${conversation.lastMessage.senderName.split(" ").pop()}: `
                : "";

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={`w-full text-left px-3 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                  isSelected ? "bg-sky-50 hover:bg-sky-50" : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <ConvAvatar
                    name={displayName}
                    url={avatarUrl}
                    isGroup={isGroup}
                  />
                  {isGroup && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center border-2 border-white">
                      <Users className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p
                      className={`text-sm truncate ${
                        unread > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-800"
                      }`}
                    >
                      {displayName}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-gray-400 tabular-nums whitespace-nowrap">
                        {conversation.lastMessage
                          ? formatRelativeTimeVi(conversation.lastMessage.createdDate)
                          : ""}
                      </span>
                      {unread > 0 && (
                        <span className="min-w-[1.1rem] h-[1.1rem] px-1 flex items-center justify-center rounded-full bg-sky-600 text-white text-[9px] font-bold">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <p
                    className={`text-xs truncate leading-snug ${
                      unread > 0 ? "text-gray-700 font-medium" : "text-gray-400"
                    }`}
                  >
                    {lastMsgSender}
                    {preview}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default ConversationSidebar;
