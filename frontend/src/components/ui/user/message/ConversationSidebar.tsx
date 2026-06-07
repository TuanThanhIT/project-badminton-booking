import { useEffect, useMemo, useState } from "react";
import { Edit3, Loader2, MessageCircle, Plus, Search, Users, X } from "lucide-react";
import type { Conversation } from "../../../../types/message";
import type { UserSearchHit } from "../../../../types/userSearch";
import { formatRelativeTimeVi } from "../../../../utils/formatRelativeTimeVi";
import { formatLastSeen } from "../../../../utils/formatLastSeen";

export type SidebarTab = "all" | "unread" | "group";

type ConversationSidebarProps = {
  conversations: Conversation[];
  selectedConversationId?: number;
  loadingConversationId?: number | null;
  currentUserId?: number;
  starterUsers?: UserSearchHit[];
  loadingStarterUsers?: boolean;
  startTitle?: string;
  startDescription?: string;
  starterLoadingText?: string;
  starterEmptyTitle?: string;
  starterEmptyDescription?: string;
  searchUsers?: (q: string, limit?: number) => Promise<UserSearchHit[]>;
  directSearchTitle?: string;
  onSelect: (id: number) => void | Promise<void>;
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
  isOnline,
}: {
  name: string;
  url?: string | null;
  isGroup: boolean;
  isOnline?: boolean;
}) => {
  const [imgErr, setImgErr] = useState(false);
  const letter = (name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="relative h-12 w-12 shrink-0">
      <div
        className={`h-12 w-12 overflow-hidden rounded-2xl flex items-center justify-center text-base font-bold bg-sky-100 text-sky-700 ring-1 ring-sky-200`}
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
      {!isGroup && isOnline ? (
        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
      ) : null}
    </div>
  );
};

