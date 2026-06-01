import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, ShieldCheck, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ChatPanel from "../../components/ui/user/message/ChatPanel";
import ConversationSidebar from "../../components/ui/user/message/ConversationSidebar";
import CreateGroupModal from "../../components/ui/user/message/CreateGroupModal";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  addMembersToManagerGroup,
  appendManagerSocketMessage,
  clearManagerUnreadFromSocket,
  createOrGetManagerDirectConversation,
  createManagerGroupConversation,
  deleteManagerGroupConversation,
  getManagerConversations,
  getManagerMessages,
  leaveManagerGroup,
  markManagerMessageRecalled,
  recallManagerMessage,
  removeManagerConversationLocal,
  removeMemberFromManagerGroup,
  searchManagerBranchMembers,
  selectManagerConversation,
  sendManagerMessage,
  uploadManagerChatAttachment,
} from "../../redux/slices/manager/conversationSlice";
import { getEmployees } from "../../redux/slices/manager/employeeSlice";
import { store } from "../../redux/store";
import { connectSocket, socket } from "../../socket";
import type { ChatMessage } from "../../types/message";
import type { UserSearchHit } from "../../types/userSearch";
import { showConfirmDialog } from "../../utils/confirmDialog";

const ConversationPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const authUser = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const loadingConversations = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["managerConversation/getConversations"]),
  );
  const loadingMessages = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["managerConversation/getMessages"]),
  );
  const sendingMessage = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["managerConversation/sendMessage"]),
  );
  const uploadingAttachment = useAppSelector((state) =>
    Boolean(state.ui.loadingMap["managerConversation/uploadChatAttachment"]),
  );
  const loadingEmployees = useAppSelector((state) => state.managerEmployee.loading);
  const employees = useAppSelector((state) => state.managerEmployee.employees);
  const conversations = useAppSelector((state) => state.managerConversation.conversations);
  const selectedConversationId = useAppSelector(
    (state) => state.managerConversation.selectedConversationId,
  );
  const messagesByConversation = useAppSelector(
    (state) => state.managerConversation.messagesByConversation,
  );

  const messages = useMemo(
    () => (selectedConversationId ? messagesByConversation[selectedConversationId] || [] : []),
    [selectedConversationId, messagesByConversation],
  );

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId],
  );

  const starterUsers = useMemo<UserSearchHit[]>(
    () =>
      employees
        .filter((employee) => employee.isActive)
        .map((employee) => ({
          id: employee.employeeId,
          username: employee.username,
          fullName: employee.fullName || null,
          avatar: employee.avatar || null,
        })),
    [employees],
  );

  const stats = useMemo(() => {
    const unread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    const groups = conversations.filter((c) => c.type === "GROUP").length;
    return { unread, groups, total: conversations.length };
  }, [conversations]);

  const isGroupAdmin = useMemo(() => {
    if (!selectedConversation || selectedConversation.type !== "GROUP" || !authUser?.id) return false;
    return selectedConversation.participants.some(
      (p) => p.userId === authUser.id && p.role === "ADMIN",
    );
  }, [selectedConversation, authUser?.id]);

  const searchBranchMembers = useCallback(
    async (q: string, limit = 15): Promise<UserSearchHit[]> => {
      const res = await dispatch(searchManagerBranchMembers({ q, limit })).unwrap();
      return res.data || [];
    },
    [dispatch],
  );

  useEffect(() => {
    dispatch(getManagerConversations());
    dispatch(getEmployees());
  }, [dispatch]);

  useEffect(() => {
    const cid = Number(conversationId);
    if (cid && !Number.isNaN(cid)) {
      dispatch(selectManagerConversation(cid));
      dispatch(getManagerMessages({ conversationId: cid, params: { page: 1, limit: 100 } }));
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
      dispatch(appendManagerSocketMessage({ message: payload, currentUserId: uid }));
    });

    s.on("chat:message-recalled", (p: { id: number; conversationId: number }) => {
      dispatch(markManagerMessageRecalled({ id: p.id, conversationId: p.conversationId }));
    });

    s.on("chat:messages-read", (p: { conversationId: number; readerId: number }) => {
      dispatch(clearManagerUnreadFromSocket({ ...p, selfId: uid }));
    });

    s.on("chat:conversation-updated", (p: { conversationId: number; action?: string }) => {
      if (p.action === "deleted") {
        dispatch(removeManagerConversationLocal(p.conversationId));
        const sel = store.getState().managerConversation.selectedConversationId;
        if (sel === p.conversationId) navigate("/manager/messages", { replace: true });
      } else {
        dispatch(getManagerConversations());
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
    dispatch(selectManagerConversation(id));
    dispatch(getManagerMessages({ conversationId: id, params: { page: 1, limit: 100 } }));
    socket?.emit("chat:join", id);
    navigate(`/manager/messages/${id}`);
  };

  const startDirectConversation = async (userId: number) => {
    const res = await dispatch(createOrGetManagerDirectConversation({ userId })).unwrap();
    openConversation(res.data.id);
  };

  const handleForward = async (toConversationId: number, message: ChatMessage) => {
    await dispatch(
      sendManagerMessage({
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
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <section className="bg-sky-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-semibold text-sky-100 mb-3">
                <MessageCircle size={16} className="text-sky-300" />
                Chat chi nhánh
              </div>
              <h1 className="text-3xl font-extrabold text-white leading-tight">
                Trò chuyện nội bộ chi nhánh
              </h1>
              <p className="mt-2 max-w-2xl text-sky-100 leading-relaxed">
                Chỉ quản lý và nhân viên thuộc chi nhánh của bạn mới được thêm vào hội thoại.
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
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 pb-8 relative z-10">
        <CreateGroupModal
          open={createGroupOpen}
          currentUserId={authUser?.id}
          searchUsers={searchBranchMembers}
          onClose={() => setCreateGroupOpen(false)}
          onSubmit={async (name, userIds) => {
            const res = await dispatch(createManagerGroupConversation({ name, userIds })).unwrap();
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
              starterUsers={starterUsers}
              loadingStarterUsers={loadingEmployees}
              onSelect={openConversation}
              onStartDirect={startDirectConversation}
              onCreateGroup={() => setCreateGroupOpen(true)}
            />
          )}

          <ChatPanel
            conversation={selectedConversation}
            conversations={conversations}
            messages={messages}
            currentUserId={authUser?.id}
            isGroupAdmin={isGroupAdmin}
            searchUsers={searchBranchMembers}
            onSend={async (text, replyToId) => {
              if (!selectedConversationId || sendingMessage || uploadingAttachment) return;
              await dispatch(
                sendManagerMessage({
                  conversationId: selectedConversationId,
                  data: { body: text, replyToId },
                }),
              );
            }}
            onUploadFile={async (file, caption) => {
              if (!selectedConversationId || sendingMessage || uploadingAttachment) return;
              await dispatch(
                uploadManagerChatAttachment({ conversationId: selectedConversationId, file, caption }),
              );
            }}
            onRecall={async (messageId) => {
              if (!selectedConversationId) return;
              const confirmed = await showConfirmDialog(
                "Thu hồi tin nhắn?",
                "Tin nhắn sẽ được đánh dấu là đã thu hồi trong hội thoại.",
                "Thu hồi",
                "Hủy",
                "warning",
              );
              if (!confirmed) return;
              await dispatch(recallManagerMessage({ conversationId: selectedConversationId, messageId }));
            }}
            onForward={handleForward}
            onLeaveGroup={
              selectedConversation?.type === "GROUP"
                ? async () => {
                    if (!selectedConversationId) return;
                    const confirmed = await showConfirmDialog(
                      "Rời nhóm này?",
                      "Bạn sẽ không còn nhận tin nhắn mới từ nhóm này.",
                      "Rời nhóm",
                      "Hủy",
                      "warning",
                    );
                    if (!confirmed) return;
                    await dispatch(leaveManagerGroup({ conversationId: selectedConversationId }));
                    navigate("/manager/messages", { replace: true });
                  }
                : undefined
            }
            onDeleteGroup={
              selectedConversation?.type === "GROUP" && isGroupAdmin
                ? async () => {
                    if (!selectedConversationId) return;
                    const confirmed = await showConfirmDialog(
                      "Xóa nhóm cho mọi thành viên?",
                      "Hội thoại nhóm sẽ bị xóa khỏi danh sách của tất cả thành viên.",
                      "Xóa nhóm",
                      "Hủy",
                      "danger",
                    );
                    if (!confirmed) return;
                    await dispatch(deleteManagerGroupConversation({ conversationId: selectedConversationId }));
                    navigate("/manager/messages", { replace: true });
                  }
                : undefined
            }
            onAddMembers={
              selectedConversation?.type === "GROUP" && isGroupAdmin
                ? async (userIds) => {
                    if (!selectedConversationId) return;
                    await dispatch(addMembersToManagerGroup({ conversationId: selectedConversationId, userIds }));
                  }
                : undefined
            }
            onRemoveMember={
              selectedConversation?.type === "GROUP" && isGroupAdmin
                ? async (userId) => {
                  if (!selectedConversationId) return;
                    const confirmed = await showConfirmDialog(
                      "Xóa thành viên khỏi nhóm?",
                      "Thành viên này sẽ không còn thấy tin nhắn mới của nhóm.",
                      "Xóa thành viên",
                      "Hủy",
                      "danger",
                    );
                    if (!confirmed) return;
                    await dispatch(removeMemberFromManagerGroup({ conversationId: selectedConversationId, userId }));
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

export default ConversationPage;
