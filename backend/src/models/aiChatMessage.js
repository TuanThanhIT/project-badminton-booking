import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { AI_MESSAGE_ROLE } from "../constants/aiConstant.js";
import AiChatSession from "./aiChatSession.js";

const AiChatMessage = sequelize.define(
  "AiChatMessage",
  {
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: AiChatSession, key: "id" },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(AI_MESSAGE_ROLE)),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "AiChatMessages",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
  },
);

export default AiChatMessage;
