import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import {
  BranchManager,
  Booking,
  Conversation,
  ConversationParticipant,
  Message,
  Order,
  OrderGroup,
  Profile,
  Role,
  User,
} from "../../models/index.js";
import { CONVERSATION_TYPE, ROLE_CONVERSATION } from "../../constants/messageConstant.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ForbiddenError from "../../errors/ForbiddenError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { getIO } from "../../socket/index.js";
import userMessageService from "../user/messageService.js";
import {
  countOnlineParticipants,
  getPresenceForUser,
  mapParticipantPresence,
} from "../shared/presenceMapper.js";

const getManagedBranchIds = async (managerId, transaction) => {
  const rows = await BranchManager.findAll({
    where: { managerId, isActive: true },
    attributes: ["branchId"],
    transaction,
  });
  return [...new Set(rows.map((row) => Number(row.branchId)))];
};

const getBranchCustomerIds = async (branchIds, transaction) => {
  if (branchIds.length < 1) return [];

  const [bookings, orders] = await Promise.all([
    Booking.findAll({
      where: { branchId: branchIds },
      attributes: ["userId"],
      transaction,
    }),
    Order.findAll({
      where: { branchId: branchIds },
      attributes: ["id"],
      include: [
        {
          model: OrderGroup,
          as: "orderGroup",
          attributes: ["userId"],
          required: true,
        },
      ],
      transaction,
    }),
  ]);

  return [
    ...new Set([
      ...bookings.map((row) => Number(row.userId)),
      ...orders
        .map((row) => Number(row.orderGroup?.userId))
        .filter((userId) => Number.isInteger(userId) && userId > 0),
    ]),
  ];
};

const getAllowedCustomerIds = async (managerId, transaction) => {
  const branchIds = await getManagedBranchIds(managerId, transaction);
  if (branchIds.length < 1) return new Set([Number(managerId)]);

  const customerIds = await getBranchCustomerIds(branchIds, transaction);

  return new Set([
    Number(managerId),
    ...customerIds,
  ]);
};

const getGeneralChatUserIds = async (managerId, transaction) => {
  const rows = await User.findAll({
    where: {
      id: { [Op.ne]: Number(managerId) },
      isActive: true,
    },
    attributes: ["id"],
    include: [
      {
        model: Role,
        as: "role",
        attributes: [],
        where: {
          roleName: { [Op.in]: [ROLE_NAME.USER, ROLE_NAME.COACH] },
        },
        required: true,
      },
    ],
    transaction,
  });

  return rows.map((row) => Number(row.id));
};

const getManagerChatAllowedIds = async (managerId, transaction) => {
  const allowed = await getAllowedCustomerIds(managerId, transaction);
  const customerIds = [...allowed].filter((id) => Number(id) !== Number(managerId));

  if (customerIds.length > 0) return allowed;

  return new Set([
    Number(managerId),
    ...(await getGeneralChatUserIds(managerId, transaction)),
  ]);
};

const ensureManagedBranchAccess = async (managerId, transaction) => {
  const branchIds = await getManagedBranchIds(managerId, transaction);
  if (branchIds.length < 1) {
    throw new ForbiddenError("Quan ly chua duoc gan chi nhanh.");
  }
  return branchIds;
};

const ensureUsersInManagedBranches = async (managerId, userIds, transaction) => {
  await ensureManagedBranchAccess(managerId, transaction);
  const allowed = await getManagerChatAllowedIds(managerId, transaction);
  const invalid = userIds.map(Number).filter((id) => !allowed.has(id));
  if (invalid.length > 0) {
    throw new ForbiddenError("Chi duoc tro chuyen voi khach hang hop le.");
  }
  return allowed;
};

const ensureConversationAllowed = async (managerId, conversationId, transaction) => {
  const membership = await ConversationParticipant.findOne({
    where: { conversationId, userId: managerId },
    transaction,
  });
  if (!membership) throw new ForbiddenError("Ban khong thuoc cuoc tro chuyen nay.");

  const allowed = await getManagerChatAllowedIds(managerId, transaction);
  const participants = await ConversationParticipant.findAll({
    where: { conversationId },
    attributes: ["userId"],
    transaction,
  });
  const invalid = participants.some((p) => !allowed.has(Number(p.userId)));
  if (invalid) {
    throw new ForbiddenError("Cuoc tro chuyen nay khong thuoc pham vi chi nhanh cua ban.");
  }
  return membership;
};

const broadcastToConversation = (userIds, conversationId, event, payload) => {
  const io = getIO();
  userIds.forEach((uid) => io.to(`user:${uid}`).emit(event, payload));
  io.to(`conversation:${conversationId}`).emit(event, payload);
};