const ConversationSidebar = ({
  conversations,
  selectedConversationId,
  loadingConversationId,
  currentUserId,
  starterUsers = [],
  loadingStarterUsers = false,
  startTitle = "Bắt đầu cuộc trò chuyện",
  startDescription = "Chọn một người phù hợp để tạo hội thoại 1-1.",
  starterLoadingText = "Đang tải danh sách gợi ý...",
  starterEmptyTitle = "Chưa có gợi ý trò chuyện",
  starterEmptyDescription = "Tìm người từ hồ sơ hoặc tạo nhóm để bắt đầu trò chuyện.",
  searchUsers,
  directSearchTitle = "Người dùng",
  onSelect,
  onStartDirect,
  onCreateGroup,
}: ConversationSidebarProps) => {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SidebarTab>("all");
  const [directHits, setDirectHits] = useState<UserSearchHit[]>([]);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState("");

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

  useEffect(() => {
    const q = query.trim();
    if (!searchUsers || !onStartDirect || q.length < 1) {
      setDirectHits([]);
      setDirectError("");
      setDirectLoading(false);
      return;
    }

    let cancelled = false;
    setDirectLoading(true);
    setDirectError("");
    const timer = window.setTimeout(() => {
      searchUsers(q, 8)
        .then((users) => {
          if (cancelled) return;
          setDirectHits(
            (users || []).filter((user) => user.id !== currentUserId),
          );
        })
        .catch(() => {
          if (cancelled) return;
          setDirectHits([]);
          setDirectError("Không tải được danh sách người dùng.");
        })
        .finally(() => {
          if (!cancelled) setDirectLoading(false);
        });
    }, 320);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [currentUserId, onStartDirect, query, searchUsers]);

  const handleStartDirect = (userId: number) => {
    onStartDirect?.(userId);
    setQuery("");
    setDirectHits([]);
  };

  return (
    <aside className="w-[22rem] border-r border-slate-200 bg-white flex flex-col min-h-0">
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xl text-slate-950">
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
            className="w-10 h-10 rounded-2xl bg-sky-600 text-white hover:bg-sky-500 transition-colors flex items-center justify-center"
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
            placeholder="Tìm username, SĐT hoặc email..."
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
          {searchUsers && onStartDirect && query.trim() ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-2xl border border-slate-200 bg-white p-2 shadow-md">
              <div className="mb-1 flex items-center justify-between gap-3 px-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {directSearchTitle}
                </p>
                {directLoading ? (
                  <span className="text-[11px] text-slate-400">Đang tìm...</span>
                ) : null}
              </div>

              {directError ? (
                <p className="px-2 py-2 text-xs font-medium text-rose-600">
                  {directError}
                </p>
              ) : directHits.length > 0 ? (
                <div className="max-h-72 overflow-y-auto">
                  {directHits.map((user) => {
                    const displayName = user.fullName?.trim() || user.username;
                    const detail = user.phoneNumber || user.email || `@${user.username}`;

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleStartDirect(user.id)}
                        className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-sky-50"
                      >
                        <ConvAvatar
                          name={displayName}
                          url={user.avatar}
                          isGroup={false}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-800">
                            {displayName}
                          </span>
                          <span className="block truncate text-xs text-slate-400">
                            {detail}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700">
                          Chat
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : !directLoading ? (
                <p className="px-2 py-2 text-xs text-slate-400">
                  Không tìm thấy theo username, số điện thoại hoặc email.
                </p>
              ) : null}
            </div>
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
                  ? "bg-white text-sky-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-3 bg-slate-50">

        {conversations.length === 0 && !query.trim() && tab === "all" ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-sky-100 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {startTitle}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {startDescription}
                  </p>
                </div>
              </div>
            </div>

            {loadingStarterUsers ? (
              <div className="rounded-2xl bg-white border border-slate-100 px-4 py-8 text-center text-sm text-slate-400">
                {starterLoadingText}
              </div>
            ) : starterUsers.length === 0 ? (
              <div className="h-full min-h-[240px] flex flex-col items-center justify-center gap-3 text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-300 flex items-center justify-center">
                  <Edit3 className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold text-slate-600">
                  {starterEmptyTitle}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {starterEmptyDescription}
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
                      className="group w-full text-left p-3 flex items-center gap-3 rounded-2xl border border-transparent bg-white/80 hover:bg-white hover:border-sky-100 transition-all"
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
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-300 flex items-center justify-center">
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
              const privatePresence = !isGroup
                ? {
                    isOnline:
                      conversation.otherParticipant?.isOnline ??
                      otherParticipant?.isOnline ??
                      false,
                    lastSeenAt:
                      conversation.otherParticipant?.lastSeenAt ??
                      otherParticipant?.lastSeenAt ??
                      null,
                  }
                : null;
              const isSelected = selectedConversationId === conversation.id;
              const isLoading = loadingConversationId === conversation.id;
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
                  disabled={isLoading}
                  onClick={() => onSelect(conversation.id)}
                  className={`group relative w-full overflow-hidden text-left p-3 flex items-start gap-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-sky-300 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                      : "border-transparent bg-white/80 hover:border-slate-200 hover:bg-white hover:shadow-sm"
                  } ${isLoading ? "cursor-wait" : ""}`}
                >
                  <div className="relative shrink-0">
                    <ConvAvatar
                      name={displayName}
                      url={avatarUrl}
                      isGroup={isGroup}
                      isOnline={privatePresence?.isOnline}
                    />
                    {isGroup ? (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-600 flex items-center justify-center border-2 border-white">
                        <Users className="w-2.5 h-2.5 text-white" />
                      </div>
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p
                        className={`text-sm truncate ${
                          unread > 0
                            ? "font-bold text-slate-950"
                            : "font-bold text-slate-800"
                        }`}
                      >
                        {displayName}
                      </p>
                      {isLoading ? (
                        <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-sky-500" />
                      ) : (
                        <span className="text-[10px] text-slate-400 tabular-nums whitespace-nowrap pt-0.5">
                          {conversation.lastMessage
                            ? formatRelativeTimeVi(
                                conversation.lastMessage.createdAt,
                              )
                            : ""}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <p
                        className={`flex-1 min-w-0 text-xs truncate leading-snug ${
                          unread > 0
                            ? "text-slate-700 font-semibold"
                            : "text-slate-400"
                        }`}
                      >
                        {isGroup && (conversation.onlineMembersCount || 0) > 0
                          ? `${conversation.onlineMembersCount} người đang hoạt động`
                          : privatePresence?.isOnline
                            ? formatLastSeen(true)
                            : `${lastMsgSender}${preview}`}
                      </p>
                      {unread > 0 && (
                        <span className="min-w-[1.2rem] h-[1.2rem] px-1.5 flex items-center justify-center rounded-full bg-sky-600 text-white text-[9px] font-bold">
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
