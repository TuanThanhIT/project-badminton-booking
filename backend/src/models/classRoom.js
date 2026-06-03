import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Post from "./post.js";
import User from "./user.js";
import Conversation from "./conversation.js";
import { CLASS_ENROLLMENT_STATUS } from "../constants/classConstant.js";

const ClassRoom = sequelize.define(
  "ClassRoom",
  {
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: Post, key: "id" },
      validate: {
        notNull: {
          msg: "Post ID is required",
        },
        isInt: {
          msg: "Post ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Post ID must be a positive number",
        },
      },
    },
    coachUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: {
          msg: "Coach user ID is required",
        },
        isInt: {
          msg: "Coach user ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Coach user ID must be a positive number",
        },
      },
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Conversation, key: "id" },
      validate: {
        isInt: {
          msg: "Conversation ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Conversation ID must be a positive number",
        },
      },
    },
    enrollmentStatus: {
      type: DataTypes.ENUM(...Object.values(CLASS_ENROLLMENT_STATUS)),
      allowNull: false,
      defaultValue: CLASS_ENROLLMENT_STATUS.OPEN,
      validate: {
        notNull: {
          msg: "Enrollment status is required",
        },
        isIn: {
          args: [Object.values(CLASS_ENROLLMENT_STATUS)],
          msg: "Invalid enrollment status",
        },
      },
    },
  },
  {
    tableName: "ClassRooms",
    timestamps: true,
  },
);

export default ClassRoom;
