import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";
import Post from "./post.js";
import { POST_REACTION } from "../constants/postConstant.js";

const PostLike = sequelize.define(
  "PostLike",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
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
      primaryKey: true,
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
    reactionType: {
      type: DataTypes.ENUM(...Object.values(POST_REACTION)),
      allowNull: false,
      defaultValue: POST_REACTION.LIKE,
      validate: {
        isIn: {
          args: [Object.values(POST_REACTION)],
          msg: "Invalid reaction type",
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
