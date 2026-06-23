import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import {
  MODERATION_LABEL,
  MODERATION_SOURCE,
  MODERATION_TARGET_TYPE,
  VIOLATION_ACTION,
} from "../constants/moderationConstant.js";
import Post from "./post.js";
import User from "./user.js";

const violationLabels = [
  MODERATION_LABEL.SPAM,
  MODERATION_LABEL.UNAUTHORIZED_AD,
  MODERATION_LABEL.OFFENSIVE,
];

const UserModerationViolation = sequelize.define(
  "UserModerationViolation",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Post, key: "id" },
    },
    targetType: {
      type: DataTypes.ENUM(...Object.values(MODERATION_TARGET_TYPE)),
      allowNull: false,
      defaultValue: MODERATION_TARGET_TYPE.POST,
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    label: {
      type: DataTypes.ENUM(...violationLabels),
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM(...Object.values(VIOLATION_ACTION)),
      allowNull: false,
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 1,
      },
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM(...Object.values(MODERATION_SOURCE)),
      allowNull: false,
      defaultValue: MODERATION_SOURCE.AI,
    },
  },
  {
    tableName: "UserModerationViolations",
    timestamps: true,
    indexes: [
      {
        fields: ["userId", "createdAt"],
        name: "idx_moderation_violations_user_created",
      },
      {
        fields: ["postId"],
        name: "idx_moderation_violations_post",
      },
      {
        fields: ["targetType", "targetId"],
        name: "idx_moderation_violations_target",
      },
    ],
  },
);

export default UserModerationViolation;
