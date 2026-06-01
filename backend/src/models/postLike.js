import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";
import Post from "./post.js";

const PostLike = sequelize.define(
  "PostLike",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: {
          msg: "User ID is required",
        },
        isInt: { msg: "User ID must be an integer" },
        min: {
          args: [1],
          msg: "User ID must be a positive number",
        },
      },
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Post, key: "id" },
      validate: {
        notNull: {
          msg: "Post ID required",
        },
        isInt: { msg: "Post ID must be an integer" },
        min: {
          args: [1],
          msg: "Post ID must be a positive number",
        },
      },
    },
  },
  {
    tableName: "PostLikes",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
      {
        unique: true,
        fields: ["userId", "postId"],
      },
    ],
  },
);

export default PostLike;
