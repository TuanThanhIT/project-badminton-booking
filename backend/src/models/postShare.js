import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { SHARE_TYPE } from "../constants/postConstant.js";
import User from "./user.js";
import Post from "./post.js";

const PostShare = sequelize.define(
  "PostShare",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: {
          msg: "User ID is required",
        },
        isInt: { msg: "UserId must be an integer" },
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
          msg: "Post ID is required",
        },
        isInt: { msg: "PostId must be an integer" },
        min: {
          args: [1],
          msg: "Post ID must be a positive number",
        },
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: "Content must not exceed 2000 characters",
        },
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(SHARE_TYPE)),
      allowNull: false,
      defaultValue: SHARE_TYPE.SHARE,
      validate: {
        notNull: { msg: "Share type is required" },
        isIn: {
          args: [Object.values(SHARE_TYPE)],
          msg: "Invalid share type",
        },
      },
    },
  },
  {
    tableName: "PostShares",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default PostShare;
