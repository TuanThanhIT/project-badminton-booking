import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import {
  Conversation,
  ConversationParticipant,
  Message,
  Profile,
  User,
} from "../../models/index.js";
import { CONVERSATION_TYPE, ROLE_CONVERSATION } from "../../constants/messageConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ForbiddenError from "../../errors/ForbiddenError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { getIO } from "../../socket/index.js";

const ensureMembership = async (conversationId, userId, transaction) => {
  const membership = await ConversationParticipant.findOne({
    where: { conversationId, userId },
    transaction,
  });
  if (!membership) throw new ForbiddenError("Bạn không thuộc cuộc trò chuyện này.");
  return membership;
};

const broadcastToConversation = (userIds, conversationId, event, payload) => {
  const io = getIO();
  userIds.forEach((uid) => io.to(`user:${uid}`).emit(event, payload));
  io.to(`conversation:${conversationId}`).emit(event, payload);
};

const mapConversation = async (conversation, currentUserId, transaction) => {
  const participants = await ConversationParticipant.findAll({
    where: { conversationId: conversation.id },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "username"],
        include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar"] }],
      },
    ],
    transaction,
  });

  const lastMessage = await Message.findOne({
    where: { conversationId: conversation.id },
    order: [["createdDate", "DESC"]],
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["id", "username"],
        include: [{ model: Profile, as: "profile", attributes: ["avatar"] }],
      },
    ],
    transaction,
  });

  const unreadCount = await Message.count({
    where: {
      conversationId: conversation.id,
      senderId: { [Op.ne]: currentUserId },
      isRead: false,
      isRecalled: false,
    },
    transaction,
  });

  const otherParticipant = participants.find((p) => Number(p.userId) !== Number(currentUserId));
  const isPrivate = conversation.type === CONVERSATION_TYPE.PRIVATE;
  const displayName = isPrivate
    ? otherParticipant?.user?.username || conversation.conversationName
    : conversation.conversationName;
  const displayAvatar = isPrivate
    ? otherParticipant?.user?.profile?.avatar || null
    : conversation.avatar;

  return {
    id: conversation.id,
    type: conversation.type,
    conversationName: displayName,
    avatar: displayAvatar,
    updatedDate: conversation.updatedDate,
    participants: participants.map((p) => ({
      userId: p.userId,
      username: p.user?.username,
      fullName: p.user?.profile?.fullName || null,
      avatar: p.user?.profile?.avatar || null,
      role: p.role,
      joinedAt: p.joinedAt,
    })),
    unreadCount,
    lastMessage: lastMessage
      ? {
          id: lastMessage.id,
          conversationId: lastMessage.conversationId,
          senderId: lastMessage.senderId,
          senderName: lastMessage.sender?.username || null,
          senderAvatar: lastMessage.sender?.profile?.avatar || null,
          body: lastMessage.isRecalled ? "" : lastMessage.body || "",
          type: lastMessage.type,
          isRead: lastMessage.isRead,
          createdDate: lastMessage.createdDate,
          mediaUrl: lastMessage.isRecalled ? null : lastMessage.mediaUrl || null,
          isRecalled: Boolean(lastMessage.isRecalled),
        }
      : null,
  };
};

const getConversationsService = async (data) => {
  const { User: currentUser } = data;
  return sequelize.transaction(async (t) => {
    const rows = await ConversationParticipant.findAll({
      where: { userId: currentUser.id },
      include: [{ model: Conversation, as: "conversation" }],
      order: [[{ model: Conversation, as: "conversation" }, "updatedDate", "DESC"]],
      transaction: t,
    });

    const conversations = await Promise.all(
      rows.map((row) => mapConversation(row.conversation, currentUser.id, t)),
    );
    return conversations;
  });
};

const createOrGetDirectConversationService = async (data) => {
  const { currentUser, targetUserId } = data;
  if (Number(targetUserId) === Number(currentUser.id)) {
    throw new ForbiddenError("Không thể tự nhắn tin cho chính bạn.");
  }

  return sequelize.transaction(async (t) => {
    const targetUser = await User.findOne({
      where: { id: targetUserId, isActive: true },
      transaction: t,
    });
    if (!targetUser) throw new NotFoundError("Không tìm thấy người dùng.");

    const memberships = await ConversationParticipant.findAll({
      where: { userId: [currentUser.id, targetUserId] },
      attributes: ["conversationId", "userId"],
      include: [{ model: Conversation, as: "conversation", attributes: ["id", "type"] }],
      transaction: t,
    });

    const groups = memberships.reduce((acc, m) => {
      if (m.conversation?.type !== CONVERSATION_TYPE.PRIVATE) return acc;
      if (!acc[m.conversationId]) acc[m.conversationId] = [];
      acc[m.conversationId].push(m.userId);
      return acc;
    }, {});

    const matchedId = Object.entries(groups).find(
      ([, users]) => users.includes(currentUser.id) && users.includes(targetUserId),
    )?.[0];

    if (matchedId) {
      const existed = await Conversation.findByPk(Number(matchedId), { transaction: t });
      if (existed?.type === CONVERSATION_TYPE.PRIVATE) {
        return mapConversation(existed, currentUser.id, t);
      }
    }

    const conversation = await Conversation.create(
      {
        conversationName: targetUser.username,
        type: CONVERSATION_TYPE.PRIVATE,
      },
      { transaction: t },
    );

    await ConversationParticipant.bulkCreate(
      [
        {
          conversationId: conversation.id,
          userId: currentUser.id,
          role: ROLE_CONVERSATION.ADMIN,
        },
        {
          conversationId: conversation.id,
          userId: targetUserId,
          role: ROLE_CONVERSATION.MEMBER,
        },
      ],
      { transaction: t },
    );

    return mapConversation(conversation, currentUser.id, t);
  });
};