const leaveConversationRoomForUsers = (userIds, conversationId) => {
  const io = getIO();
  userIds.forEach((uid) => {
    io.in(`user:${uid}`).socketsLeave(`conversation:${conversationId}`);
  });
};

const mapConversation = async (conversation, currentUserId, transaction) => {
  const participants = await ConversationParticipant.findAll({
    where: { conversationId: conversation.id },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "username", "isOnline", "lastSeenAt"],
        include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar"] }],
      },
    ],
    transaction,
  });

  const lastMessage = await Message.findOne({
    where: { conversationId: conversation.id },
    order: [["createdAt", "DESC"]],
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
  const mappedParticipants = participants.map(mapParticipantPresence);
  const otherPresence = otherParticipant ? getPresenceForUser(otherParticipant.user) : null;

  return {
    id: conversation.id,
    type: conversation.type,
    conversationName: isPrivate
      ? otherParticipant?.user?.profile?.fullName || otherParticipant?.user?.username || conversation.conversationName
      : conversation.conversationName,
    avatar: isPrivate ? otherParticipant?.user?.profile?.avatar || null : conversation.avatar,
    updatedAt: conversation.updatedAt,
    participants: mappedParticipants,
    otherParticipant:
      isPrivate && otherParticipant
        ? {
            id: otherParticipant.userId,
            username: otherParticipant.user?.username,
            fullName: otherParticipant.user?.profile?.fullName || null,
            avatar: otherParticipant.user?.profile?.avatar || null,
            isOnline: otherPresence?.isOnline || false,
            lastSeenAt: otherPresence?.lastSeenAt || null,
          }
        : null,
    membersCount: participants.length,
    onlineMembersCount: countOnlineParticipants(participants),
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
          createdAt: lastMessage.createdAt,
          mediaUrl: lastMessage.isRecalled ? null : lastMessage.mediaUrl || null,
          isRecalled: Boolean(lastMessage.isRecalled),
        }
      : null,
  };
};

