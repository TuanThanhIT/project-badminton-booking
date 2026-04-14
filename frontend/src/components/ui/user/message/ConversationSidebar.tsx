import { useMemo, useState } from "react";
import type { Conversation } from "../../../../types/message";

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
  if (lm.type === "Image") return lm.body?.trim() ? lm.body : "Ảnh";
  if (lm.type === "File") return lm.body?.trim() ? lm.body : "Tệp đính kèm";
  return lm.body || "";
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
      if (tab === "group" && c.type !== "Group") return false;
      if (!q) return true;
      const name = c.conversationName.toLowerCase();
      const preview = lastPreview(c).toLowerCase();
      return name.includes(q) || preview.includes(q);
    });
  }, [conversations, query, tab]);

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime(),
      ),
    [filtered],
  );

  return (
    <aside className="w-80 border-r border-gray-200 bg-white flex flex-col min-h-0">
      <div className="p-4 border-b border-gray-200 space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold text-lg text-gray-900">Tin nhắn</h2>
          <button
            type="button"
            onClick={onCreateGroup}
            className="text-xs px-2 py-1 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
          >
            + Nhóm
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên hoặc nội dung…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <div className="flex gap-1 text-xs">
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
              className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                tab === key
                  ? "bg-sky-100 text-sky-800"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {sorted.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">
            Không có hội thoại phù hợp.
          </p>
        ) : (
          sorted.map((conversation) => {
            const unread = conversation.unreadCount || 0;
            const isGroup = conversation.type === "Group";
            const otherParticipant = !isGroup
              ? conversation.participants.find(
                  (p) => p.userId !== currentUserId,
                )
              : undefined;
            const title = isGroup
              ? conversation.conversationName
              : otherParticipant?.username || conversation.conversationName;
            const subtitle = isGroup
              ? `${conversation.participants.length} thành viên`
              : otherParticipant?.username
                ? `@${otherParticipant.username}`
                : "Nhắn tin 1-1";
            const avatarText = isGroup
              ? "N"
              : (title || "U").trim().charAt(0).toUpperCase();
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                  selectedConversationId === conversation.id ? "bg-sky-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                        isGroup
                          ? "bg-sky-100 text-sky-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {avatarText}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isGroup ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700">
                            GROUP
                          </span>
                        ) : null}
                        <span className="text-[11px] text-gray-500 truncate">
                          {subtitle}
                        </span>
                      </div>
                    </div>
                  </div>
                  {unread > 0 ? (
                    <span className="shrink-0 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500 truncate mt-1 ml-11">
                  {lastPreview(conversation)}
                </p>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default ConversationSidebar;
