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
      allowNull: false,
      validate: {
        notNull: {
          msg: "Message body is required",
        },
        notEmpty: {
          msg: "Message body cannot be empty",
        },
        len: {
          args: [1, 5000],
          msg: "Message body must be between 1 and 5000 characters",
        },
      },
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
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default Message;
