import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import {
  Conversation,
  ConversationParticipant,
  Message,
  Profile,
  User,
} from "../../models/index.js";
import { MESSAGE_TYPE } from "../../constants/messageConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ForbiddenError from "../../errors/ForbiddenError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { getIO } from "../../socket/index.js";
import { uploadChatBuffer } from "../../utils/cloudinary.js";

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

const rowToMessageDto = (m, senderName, senderAvatar) => {
  const recalled = Boolean(m.isRecalled);
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderName: senderName ?? null,
    senderAvatar: senderAvatar ?? null,
    body: recalled ? "" : m.body || "",
    type: m.type,
    isRead: m.isRead,
    createdDate: m.createdDate,
    mediaUrl: recalled ? null : m.mediaUrl || null,
    isRecalled: recalled,
  };
};

const getMessagesService = async (data) => {
  const { User: currentUser, conversationId, query } = data;
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 30);
  const offset = (page - 1) * limit;

  return sequelize.transaction(async (t) => {
    await ensureMembership(conversationId, currentUser.id, t);

    const result = await Message.findAndCountAll({
      where: { conversationId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username"],
          include: [{ model: Profile, as: "profile", attributes: ["avatar"] }],
        },
      ],
      order: [["createdDate", "ASC"]],
      offset,
      limit,
      transaction: t,
    });

    await Message.update(
      { isRead: true },
      {
        where: {
          conversationId,
          senderId: { [Op.ne]: currentUser.id },
          isRead: false,
        },
        transaction: t,
      },
    );

    const participants = await ConversationParticipant.findAll({
      where: { conversationId },
      attributes: ["userId"],
      transaction: t,
    });
    const userIds = participants.map((p) => p.userId);
    broadcastToConversation(userIds, conversationId, "chat:messages-read", {
      conversationId,
      readerId: currentUser.id,
    });

    return {
      total: result.count,
      page,
      limit,
      data: result.rows.map((m) =>
        rowToMessageDto(m, m.sender?.username, m.sender?.profile?.avatar || null),
      ),
    };
  });
};

const buildSendPayload = async (message, currentUser, transaction) => {
  const profile = await Profile.findOne({
    where: { userId: currentUser.id },
    attributes: ["avatar"],
    transaction,
  });
  return rowToMessageDto(message, currentUser.username, profile?.avatar || null);
};

const sendMessageService = async (data) => {
  const { User: currentUser, conversationId, mediaUrl, type } = data;
  // API payload uses "body" (validated by Joi). Keep backward-compat with "text".
  const rawText = data?.text ?? data?.body;
  const text = typeof rawText === "string" ? rawText : "";
  const trimmedText = text.trim();

  if (!trimmedText && !mediaUrl) {
    throw new BadRequestError("Nội dung tin nhắn không được để trống.");
  }

  let msgType = type || MESSAGE_TYPE.TEXT;
  if (mediaUrl && msgType === MESSAGE_TYPE.TEXT) {
    msgType = MESSAGE_TYPE.IMAGE;
  }
  if ((msgType === MESSAGE_TYPE.FILE || msgType === MESSAGE_TYPE.IMAGE) && !mediaUrl) {
    throw new BadRequestError("Tin nhắn đính kèm cần có liên kết file.");
  }

  return sequelize.transaction(async (t) => {
    await ensureMembership(conversationId, currentUser.id, t);

    const conversation = await Conversation.findByPk(conversationId, { transaction: t });
    if (!conversation) throw new NotFoundError("Không tìm thấy cuộc trò chuyện.");

    const message = await Message.create(
      {
        conversationId,
        senderId: currentUser.id,
        body: trimmedText || null,
        type: msgType,
        mediaUrl,
        isRead: false,
        isRecalled: false,
      },
      { transaction: t },
    );

    await conversation.update({ updatedDate: new Date() }, { transaction: t });

    const payload = await buildSendPayload(message, currentUser, t);

    const participants = await ConversationParticipant.findAll({
      where: { conversationId },
      attributes: ["userId"],
      transaction: t,
    });
    const userIds = participants.map((p) => p.userId);
    broadcastToConversation(userIds, conversationId, "chat:new-message", payload);

    return payload;
  });
};

const uploadAndSendMessageService = async (data) => {
  const { User: currentUser, conversationId, file, caption } = data;
  if (!file?.buffer) throw new BadRequestError("Không có file tải lên.");

  const isImage = file.mimetype?.startsWith("image/");
  const type = isImage ? MESSAGE_TYPE.IMAGE : MESSAGE_TYPE.FILE;

  const uploaded = await uploadChatBuffer(file.buffer, file.mimetype);
  const mediaUrl = uploaded?.secure_url || uploaded?.url;
  if (!mediaUrl) throw new BadRequestError("Tải file thất bại.");

  return sendMessageService({
    User: currentUser,
    conversationId,
    text: caption || "",
    type,
    mediaUrl,
  });
};

const recallMessageService = async (data) => {
  const { User: currentUser, conversationId, messageId } = data;
  return sequelize.transaction(async (t) => {
    await ensureMembership(conversationId, currentUser.id, t);

    const message = await Message.findOne({
      where: { id: messageId, conversationId },
      transaction: t,
    });
    if (!message) throw new NotFoundError("Không tìm thấy tin nhắn.");
    if (Number(message.senderId) !== Number(currentUser.id)) {
      throw new ForbiddenError("Chỉ người gửi mới thu hồi được tin nhắn.");
    }
    if (message.isRecalled) throw new BadRequestError("Tin nhắn đã được thu hồi.");

    await message.update({ isRecalled: true, body: "", mediaUrl: null }, { transaction: t });

    const conv = await Conversation.findByPk(conversationId, { transaction: t });
    if (conv) await conv.update({ updatedDate: new Date() }, { transaction: t });

    const participants = await ConversationParticipant.findAll({
      where: { conversationId },
      attributes: ["userId"],
      transaction: t,
    });
    const userIds = participants.map((p) => p.userId);
    const payload = {
      id: message.id,
      conversationId,
      isRecalled: true,
    };
    broadcastToConversation(userIds, conversationId, "chat:message-recalled", payload);
    broadcastToConversation(userIds, conversationId, "chat:conversation-updated", {
      conversationId,
      action: "message_recalled",
    });

    return payload;
  });
};

const messageService = {
  getMessagesService,
  sendMessageService,
  uploadAndSendMessageService,
  recallMessageService,
};

export default messageService;
