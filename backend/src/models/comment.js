import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { COMMENT_TYPE } from "../constants/postConstant.js";
import User from "./user.js";
import Post from "./post.js";

const Comment = sequelize.define(
  "Comment",
  {
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Comments", key: "id" },
      validate: {
        isInt: {
          msg: "Parent ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Parent ID must be a positive number",
        },
      },
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: {
          msg: "Author ID is required",
        },
        isInt: { msg: "Author ID must be an integer" },
        min: {
          args: [1],
          msg: "Author ID must be a positive number",
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
        isInt: { msg: "Post ID must be an integer" },
        min: {
          args: [1],
          msg: "Post ID must be a positive number",
        },
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: "Comment content is required" },
        notEmpty: { msg: "Comment content cannot be empty" },
        len: {
          args: [1, 2000],
          msg: "Comment must be between 1 and 2000 characters",
        },
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(COMMENT_TYPE)),
      allowNull: false,
      defaultValue: COMMENT_TYPE.COMMENT,
      validate: {
        notNull: { msg: "Comment type is required" },
        isIn: {
          args: [Object.values(COMMENT_TYPE)],
          msg: "Invalid comment type",
        },
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Comments",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default Comment;
