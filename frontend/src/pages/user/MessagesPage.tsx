import { useEffect, useMemo, useState } from "react";
import { MessageCircle, ShieldCheck, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  addMembersToGroup,
  appendSocketMessage,
  clearUnreadFromSocket,
  createGroupConversation,
  deleteGroupConversation,
  getConversations,
  getMessages,
  leaveGroup,
  markMessageRecalled,
  recallMessage,
  removeConversationLocal,
  removeMemberFromGroup,
  selectConversation,
  sendMessage,
  uploadChatAttachment,
} from "../../redux/slices/user/conversationSlice";
import { store } from "../../redux/store";
import { connectSocket, socket } from "../../socket";
import type { ChatMessage } from "../../types/message";
import ChatPanel from "../../components/ui/user/message/ChatPanel";
import ConversationSidebar from "../../components/ui/user/message/ConversationSidebar";
import CreateGroupModal from "../../components/ui/user/message/CreateGroupModal";

const MessagesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const authUser = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const loadingConversations = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["conversation/getConversations"]),
  );
  const loadingMessages = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["conversation/getMessages"]),
  );
  const sendingMessage = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["conversation/sendMessage"]),
  );
  const uploadingAttachment = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["conversation/uploadChatAttachment"]),
  );
  const conversations = useAppSelector((state) => state.conversation.conversations);
  const selectedConversationId = useAppSelector(
    (state) => state.conversation.selectedConversationId,
  );
  const messagesByConversation = useAppSelector(
    (state) => state.conversation.messagesByConversation,
  );

  const messages = useMemo(
    () =>
      selectedConversationId ? messagesByConversation[selectedConversationId] || [] : [],
    [selectedConversationId, messagesByConversation],
  );

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId],
  );

  const stats = useMemo(() => {
    const unread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    const groups = conversations.filter((c) => c.type === "GROUP").length;
    return { unread, groups, total: conversations.length };
  }, [conversations]);

  const isGroupAdmin = useMemo(() => {
    if (!selectedConversation || selectedConversation.type !== "GROUP" || !authUser?.id) {
      return false;
    }
    return selectedConversation.participants.some(
      (p) => p.userId === authUser.id && p.role === "ADMIN",
    );
  }, [selectedConversation, authUser?.id]);

  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  useEffect(() => {
    const cid = Number(conversationId);
    if (cid && !Number.isNaN(cid)) {
      dispatch(selectConversation(cid));
      dispatch(getMessages({ conversationId: cid, params: { page: 1, limit: 100 } }));
      socket?.emit("chat:join", cid);
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    const token =
      accessToken ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access_token");
    const uid = authUser?.id;
    if (!token || !uid) return;

    const s = connectSocket(token);

    s.on("chat:new-message", (payload: ChatMessage) => {
      dispatch(appendSocketMessage({ message: payload, currentUserId: uid }));
    });

    s.on("chat:message-recalled", (p: { id: number; conversationId: number }) => {
      dispatch(markMessageRecalled({ id: p.id, conversationId: p.conversationId }));
    });

    s.on("chat:messages-read", (p: { conversationId: number; readerId: number }) => {
      dispatch(clearUnreadFromSocket({ ...p, selfId: uid }));
    });

    s.on("chat:conversation-updated", (p: { conversationId: number; action?: string }) => {
      if (p.action === "deleted") {
        dispatch(removeConversationLocal(p.conversationId));
        const sel = store.getState().conversation.selectedConversationId;
        if (sel === p.conversationId) {
          navigate("/messages", { replace: true });
        }
      } else {
        dispatch(getConversations());
      }
    });

    return () => {
      s.off("chat:new-message");
      s.off("chat:message-recalled");
      s.off("chat:messages-read");
      s.off("chat:conversation-updated");
    };
  }, [dispatch, authUser?.id, navigate, accessToken]);

  const openConversation = (id: number) => {
    dispatch(selectConversation(id));
    dispatch(getMessages({ conversationId: id, params: { page: 1, limit: 100 } }));
    socket?.emit("chat:join", id);
    navigate(`/messages/${id}`);
  };

  const handleForward = async (toConversationId: number, message: ChatMessage) => {
    await dispatch(
      sendMessage({
        conversationId: toConversationId,
        data: {
          body: message.body || "",
          type: message.type,
          mediaUrl: message.mediaUrl || undefined,
        },
      }),
    );
  };

  return (
    <div className="min-h-[calc(100vh-84px)] bg-slate-50 text-slate-800">
      <section className="relative overflow-hidden bg-sky-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_32%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-semibold text-sky-100 mb-4">
                <MessageCircle size={16} className="text-sky-300" />
                B-Hub Chat
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Tin nhắn của bạn
              </h1>
              <p className="mt-3 max-w-2xl text-sky-100 leading-relaxed">
                Kết nối nhanh với bạn chơi, nhóm cầu lông và các cuộc hẹn trong cộng đồng B-Hub.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[420px]">
              {[
                { icon: MessageCircle, value: stats.total, label: "Hội thoại" },
                { icon: ShieldCheck, value: stats.unread, label: "Chưa đọc" },
                { icon: Users, value: stats.groups, label: "Nhóm" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm px-4 py-3 text-white"
                >
                  <item.icon size={17} className="text-sky-200 mb-2" />
                  <p className="text-2xl font-extrabold leading-none">{item.value}</p>
                  <p className="mt-1 text-xs text-sky-100">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-5 pb-8 relative z-10">
        <CreateGroupModal
          open={createGroupOpen}
          currentUserId={authUser?.id}
          onClose={() => setCreateGroupOpen(false)}
          onSubmit={async (name, userIds) => {
            const res = await dispatch(createGroupConversation({ name, userIds })).unwrap();
            openConversation(res.data.id);
          }}
        />

        <div className="h-[76vh] min-h-[620px] rounded-[2rem] overflow-hidden bg-white flex relative shadow-[0_18px_55px_rgba(15,23,42,0.14)] border border-slate-200/80">
          {loadingConversations && conversations.length === 0 ? (
            <aside className="w-[22rem] border-r border-slate-200 bg-white flex items-center justify-center text-sm text-slate-400">
              Đang tải hội thoại...
            </aside>
          ) : (
            <ConversationSidebar
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              currentUserId={authUser?.id}
              onSelect={openConversation}
              onCreateGroup={() => setCreateGroupOpen(true)}
            />
          )}

          <ChatPanel
            conversation={selectedConversation}
            conversations={conversations}
            messages={messages}
            currentUserId={authUser?.id}
            isGroupAdmin={isGroupAdmin}
            onSend={async (text, replyToId) => {
              if (!selectedConversationId) return;
              if (sendingMessage || uploadingAttachment) return;
              await dispatch(
                sendMessage({
                  conversationId: selectedConversationId,
                  data: { body: text, replyToId },
                }),
              );
            }}
            onUploadFile={async (file, caption) => {
              if (!selectedConversationId) return;
              if (sendingMessage || uploadingAttachment) return;
              await dispatch(
                uploadChatAttachment({ conversationId: selectedConversationId, file, caption }),
              );
            }}
            onRecall={async (messageId) => {
              if (!selectedConversationId) return;
              if (!window.confirm("Thu hồi tin nhắn này?")) return;
              await dispatch(recallMessage({ conversationId: selectedConversationId, messageId }));
            }}
            onForward={handleForward}
            onLeaveGroup={
              selectedConversation?.type === "GROUP"
                ? async () => {
                    if (!selectedConversationId || !window.confirm("Rời nhóm này?")) return;
                    await dispatch(leaveGroup({ conversationId: selectedConversationId }));
                    navigate("/messages", { replace: true });
                  }
                : undefined
            }
            onDeleteGroup={
              selectedConversation?.type === "GROUP" && isGroupAdmin
                ? async () => {
                    if (
                      !selectedConversationId ||
                      !window.confirm("Xóa hẳn nhóm cho mọi thành viên?")
                    )
                      return;
                    await dispatch(deleteGroupConversation({ conversationId: selectedConversationId }));
                    navigate("/messages", { replace: true });
                  }
                : undefined
            }
            onAddMembers={
              selectedConversation?.type === "GROUP" && isGroupAdmin
                ? async (userIds) => {
                    if (!selectedConversationId) return;
                    await dispatch(addMembersToGroup({ conversationId: selectedConversationId, userIds }));
                  }
                : undefined
            }
            onRemoveMember={
              selectedConversation?.type === "GROUP" && isGroupAdmin
                ? async (userId) => {
                    if (!selectedConversationId) return;
                    if (!window.confirm("Xóa thành viên khỏi nhóm?")) return;
                    await dispatch(removeMemberFromGroup({ conversationId: selectedConversationId, userId }));
                  }
                : undefined
            }
          />

          {loadingMessages && messages.length === 0 && selectedConversationId ? (
            <div className="absolute inset-y-0 right-0 left-[22rem] flex items-center justify-center pointer-events-none">
              <div className="rounded-full bg-white/90 border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 shadow-sm">
                Đang tải tin nhắn...
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
