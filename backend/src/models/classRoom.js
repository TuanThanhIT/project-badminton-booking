import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Post from "./post.js";
import User from "./user.js";
import Conversation from "./conversation.js";

const ClassRoom = sequelize.define(
  "ClassRoom",
  {
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: Post, key: "id" },
    },
    coachUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Conversation, key: "id" },
    },
    enrollmentStatus: {
      type: DataTypes.ENUM("OPEN", "LOCKED", "ENDED"),
      allowNull: false,
      defaultValue: "OPEN",
    },
  },
  {
    tableName: "ClassRooms",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default ClassRoom;