const createGroupConversationService = async (data) => {
  const { currentUser, name, userIds } = data;
  const uniqueIds = [...new Set((userIds || []).map(Number))].filter((id) => id !== currentUser.id);
  if (!name?.trim()) throw new BadRequestError("Tên nhóm không được để trống.");
  if (uniqueIds.length < 1) {
    throw new BadRequestError("Nhóm cần ít nhất một thành viên khác ngoài bạn.");
  }

  return sequelize.transaction(async (t) => {
    const users = await User.findAll({
      where: { id: uniqueIds, isActive: true },
      transaction: t,
    });
    if (users.length !== uniqueIds.length) {
      throw new BadRequestError("Một hoặc nhiều người dùng không tồn tại.");
    }

    const conversation = await Conversation.create(
      {
        conversationName: name.trim(),
        type: CONVERSATION_TYPE.GROUP,
      },
      { transaction: t },
    );

    const rows = [
      {
        conversationId: conversation.id,
        userId: currentUser.id,
        role: ROLE_CONVERSATION.ADMIN,
      },
      ...uniqueIds.map((userId) => ({
        conversationId: conversation.id,
        userId,
        role: ROLE_CONVERSATION.MEMBER,
      })),
    ];
    await ConversationParticipant.bulkCreate(rows, { transaction: t });

    const mapped = await mapConversation(conversation, currentUser.id, t);
    const allUserIds = [currentUser.id, ...uniqueIds];
    broadcastToConversation(allUserIds, conversation.id, "chat:conversation-updated", {
      conversationId: conversation.id,
      action: "created",
    });
    return mapped;
  });
};

const updateDirectNicknameService = async (data) => {
  const { currentUser, conversationId, nickname } = data;
  const value = String(nickname || "").trim();
  if (!value) throw new BadRequestError("Biệt danh không được để trống.");

  return sequelize.transaction(async (t) => {
    await ensureMembership(conversationId, currentUser.id, t);
    const conversation = await Conversation.findByPk(conversationId, { transaction: t });
    if (!conversation) throw new NotFoundError("Không tìm thấy cuộc trò chuyện.");
    if (conversation.type !== CONVERSATION_TYPE.PRIVATE) {
      throw new BadRequestError("Chỉ đổi biệt danh cho chat 1-1.");
    }

    await conversation.update({ conversationName: value }, { transaction: t });
    return mapConversation(conversation, currentUser.id, t);
  });
};

const ensureGroupAdmin = (membership, conversation) => {
  if (conversation.type !== CONVERSATION_TYPE.GROUP) {
    throw new BadRequestError("Thao tác chỉ áp dụng cho nhóm.");
  }
  if (membership.role !== ROLE_CONVERSATION.ADMIN) {
    throw new ForbiddenError("Chỉ quản trị viên nhóm mới thực hiện được.");
  }
};
  
