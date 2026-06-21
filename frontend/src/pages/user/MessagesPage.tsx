import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, ShieldCheck, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  addMembersToGroup,
  appendSocketMessage,
  clearSelectedConversation,
  clearUnreadFromSocket,
  createGroupConversation,
  createOrGetDirectConversation,
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
  userPresenceChanged,
  uploadChatAttachment,
} from "../../redux/slices/user/conversationSlice";
import { store } from "../../redux/store";
import { connectSocket, socket } from "../../socket";
import type { ChatMessage, PresencePayload } from "../../types/message";
import ChatPanel from "../../components/ui/user/message/ChatPanel";
import ConversationSidebar from "../../components/ui/user/message/ConversationSidebar";
import CreateGroupModal from "../../components/ui/user/message/CreateGroupModal";
import userSearchService from "../../services/user/userSearchService";
import type { UserSearchHit } from "../../types/userSearch";
import { showConfirmDialog } from "../../utils/confirmDialog";

const MessagesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [loadingConversationId, setLoadingConversationId] = useState<number | null>(null);
  const prefetchedConversationRef = useRef<number | null>(null);

  const authUser = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const loadingConversations = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["conversation/getConversations"]),
  );

  const sendingMessage = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["conversation/sendMessage"]),
  );

  const uploadingAttachment = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["conversation/uploadChatAttachment"]),
  );

  const conversations = useAppSelector(
    (state) => state.conversation.conversations,
  );

  const selectedConversationId = useAppSelector(
    (state) => state.conversation.selectedConversationId,
  );

  const messagesByConversation = useAppSelector(
    (state) => state.conversation.messagesByConversation,
  );

  const messages = useMemo(
    () =>
      selectedConversationId
        ? messagesByConversation[selectedConversationId] || []
        : [],
    [selectedConversationId, messagesByConversation],
  );

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId],
  );

  const stats = useMemo(() => {
    const unread = conversations.reduce(
      (sum, c) => sum + (c.unreadCount || 0),
      0,
    );
    const groups = conversations.filter((c) => c.type === "GROUP").length;

    return {
      unread,
      groups,
      total: conversations.length,
    };
  }, [conversations]);

  const isGroupAdmin = useMemo(() => {
    if (
      !selectedConversation ||
      selectedConversation.type !== "GROUP" ||
      !authUser?.id
    ) {
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
      if (prefetchedConversationRef.current === cid) {
        prefetchedConversationRef.current = null;
        socket?.emit("chat:join", cid);
        return;
      }
      setLoadingConversationId(cid);
      dispatch(
        getMessages({
          conversationId: cid,
          params: {
            page: 1,
            limit: 100,
          },
        }),
      ).finally(() => {
        setLoadingConversationId((current) => (current === cid ? null : current));
      });
      socket?.emit("chat:join", cid);
    } else {
      dispatch(clearSelectedConversation());
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
      dispatch(
        appendSocketMessage({
          message: payload,
          currentUserId: uid,
        }),
      );
    });

    s.on(
      "chat:message-recalled",
      (p: { id: number; conversationId: number }) => {
        dispatch(
          markMessageRecalled({
            id: p.id,
            conversationId: p.conversationId,
          }),
        );
      },
    );

    s.on(
      "chat:messages-read",
      (p: { conversationId: number; readerId: number }) => {
        dispatch(
          clearUnreadFromSocket({
            ...p,
            selfId: uid,
          }),
        );
      },
    );

    s.on(
      "chat:conversation-updated",
      (p: { conversationId: number; action?: string }) => {
        if (p.action === "deleted") {
          dispatch(removeConversationLocal(p.conversationId));

          const sel = store.getState().conversation.selectedConversationId;

          if (sel === p.conversationId) {
            navigate("/messages", { replace: true });
          }
        } else {
          dispatch(getConversations());
        }
      },
    );

    const handlePresence = (payload: PresencePayload) => {
      dispatch(userPresenceChanged(payload));
    };

    s.on("presence:user-online", handlePresence);
    s.on("presence:user-offline", handlePresence);

    return () => {
      s.off("chat:new-message");
      s.off("chat:message-recalled");
      s.off("chat:messages-read");
      s.off("chat:conversation-updated");
      s.off("presence:user-online", handlePresence);
      s.off("presence:user-offline", handlePresence);
    };
  }, [dispatch, authUser?.id, navigate, accessToken]);

  const openConversation = (id: number) => {
    if (id === selectedConversationId || loadingConversationId === id) return;

    setLoadingConversationId(id);
    dispatch(
      getMessages({
        conversationId: id,
        params: {
          page: 1,
          limit: 100,
        },
      }),
    )
      .unwrap()
      .then(() => {
        prefetchedConversationRef.current = id;
        dispatch(selectConversation(id));
        socket?.emit("chat:join", id);
        navigate(`/messages/${id}`);
      })
      .finally(() => {
        setLoadingConversationId((current) => (current === id ? null : current));
      });
  };

  const searchUsers = useCallback(
    async (q: string, limit = 8): Promise<UserSearchHit[]> => {
      const res = await userSearchService.searchUsersService(q, limit);
      return res.data.data || [];
    },
    [],
  );

  const startDirectConversation = async (userId: number) => {
    const res = await dispatch(
      createOrGetDirectConversation({
        userId,
      }),
    ).unwrap();

    openConversation(res.data.id);
  };

  const handleForward = async (
    toConversationId: number,
    message: ChatMessage,
  ) => {
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
      <section className="user-hero-surface text-white">
        <div className="mx-auto max-w-7xl px-4 pb-28 pt-14 sm:px-6 lg:pt-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <div className="user-hero-badge mb-8">
                <MessageCircle />
                B-Hub Chat
              </div>

              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Tin nhắn của bạn
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-sky-50">
                Tìm theo username, email hoặc số điện thoại để bắt đầu trò
                chuyện nhanh với bạn chơi và cộng đồng B-Hub.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-sky-100">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
                  <MessageCircle size={16} />
                  Trò chuyện trực tiếp
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2">
                  <Users size={16} />
                  Tạo nhóm kết nối
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[480px]">
              {[
                {
                  icon: MessageCircle,
                  value: stats.total,
                  label: "Hội thoại",
                },
                {
                  icon: ShieldCheck,
                  value: stats.unread,
                  label: "Chưa đọc",
                },
                {
                  icon: Users,
                  value: stats.groups,
                  label: "Nhóm",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-white"
                >
                  <item.icon size={18} className="text-sky-200" />

                  <p className="mt-4 text-2xl font-bold leading-none">
                    {item.value}
                  </p>

                  <p className="mt-2 text-sm text-sky-100">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 pb-10 sm:px-6">
        <CreateGroupModal
          open={createGroupOpen}
          currentUserId={authUser?.id}
          onClose={() => setCreateGroupOpen(false)}
          onSubmit={async (name, userIds) => {
            const res = await dispatch(
              createGroupConversation({
                name,
                userIds,
              }),
            ).unwrap();

            openConversation(res.data.id);
          }}
        />

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="relative flex h-[76vh] min-h-[620px] overflow-hidden bg-white">
            {loadingConversations && conversations.length === 0 ? (
              <aside className="flex w-[22rem] items-center justify-center border-r border-slate-200 bg-white text-sm text-slate-400">
                Đang tải hội thoại...
              </aside>
            ) : (
              <ConversationSidebar
                conversations={conversations}
                selectedConversationId={selectedConversationId}
                loadingConversationId={loadingConversationId}
                currentUserId={authUser?.id}
                searchUsers={searchUsers}
                directSearchTitle="Tìm người để nhắn"
                onSelect={openConversation}
                onStartDirect={startDirectConversation}
                onCreateGroup={() => setCreateGroupOpen(true)}
              />
            )}

            <ChatPanel
              conversation={selectedConversation}
              conversations={conversations}
              messages={messages}
              loadingMessages={
                loadingConversationId === selectedConversationId
              }
              currentUserId={authUser?.id}
              isGroupAdmin={isGroupAdmin}
              onSend={async (text, replyToId) => {
                if (!selectedConversationId) return;
                if (sendingMessage || uploadingAttachment) return;

                await dispatch(
                  sendMessage({
                    conversationId: selectedConversationId,
                    data: {
                      body: text,
                      replyToId,
                    },
                  }),
                );
              }}
              onUploadFile={async (file, caption) => {
                if (!selectedConversationId) return;
                if (sendingMessage || uploadingAttachment) return;

                await dispatch(
                  uploadChatAttachment({
                    conversationId: selectedConversationId,
                    file,
                    caption,
                  }),
                );
              }}
              onRecall={async (messageId) => {
                if (!selectedConversationId) return;
                const confirmed = await showConfirmDialog(
                  "Thu hồi tin nhắn này?",
                  "Tin nhắn sẽ được thu hồi trong cuộc trò chuyện.",
                  "Thu hồi",
                  "Hủy",
                  "danger",
                );
                if (!confirmed) return;

                await dispatch(
                  recallMessage({
                    conversationId: selectedConversationId,
                    messageId,
                  }),
                );
              }}
              onForward={handleForward}
              onLeaveGroup={
                selectedConversation?.type === "GROUP"
                  ? async () => {
                      if (!selectedConversationId) return;
                      const confirmed = await showConfirmDialog(
                        isGroupAdmin ? "Rời và xóa nhóm?" : "Rời nhóm này?",
                        isGroupAdmin
                          ? "Bạn là admin nhóm. Rời nhóm sẽ xóa nhóm này cho mọi thành viên."
                          : "Bạn sẽ không còn nhận tin nhắn từ nhóm này.",
                        isGroupAdmin ? "Rời và xóa" : "Rời nhóm",
                        "Hủy",
                        "danger",
                      );
                      if (!confirmed) return;

                      await dispatch(
                        leaveGroup({
                          conversationId: selectedConversationId,
                        }),
                      );

                      navigate("/messages", { replace: true });
                    }
                  : undefined
              }
              onDeleteGroup={
                selectedConversation?.type === "GROUP" && isGroupAdmin
                  ? async () => {
                      if (!selectedConversationId) return;
                      const confirmed = await showConfirmDialog(
                        "Xóa nhóm này?",
                        "Nhóm sẽ bị xóa hẳn cho mọi thành viên.",
                        "Xóa nhóm",
                        "Hủy",
                        "danger",
                      );
                      if (!confirmed) return;

                      await dispatch(
                        deleteGroupConversation({
                          conversationId: selectedConversationId,
                        }),
                      );

                      navigate("/messages", { replace: true });
                    }
                  : undefined
              }
              onAddMembers={
                selectedConversation?.type === "GROUP" && isGroupAdmin
                  ? async (userIds) => {
                      if (!selectedConversationId) return;

                      await dispatch(
                        addMembersToGroup({
                          conversationId: selectedConversationId,
                          userIds,
                        }),
                      );
                    }
                  : undefined
              }
              onRemoveMember={
                selectedConversation?.type === "GROUP" && isGroupAdmin
                  ? async (userId) => {
                    if (!selectedConversationId) return;
                    const confirmed = await showConfirmDialog(
                      "Xóa thành viên khỏi nhóm?",
                      "Thành viên này sẽ không còn trong cuộc trò chuyện nhóm.",
                      "Xóa thành viên",
                      "Hủy",
                      "danger",
                    );
                    if (!confirmed) return;

                    await dispatch(
                      removeMemberFromGroup({
                          conversationId: selectedConversationId,
                          userId,
                        }),
                      );
                    }
                  : undefined
              }
            />
          </div>
        </section>
      </main>

    </div>
  );
};

export default MessagesPage;
