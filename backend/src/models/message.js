import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { MESSAGE_TYPE } from "../constants/messageConstant.js";
import Conversation from "./conversation.js";
import User from "./user.js";

const Message = sequelize.define(
  "Message",
  {
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Conversation, key: "id" },
      validate: {
        notNull: {
          msg: "Conversation ID is required",
        },
        isInt: {
          msg: "Conversation ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Conversation ID must be a positive number",
        },
      },
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: {
          msg: "Sender ID is required",
        },
        isInt: {
          msg: "Sender ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Sender ID must be a positive number",
        },
      },
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "",
      validate: {
        len: {
          args: [0, 5000],
          msg: "Message body must be at most 5000 characters",
        },
      },
    },
    mediaUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    isRecalled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(MESSAGE_TYPE)),
      allowNull: false,
      defaultValue: MESSAGE_TYPE.TEXT,
      validate: {
        notNull: { msg: "Message type is required" },
        isIn: {
          args: [Object.values(MESSAGE_TYPE)],
          msg: "Invalid message type",
        },
      },
    },
    replyToId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Messages", key: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      validate: {
        isBoolean: {
          msg: "isRead must be a boolean",
        },
      },
    },
  },
  {
    tableName: "Messages",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default Message;
