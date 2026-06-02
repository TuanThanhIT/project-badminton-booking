import { useMemo, useState } from "react";
import { Edit3, MessageCircle, Plus, Search, Users, X } from "lucide-react";
import type { Conversation } from "../../../../types/message";
import type { UserSearchHit } from "../../../../types/userSearch";
import { formatRelativeTimeVi } from "../../../../utils/formatRelativeTimeVi";

export type SidebarTab = "all" | "unread" | "group";

type ConversationSidebarProps = {
  conversations: Conversation[];
  selectedConversationId?: number;
  currentUserId?: number;
  starterUsers?: UserSearchHit[];
  loadingStarterUsers?: boolean;
  onSelect: (id: number) => void;
  onStartDirect?: (userId: number) => void;
  onCreateGroup: () => void;
};

const lastPreview = (c: Conversation): string => {
  const lm = c.lastMessage;
  if (!lm) return "Chưa có tin nhắn";
  if (lm.isRecalled) return "Tin nhắn đã thu hồi";
  if (lm.type === "IMAGE") return lm.body?.trim() ? lm.body : "Đã gửi một ảnh";
  if (lm.type === "FILE") return lm.body?.trim() ? lm.body : "Đã gửi một tệp";
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

  return (
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-extrabold shrink-0 overflow-hidden shadow-sm ${
        isGroup
          ? "bg-gradient-to-br from-sky-500 to-emerald-500"
          : "bg-gradient-to-br from-sky-400 to-indigo-500"
      }`}
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

const ConversationSidebar = ({
  conversations,
  selectedConversationId,
  currentUserId,
  starterUsers = [],
  loadingStarterUsers = false,
  onSelect,
  onStartDirect,
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
      const participantName = c.participants
        .map((p) => `${p.fullName || ""} ${p.username}`)
        .join(" ")
        .toLowerCase();
      return (
        name.includes(q) || preview.includes(q) || participantName.includes(q)
      );
    });
  }, [conversations, query, tab]);

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [filtered],
  );

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations],
  );

  return (
    <aside className="w-[22rem] border-r border-slate-200 bg-white flex flex-col min-h-0">
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-xl text-slate-950">
                Tin nhắn
              </h2>
              {totalUnread > 0 && (
                <span className="min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {conversations.length} hội thoại đang hoạt động
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateGroup}
            className="w-10 h-10 rounded-2xl bg-sky-600 text-white hover:bg-sky-500 transition-colors flex items-center justify-center shadow-lg shadow-sky-600/20"
            title="Tạo nhóm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm hội thoại, thành viên..."
            className="w-full h-11 pl-10 pr-10 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-100 focus:border-sky-400 transition-all placeholder:text-slate-400"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1">
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
              className={`h-9 rounded-xl text-xs font-bold transition-all ${
                tab === key
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-3 bg-slate-50/80">
        {conversations.length === 0 && !query.trim() && tab === "all" ? (
          <div className="space-y-3">
            <div className="rounded-3xl border border-sky-100 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    Bắt đầu chat với nhân viên
                  </p>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Chọn một nhân viên trong chi nhánh để tạo hội thoại 1-1.
                  </p>
                </div>
              </div>
            </div>

            {loadingStarterUsers ? (
              <div className="rounded-3xl bg-white border border-slate-100 px-4 py-8 text-center text-sm text-slate-400">
                Dang tai danh sach nhan vien...
              </div>
            ) : starterUsers.length === 0 ? (
              <div className="h-full min-h-[240px] flex flex-col items-center justify-center gap-3 text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-300 flex items-center justify-center shadow-sm">
                  <Edit3 className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  Chưa có nhân viên trong chi nhánh
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Thêm nhân viên trước sau đó quay lại đây để bắt đầu chat.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {starterUsers.map((user) => {
                  const displayName = user.fullName?.trim() || user.username;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => onStartDirect?.(user.id)}
                      className="group w-full text-left p-3 flex items-center gap-3 rounded-3xl border border-transparent bg-white/80 hover:bg-white hover:border-sky-100 hover:shadow-sm transition-all"
                    >
                      <ConvAvatar
                        name={displayName}
                        url={user.avatar}
                        isGroup={false}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          @{user.username}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Chat
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : sorted.length === 0 ? (
          <div className="h-full min-h-[280px] flex flex-col items-center justify-center gap-3 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-300 flex items-center justify-center shadow-sm">
              <Edit3 className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              {query ? "Không tìm thấy hội thoại" : "Chưa có hội thoại nào"}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tạo nhóm hoặc bắt đầu trò chuyện từ hồ sơ người chơi.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((conversation) => {
              const unread = conversation.unreadCount || 0;
              const isGroup = conversation.type === "GROUP";
              const otherParticipant = !isGroup
                ? conversation.participants.find(
                    (p) => p.userId !== currentUserId,
                  )
                : undefined;
              const displayName = isGroup
                ? conversation.conversationName
                : otherParticipant?.fullName?.trim() ||
                  otherParticipant?.username ||
                  conversation.conversationName;
              const avatarUrl = !isGroup
                ? otherParticipant?.avatar
                : conversation.avatar;
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
                  className={`group w-full text-left p-3 flex items-start gap-3 rounded-3xl border transition-all ${
                    isSelected
                      ? "bg-white border-sky-200 shadow-[0_12px_30px_rgba(14,165,233,0.12)]"
                      : "bg-white/80 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm"
                  }`}
                >
                  <div className="relative shrink-0">
                    <ConvAvatar
                      name={displayName}
                      url={avatarUrl}
                      isGroup={isGroup}
                    />
                    {isGroup ? (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-600 flex items-center justify-center border-2 border-white">
                        <Users className="w-2.5 h-2.5 text-white" />
                      </div>
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p
                        className={`text-sm truncate ${
                          unread > 0
                            ? "font-extrabold text-slate-950"
                            : "font-bold text-slate-800"
                        }`}
                      >
                        {displayName}
                      </p>
                      <span className="text-[10px] text-slate-400 tabular-nums whitespace-nowrap pt-0.5">
                        {conversation.lastMessage
                          ? formatRelativeTimeVi(
                              conversation.lastMessage.createdAt,
                            )
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <p
                        className={`flex-1 min-w-0 text-xs truncate leading-snug ${
                          unread > 0
                            ? "text-slate-700 font-semibold"
                            : "text-slate-400"
                        }`}
                      >
                        {lastMsgSender}
                        {preview}
                      </p>
                      {unread > 0 && (
                        <span className="min-w-[1.2rem] h-[1.2rem] px-1.5 flex items-center justify-center rounded-full bg-sky-600 text-white text-[9px] font-extrabold">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ConversationSidebar;
