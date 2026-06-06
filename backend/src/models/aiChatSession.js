import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { AI_CONTEXT } from "../constants/aiConstant.js";
import User from "./user.js";

const AiChatSession = sequelize.define(
  "AiChatSession",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: User, key: "id" },
    },
    guestToken: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    context: {
      type: DataTypes.ENUM(...Object.values(AI_CONTEXT)),
      allowNull: false,
      defaultValue: AI_CONTEXT.GENERAL,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    branchId: { type: DataTypes.INTEGER, allowNull: true },
    courtId: { type: DataTypes.INTEGER, allowNull: true },
    productId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "AiChatSessions",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default AiChatSession;
