import { useEffect, useMemo, useState } from "react";
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
import ChatPanel from "../../components/ui/user/message/ChatPanel";
import ConversationSidebar from "../../components/ui/user/message/ConversationSidebar";
import CreateGroupModal from "../../components/ui/user/message/CreateGroupModal";

const MessagesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const authUser = useAppSelector((state) => state.auth.user);
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

  const isGroupAdmin = useMemo(() => {
    if (
      !selectedConversation ||
      selectedConversation.type !== "Group" ||
      !authUser?.id
    ) {
      return false;
    }
    return selectedConversation.participants.some(
      (p) => p.userId === authUser.id && p.role === "Admin",
    );
  }, [selectedConversation, authUser?.id]);

  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  useEffect(() => {
    const cid = Number(conversationId);
    if (cid && !Number.isNaN(cid)) {
      dispatch(selectConversation(cid));
      dispatch(
        getMessages({ conversationId: cid, params: { page: 1, limit: 100 } }),
      );
      socket?.emit("chat:join", cid);
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const uid = authUser?.id;
    if (!token || !uid) return;

    const s = connectSocket(token);

    s.on("chat:new-message", (payload: any) => {
      dispatch(appendSocketMessage({ message: payload, currentUserId: uid }));
    });

    s.on(
      "chat:message-recalled",
      (p: { id: number; conversationId: number }) => {
        dispatch(
          markMessageRecalled({ id: p.id, conversationId: p.conversationId }),
        );
      },
    );

    s.on(
      "chat:messages-read",
      (p: { conversationId: number; readerId: number }) => {
        dispatch(clearUnreadFromSocket({ ...p, selfId: uid }));
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

    return () => {
      s.off("chat:new-message");
      s.off("chat:message-recalled");
      s.off("chat:messages-read");
      s.off("chat:conversation-updated");
    };
  }, [dispatch, authUser?.id, navigate]);

  const openConversation = (id: number) => {
    dispatch(selectConversation(id));
    dispatch(
      getMessages({ conversationId: id, params: { page: 1, limit: 100 } }),
    );
    socket?.emit("chat:join", id);
    navigate(`/messages/${id}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <CreateGroupModal
        open={createGroupOpen}
        currentUserId={authUser?.id}
        onClose={() => setCreateGroupOpen(false)}
        onSubmit={async (name, userIds) => {
          const res = await dispatch(
            createGroupConversation({ name, userIds }),
          ).unwrap();
          const id = res.data.id;
          openConversation(id);
        }}
      />
      <div className="h-[78vh] border border-gray-200 rounded-xl overflow-hidden bg-white flex relative">
        {loadingConversations && conversations.length === 0 ? (
          <aside className="w-80 border-r border-gray-200 bg-white flex items-center justify-center text-sm text-gray-500">
            Đang tải hội thoại…
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
          messages={messages}
          currentUserId={authUser?.id}
          isGroupAdmin={isGroupAdmin}
          onSend={async (text) => {
            if (!selectedConversationId) return;
            if (sendingMessage || uploadingAttachment) return;
            await dispatch(
              sendMessage({
                conversationId: selectedConversationId,
                data: { body: text },
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
            await dispatch(
              recallMessage({
                conversationId: selectedConversationId,
                messageId,
              }),
            );
          }}
          onLeaveGroup={
            selectedConversation?.type === "Group"
              ? async () => {
                  if (
                    !selectedConversationId ||
                    !window.confirm("Rời nhóm này?")
                  )
                    return;
                  await dispatch(
                    leaveGroup({ conversationId: selectedConversationId }),
                  );
                  navigate("/messages", { replace: true });
                }
              : undefined
          }
          onDeleteGroup={
            selectedConversation?.type === "Group" && isGroupAdmin
              ? async () => {
                  if (
                    !selectedConversationId ||
                    !window.confirm("Xóa hẳn nhóm cho mọi thành viên?")
                  ) {
                    return;
                  }
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
            selectedConversation?.type === "Group" && isGroupAdmin
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
            selectedConversation?.type === "Group" && isGroupAdmin
              ? async (userId) => {
                  if (!selectedConversationId) return;
                  if (!window.confirm("Xóa thành viên khỏi nhóm?")) return;
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
        {loadingMessages && messages.length === 0 && selectedConversationId ? (
          <div className="absolute inset-y-0 right-0 left-80 flex items-center justify-center pointer-events-none">
            <div className="text-sm text-gray-500">Đang tải tin nhắn…</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MessagesPage;
