import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { ROLE_CONVERSATION } from "../constants/messageConstant.js";
import Conversation from "./conversation.js";
import User from "./user.js";

const ConversationParticipant = sequelize.define(
  "ConversationParticipant",
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: {
          msg: "User ID is required",
        },
        isInt: {
          msg: "User ID must be an integer",
        },
        min: {
          args: [1],
          msg: "User ID must be a positive number",
        },
      },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(ROLE_CONVERSATION)),
      allowNull: false,
      defaultValue: ROLE_CONVERSATION.ADMIN,
      validate: {
        notNull: { msg: "Conversation role is required" },
        isIn: {
          args: [Object.values(ROLE_CONVERSATION)],
          msg: "Invalid role in conversation",
        },
      },
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          msg: "JoinedAt must be a valid date",
        },
      },
    },
    lastReadAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "LastReadAt must be a valid date",
        },
      },
    },
  },
  {
    tableName: "ConversationParticipants",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["conversationId", "userId"],
      },
    ],
  },
);

export default ConversationParticipant;
