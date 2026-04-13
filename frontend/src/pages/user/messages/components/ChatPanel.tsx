import { useMemo, useRef, useState } from "react";
import type { ChatMessage, Conversation } from "../../../../types/message";
import type { UserSearchHit } from "../../../../types/userSearch";
import MemberSearchPicker from "./MemberSearchPicker";
import { formatRelativeTimeVi } from "../../../../utils/formatRelativeTimeVi";

type ChatPanelProps = {
  conversation?: Conversation;
  messages: ChatMessage[];
  currentUserId?: number;
  isGroupAdmin?: boolean;
  onSend: (body: string) => Promise<void>;
  onUploadFile: (file: File, caption?: string) => Promise<void>;
  onRecall: (messageId: number) => Promise<void>;
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

const ChatPanel = ({
  conversation,
  messages,
  currentUserId,
  isGroupAdmin,
  onSend,
  onUploadFile,
  onRecall,
  onLeaveGroup,
  onDeleteGroup,
  onAddMembers,
  onRemoveMember,
}: ChatPanelProps) => {
  const formatParticipantLabel = (fullName?: string | null, username?: string) => {
    const name = fullName?.trim();
    if (name && username) return `${name} (${username})`;
    return username || name || "Người dùng";
  };

  const formatMemberDisplay = (fullName?: string | null, username?: string, isAdmin?: boolean) => {
    const base = formatParticipantLabel(fullName, username);
    return isAdmin ? `${base}(Admin)` : base;
  };

  const [body, setBody] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [pendingAdds, setPendingAdds] = useState<UserSearchHit[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const participantIds = useMemo(
    () => conversation?.participants.map((p) => p.userId) ?? [],
    [conversation?.participants],
  );

  const sorted = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
      ),
    [messages],
  );

  const rows = useMemo(() => {
    const out: { kind: "day"; label: string } | { kind: "msg"; message: ChatMessage; showMeta: boolean }[] = [];
    let lastDay = "";
    let prev: ChatMessage | null = null;
    for (const m of sorted) {
      const dk = dayKeyVi(m.createdDate);
      if (dk && dk !== lastDay) {
        lastDay = dk;
        out.push({ kind: "day", label: dk });
      }
      const sameSender = prev && prev.senderId === m.senderId;
      const gapMin =
        prev &&
        (new Date(m.createdDate).getTime() - new Date(prev.createdDate).getTime()) / 60000 < 4;
      const showMeta = !(sameSender && gapMin);
      out.push({ kind: "msg", message: m, showMeta });
      prev = m;
    }
    return out;
  }, [sorted]);

  if (!conversation) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center text-gray-500 text-sm">
        Chọn một hội thoại để bắt đầu nhắn tin.
      </div>
    );
  }

  return (
    <section className="flex-1 bg-gray-50 flex flex-col min-w-0 min-h-0">
      <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{conversation.conversationName}</h3>
          {conversation.type === "Group" ? (
            <button
              type="button"
              onClick={() => setShowMembers((v) => !v)}
              className="text-xs text-sky-600 hover:underline mt-0.5"
            >
              {showMembers ? "Ẩn thành viên" : "Thành viên & quản lý"}
            </button>
          ) : null}
        </div>
      </div>

      {showMembers && conversation.type === "Group" ? (
        <div className="border-b border-gray-200 bg-white px-4 py-3 text-sm space-y-3 max-h-72 overflow-y-auto shrink-0">
          <ul className="space-y-1">
            {conversation.participants.map((p) => (
              <li key={p.userId} className="flex items-center justify-between gap-2">
                <span
                  className={`truncate ${p.role === "Admin" ? "text-amber-700" : ""}`}
                  title={formatMemberDisplay(p.fullName, p.username, p.role === "Admin")}
                >
                  {formatMemberDisplay(p.fullName, p.username, p.role === "Admin")}
                </span>
                {isGroupAdmin && p.userId !== currentUserId ? (
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline shrink-0"
                    onClick={() => onRemoveMember?.(p.userId)}
                  >
                    Xóa
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          {isGroupAdmin ? (
            <div className="space-y-2 pt-1 border-t border-gray-100">
              <p className="text-xs text-gray-500">Thêm thành viên (tìm theo tên hoặc username)</p>
              <MemberSearchPicker
                excludeUserIds={participantIds}
                selected={pendingAdds}
                onSelectedChange={setPendingAdds}
                placeholder="Tìm người để thêm…"
              />
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-lg bg-sky-600 text-white disabled:opacity-50"
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
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              className="text-xs text-gray-600 underline"
              onClick={() => onLeaveGroup?.()}
            >
              Rời nhóm
            </button>
            {isGroupAdmin ? (
              <button
                type="button"
                className="text-xs text-red-600 underline"
                onClick={() => onDeleteGroup?.()}
              >
                Xóa nhóm
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 min-h-0">
        {rows.map((row, idx) => {
          if (row.kind === "day") {
            return (
              <div key={`d-${row.label}-${idx}`} className="flex justify-center py-2">
                <span className="text-[11px] text-gray-500 bg-white/90 px-3 py-0.5 rounded-full shadow-sm border border-gray-100">
                  {row.label}
                </span>
              </div>
            );
          }
          const m = row.message;
          const mine = m.senderId === currentUserId;
          const recalled = m.isRecalled;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"} ${row.showMeta ? "mt-2" : "mt-0.5"}`}
            >
              <div className={`max-w-[78%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
                {!mine && row.showMeta ? (
                  <span className="text-[11px] text-gray-500 mb-0.5 px-1">{m.senderName}</span>
                ) : null}
                <div
                  className={`relative px-3 py-2 rounded-2xl text-sm shadow-sm ${
                    mine
                      ? "bg-sky-600 text-white rounded-br-md"
                      : "bg-white text-gray-900 border border-gray-100 rounded-bl-md"
                  } ${recalled ? "opacity-75 italic" : ""}`}
                >
                  {recalled ? (
                    <p className="text-xs">Tin nhắn đã thu hồi</p>
                  ) : (
                    <>
                      {m.type === "Image" && m.mediaUrl ? (
                        <a href={m.mediaUrl} target="_blank" rel="noreferrer" className="block mb-1">
                          <img
                            src={m.mediaUrl}
                            alt=""
                            className="max-h-48 rounded-lg object-cover"
                          />
                        </a>
                      ) : null}
                      {m.type === "File" && m.mediaUrl ? (
                        <a
                          href={m.mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-sm underline break-all ${mine ? "text-sky-100" : "text-sky-700"}`}
                        >
                          Tải tệp
                        </a>
                      ) : null}
                      {m.body?.trim() ? (
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      ) : null}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 px-1">
                  <span className="text-[10px] text-gray-400">{formatRelativeTimeVi(m.createdDate)}</span>
                  {mine && !recalled ? (
                    <button
                      type="button"
                      className="text-[10px] text-gray-400 hover:text-red-500"
                      onClick={() => onRecall(m.id)}
                    >
                      Thu hồi
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        className="p-3 border-t border-gray-200 bg-white flex flex-wrap gap-2 items-end shrink-0"
        onSubmit={async (e) => {
          e.preventDefault();
          const text = body.trim();
          if (!text) return;
          await onSend(text);
          setBody("");
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
            }
          }}
        />
        <button
          type="button"
          className="px-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          onClick={() => fileRef.current?.click()}
        >
          Đính kèm
        </button>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 min-w-[120px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
          placeholder="Nhập tin nhắn…"
        />
        <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium">
          Gửi
        </button>
      </form>
    </section>
  );
};

export default ChatPanel;