const searchBranchMembersService = async ({ managerId, query }) => {
  const q = String(query.q || "").trim();
  const limit = Math.min(Number(query.limit || 15), 30);

  return sequelize.transaction(async (t) => {
    await ensureManagedBranchAccess(managerId, t);
    const allowed = await getManagerChatAllowedIds(managerId, t);
    allowed.delete(Number(managerId));
    const ids = [...allowed];
    if (ids.length < 1) return [];

    const where = {
      id: ids,
      isActive: true,
    };

    if (q) {
      where[Op.or] = [
        { username: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { "$profile.fullName$": { [Op.like]: `%${q}%` } },
        { "$profile.phoneNumber$": { [Op.like]: `%${q}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      attributes: ["id", "username", "email"],
      include: [{ model: Profile, as: "profile", attributes: ["fullName", "avatar", "phoneNumber"] }],
      limit,
      order: [["updatedAt", "DESC"]],
      subQuery: false,
      transaction: t,
    });

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      fullName: user.profile?.fullName || null,
      avatar: user.profile?.avatar || null,
      email: user.email || null,
      phoneNumber: user.profile?.phoneNumber || null,
    }));
  });
};

const getConversationsService = async ({ managerId }) => {
  return sequelize.transaction(async (t) => {
    await ensureManagedBranchAccess(managerId, t);
    const allowed = await getManagerChatAllowedIds(managerId, t);
    const rows = await ConversationParticipant.findAll({
      where: { userId: managerId },
      include: [{ model: Conversation, as: "conversation" }],
      order: [[{ model: Conversation, as: "conversation" }, "updatedAt", "DESC"]],
      transaction: t,
    });

    const conversations = [];
    for (const row of rows) {
      const participants = await ConversationParticipant.findAll({
        where: { conversationId: row.conversationId },
        attributes: ["userId"],
        transaction: t,
      });
      const inScope = participants.every((p) => allowed.has(Number(p.userId)));
      if (inScope) {
        conversations.push(await mapConversation(row.conversation, managerId, t));
      }
    }
    return conversations;
  });
};

const createOrGetDirectConversationService = async ({ managerId, targetUserId }) => {
  const targetId = Number(targetUserId);
  if (targetId === Number(managerId)) throw new ForbiddenError("Khong the tu nhan tin cho chinh ban.");

  return sequelize.transaction(async (t) => {
    await ensureUsersInManagedBranches(managerId, [targetId], t);
    const targetUser = await User.findOne({
      where: { id: targetId, isActive: true },
      transaction: t,
    });
    if (!targetUser) throw new NotFoundError("Khong tim thay nguoi dung.");

    const memberships = await ConversationParticipant.findAll({
      where: { userId: [managerId, targetId] },
      attributes: ["conversationId", "userId"],
      include: [{ model: Conversation, as: "conversation", attributes: ["id", "type"] }],
      transaction: t,
    });
    const groups = memberships.reduce((acc, m) => {
      if (m.conversation?.type !== CONVERSATION_TYPE.PRIVATE) return acc;
      if (!acc[m.conversationId]) acc[m.conversationId] = [];
      acc[m.conversationId].push(Number(m.userId));
      return acc;
    }, {});
    const matchedId = Object.entries(groups).find(
      ([, users]) => users.includes(Number(managerId)) && users.includes(targetId),
    )?.[0];
    if (matchedId) {
      const existed = await Conversation.findByPk(Number(matchedId), { transaction: t });
      return mapConversation(existed, managerId, t);
    }

    const conversation = await Conversation.create(
      { conversationName: targetUser.username, type: CONVERSATION_TYPE.PRIVATE },
      { transaction: t },
    );
    await ConversationParticipant.bulkCreate(
      [
        { conversationId: conversation.id, userId: managerId, role: ROLE_CONVERSATION.ADMIN },
        { conversationId: conversation.id, userId: targetId, role: ROLE_CONVERSATION.MEMBER },
      ],
      { transaction: t },
    );
    broadcastToConversation([managerId, targetId], conversation.id, "chat:conversation-updated", {
      conversationId: conversation.id,
      action: "created",
    });
    return mapConversation(conversation, managerId, t);
  });
};

const createGroupConversationService = async ({ managerId, name, userIds }) => {
  const uniqueIds = [...new Set((userIds || []).map(Number))].filter((id) => id !== Number(managerId));
  if (!name?.trim()) throw new BadRequestError("Ten nhom khong duoc de trong.");
  if (uniqueIds.length < 1) throw new BadRequestError("Nhom can it nhat mot thanh vien khac.");

  return sequelize.transaction(async (t) => {
    await ensureUsersInManagedBranches(managerId, uniqueIds, t);
    const users = await User.findAll({ where: { id: uniqueIds, isActive: true }, transaction: t });
    if (users.length !== uniqueIds.length) throw new BadRequestError("Thanh vien khong hop le.");

    const conversation = await Conversation.create(
      { conversationName: name.trim(), type: CONVERSATION_TYPE.GROUP },
      { transaction: t },
    );
    await ConversationParticipant.bulkCreate(
      [
        { conversationId: conversation.id, userId: managerId, role: ROLE_CONVERSATION.ADMIN },
        ...uniqueIds.map((userId) => ({
          conversationId: conversation.id,
          userId,
          role: ROLE_CONVERSATION.MEMBER,
        })),
      ],
      { transaction: t },
    );
    broadcastToConversation([managerId, ...uniqueIds], conversation.id, "chat:conversation-updated", {
      conversationId: conversation.id,
      action: "created",
    });
    return mapConversation(conversation, managerId, t);
  });
};

const ensureGroupAdmin = (membership, conversation) => {
  if (conversation.type !== CONVERSATION_TYPE.GROUP) throw new BadRequestError("Thao tac chi ap dung cho nhom.");
  if (membership.role !== ROLE_CONVERSATION.ADMIN) throw new ForbiddenError("Chi admin nhom moi thuc hien duoc.");
};

const addMembersToGroupService = async ({ managerId, conversationId, userIds }) => {
  const addIds = [...new Set((userIds || []).map(Number))].filter(Boolean);
  if (addIds.length < 1) throw new BadRequestError("Danh sach thanh vien khong hop le.");

  return sequelize.transaction(async (t) => {
    await ensureUsersInManagedBranches(managerId, addIds, t);
    const membership = await ensureConversationAllowed(managerId, conversationId, t);
    const conversation = await Conversation.findByPk(conversationId, { transaction: t });
    if (!conversation) throw new NotFoundError("Khong tim thay cuoc tro chuyen.");
    ensureGroupAdmin(membership, conversation);

    const existing = await ConversationParticipant.findAll({
      where: { conversationId, userId: addIds },
      attributes: ["userId"],
      transaction: t,
    });
    const existingSet = new Set(existing.map((e) => Number(e.userId)));
    const toAdd = addIds.filter((id) => !existingSet.has(id));
    if (toAdd.length < 1) throw new BadRequestError("Cac thanh vien da co trong nhom.");

    await ConversationParticipant.bulkCreate(
      toAdd.map((userId) => ({ conversationId, userId, role: ROLE_CONVERSATION.MEMBER })),
      { transaction: t },
    );
    await conversation.update({ updatedAt: new Date() }, { transaction: t });

    const participants = await ConversationParticipant.findAll({
      where: { conversationId },
      attributes: ["userId"],
      transaction: t,
    });
    broadcastToConversation(
      participants.map((p) => p.userId),
      conversationId,
      "chat:conversation-updated",
      { conversationId, action: "members_changed" },
    );
    return mapConversation(conversation, managerId, t);
  });
};

const removeMemberFromGroupService = async ({ managerId, conversationId, targetUserId }) => {
  return sequelize.transaction(async (t) => {
    const membership = await ensureConversationAllowed(managerId, conversationId, t);
    const conversation = await Conversation.findByPk(conversationId, { transaction: t });
    if (!conversation) throw new NotFoundError("Khong tim thay cuoc tro chuyen.");
    const isSelf = Number(targetUserId) === Number(managerId);
    if (!isSelf || membership.role !== ROLE_CONVERSATION.ADMIN) {
      ensureGroupAdmin(membership, conversation);
    }

    const target = await ConversationParticipant.findOne({
      where: { conversationId, userId: targetUserId },
      transaction: t,
    });
    if (!target) throw new NotFoundError("Thanh vien khong thuoc nhom.");

    if (isSelf && membership.role === ROLE_CONVERSATION.ADMIN) {
      const participants = await ConversationParticipant.findAll({
        where: { conversationId },
        attributes: ["userId"],
        transaction: t,
      });
      const ids = participants.map((p) => p.userId);

      await Message.destroy({ where: { conversationId }, transaction: t });
      await ConversationParticipant.destroy({ where: { conversationId }, transaction: t });
      await conversation.destroy({ transaction: t });
      leaveConversationRoomForUsers(ids, conversationId);

      broadcastToConversation(ids, conversationId, "chat:conversation-updated", {
        conversationId,
        action: "deleted",
      });

      return { conversationId, deleted: true };
    }

    await target.destroy({ transaction: t });
    leaveConversationRoomForUsers([targetUserId], conversationId);
    await conversation.update({ updatedAt: new Date() }, { transaction: t });

    const participants = await ConversationParticipant.findAll({
      where: { conversationId },
      attributes: ["userId"],
      transaction: t,
    });
    broadcastToConversation(
      [...participants.map((p) => p.userId), Number(targetUserId)],
      conversationId,
      "chat:conversation-updated",
      { conversationId, action: "members_changed" },
    );
    return mapConversation(conversation, managerId, t);
  });
};

const leaveGroupService = async ({ managerId, conversationId }) => {
  return removeMemberFromGroupService({ managerId, conversationId, targetUserId: managerId });
};

const deleteGroupConversationService = async ({ managerId, conversationId }) => {
  return sequelize.transaction(async (t) => {
    const membership = await ensureConversationAllowed(managerId, conversationId, t);
    const conversation = await Conversation.findByPk(conversationId, { transaction: t });
    if (!conversation) throw new NotFoundError("Khong tim thay cuoc tro chuyen.");
    ensureGroupAdmin(membership, conversation);

    const participants = await ConversationParticipant.findAll({
      where: { conversationId },
      attributes: ["userId"],
      transaction: t,
    });
    const ids = participants.map((p) => p.userId);
    await Message.destroy({ where: { conversationId }, transaction: t });
    await ConversationParticipant.destroy({ where: { conversationId }, transaction: t });
    await conversation.destroy({ transaction: t });
    leaveConversationRoomForUsers(ids, conversationId);

    broadcastToConversation(ids, conversationId, "chat:conversation-updated", {
      conversationId,
      action: "deleted",
    });
    return { conversationId };
  });
};

const getMessagesService = async (data) => {
  await sequelize.transaction((t) => ensureConversationAllowed(data.managerId, data.conversationId, t));
  return userMessageService.getMessagesService({
    userId: data.managerId,
    conversationId: data.conversationId,
    query: data.query,
  });
};

const sendMessageService = async (data) => {
  await sequelize.transaction((t) => ensureConversationAllowed(data.managerId, data.conversationId, t));
  return userMessageService.sendMessageService({
    ...data,
    userId: data.managerId,
  });
};

const uploadAndSendMessageService = async (data) => {
  await sequelize.transaction((t) => ensureConversationAllowed(data.managerId, data.conversationId, t));
  return userMessageService.uploadAndSendMessageService({
    ...data,
    userId: data.managerId,
  });
};

const recallMessageService = async (data) => {
  await sequelize.transaction((t) => ensureConversationAllowed(data.managerId, data.conversationId, t));
  return userMessageService.recallMessageService({
    userId: data.managerId,
    conversationId: data.conversationId,
    messageId: data.messageId,
  });
};

const conversationService = {
  searchBranchMembersService,
  getConversationsService,
  createOrGetDirectConversationService,
  createGroupConversationService,
  addMembersToGroupService,
  removeMemberFromGroupService,
  leaveGroupService,
  deleteGroupConversationService,
  getMessagesService,
  sendMessageService,
  uploadAndSendMessageService,
  recallMessageService,
};

export default conversationService;