const addMembersToGroupService = async (data) => {
  const { currentUser, conversationId, userIds } = data;
  const addIds = [...new Set((userIds || []).map(Number))].filter(Boolean);
  if (addIds.length < 1) throw new BadRequestError("Danh sách thành viên không hợp lệ.");

  return sequelize.transaction(async (t) => {
    const membership = await ensureMembership(conversationId, currentUser.id, t);
    const conversation = await Conversation.findByPk(conversationId, { transaction: t });
    if (!conversation) throw new NotFoundError("Không tìm thấy cuộc trò chuyện.");
    ensureGroupAdmin(membership, conversation);

    const existing = await ConversationParticipant.findAll({
      where: { conversationId, userId: addIds },
      attributes: ["userId"],
      transaction: t,
    });
    const existingSet = new Set(existing.map((e) => e.userId));
    const toAdd = addIds.filter((id) => !existingSet.has(id));
    if (toAdd.length < 1) throw new BadRequestError("Các thành viên đã có trong nhóm.");

    const users = await User.findAll({
      where: { id: toAdd, isActive: true },
      transaction: t,
    });
    if (users.length !== toAdd.length) {
      throw new BadRequestError("Một hoặc nhiều người dùng không tồn tại.");
    }

    await ConversationParticipant.bulkCreate(
      toAdd.map((userId) => ({
        conversationId,
        userId,
        role: ROLE_CONVERSATION.MEMBER,
      })),
      { transaction: t },
    );

    await conversation.update({ updatedDate: new Date() }, { transaction: t });

    const participants = await ConversationParticipant.findAll({
      where: { conversationId },
      attributes: ["userId"],
      transaction: t,
    });
    const allIds = participants.map((p) => p.userId);
    broadcastToConversation(allIds, conversationId, "chat:conversation-updated", {
      conversationId,
      action: "members_changed",
    });

    return mapConversation(conversation, currentUser.id, t);
  });
};

const removeMemberFromGroupService = async (data) => {
  const { currentUser, conversationId, targetUserId } = data;
  return sequelize.transaction(async (t) => {
    const membership = await ensureMembership(conversationId, currentUser.id, t);
    const conversation = await Conversation.findByPk(conversationId, { transaction: t });
    if (!conversation) throw new NotFoundError("Không tìm thấy cuộc trò chuyện.");
    if (conversation.type !== CONVERSATION_TYPE.GROUP) {
      throw new BadRequestError("Thao tác chỉ áp dụng cho nhóm.");
    }

    const isSelf = Number(targetUserId) === Number(currentUser.id);
    if (!isSelf) ensureGroupAdmin(membership, conversation);
    else if (membership.role === ROLE_CONVERSATION.ADMIN) {
      const adminCount = await ConversationParticipant.count({
        where: { conversationId, role: ROLE_CONVERSATION.ADMIN },
        transaction: t,
      });
      if (adminCount <= 1 && isSelf) {
        throw new ForbiddenError("Hãy chỉ định admin khác trước khi rời nhóm.");
      }
    }

    const target = await ConversationParticipant.findOne({
      where: { conversationId, userId: targetUserId },
      transaction: t,
    });
    if (!target) throw new NotFoundError("Thành viên không thuộc nhóm.");

    await target.destroy({ transaction: t });

    const remaining = await ConversationParticipant.count({
      where: { conversationId },
      transaction: t,
    });

    if (remaining === 0) {
      await Message.destroy({ where: { conversationId }, transaction: t });
      await conversation.destroy({ transaction: t });
      broadcastToConversation([currentUser.id, targetUserId], conversationId, "chat:conversation-updated", {
        conversationId,
        action: "deleted",
      });
      return { deleted: true, conversationId };
    }

    await conversation.update({ updatedDate: new Date() }, { transaction: t });

    const participants = await ConversationParticipant.findAll({
      where: { conversationId },
      attributes: ["userId"],
      transaction: t,
    });
    const allIds = [...participants.map((p) => p.userId), targetUserId];
    broadcastToConversation(allIds, conversationId, "chat:conversation-updated", {
      conversationId,
      action: "members_changed",
    });

    if (isSelf) {
      return { left: true, conversationId };
    }

    return mapConversation(conversation, currentUser.id, t);
  });
};

const leaveGroupService = async (data) => {
  const { currentUser, conversationId } = data;
  return removeMemberFromGroupService({ currentUser, conversationId, targetUserId: currentUser.id });
};

const deleteGroupConversationService = async (data) => {
  const { currentUser, conversationId } = data;
  return sequelize.transaction(async (t) => {
    const membership = await ensureMembership(conversationId, currentUser.id, t);
    const conversation = await Conversation.findByPk(conversationId, { transaction: t });
    if (!conversation) throw new NotFoundError("Không tìm thấy cuộc trò chuyện.");
    ensureGroupAdmin(membership, conversation);

    const participants = await ConversationParticipant.findAll({
      where: { conversationId },
      attributes: ["userId"],
      transaction: t,
    });
    const userIds = participants.map((p) => p.userId);

    await Message.destroy({ where: { conversationId }, transaction: t });
    await ConversationParticipant.destroy({ where: { conversationId }, transaction: t });
    await conversation.destroy({ transaction: t });

    broadcastToConversation(userIds, conversationId, "chat:conversation-updated", {
      conversationId,
      action: "deleted",
    });

    return { conversationId };
  });
};

const conversationService = {
  getConversationsService,
  createOrGetDirectConversationService,
  updateDirectNicknameService,
  createGroupConversationService,
  addMembersToGroupService,
  removeMemberFromGroupService,
  leaveGroupService,
  deleteGroupConversationService,
};

export default conversationService;
