import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { POST_TYPE } from "../constants/postConstant.js";
import {
  MODERATION_ACTION,
  MODERATION_LABEL,
  POST_MODERATION_STATUS,
} from "../constants/moderationConstant.js";
import User from "./user.js";

const Post = sequelize.define(
  "Post",
  {
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: {
          msg: "Author ID is required",
        },
        isInt: {
          msg: "Author ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Author ID must be a positive number",
        },
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(POST_TYPE)),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Post type is required",
        },
        isIn: {
          args: [Object.values(POST_TYPE)],
          msg: "Invalid post type",
        },
      },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Title is required",
        },
        notEmpty: {
          msg: "Title cannot be empty",
        },
        len: {
          args: [3, 200],
          msg: "Title must be between 3 and 200 characters",
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
    formData: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidJSON(value) {
          if (value && typeof value !== "object") {
            throw new Error("FormData must be a valid JSON object");
          }
        },
      },
    },
    moderationStatus: {
      type: DataTypes.ENUM(...Object.values(POST_MODERATION_STATUS)),
      allowNull: false,
      defaultValue: POST_MODERATION_STATUS.PENDING,
    },
    moderationLabel: {
      type: DataTypes.ENUM(...Object.values(MODERATION_LABEL)),
      allowNull: true,
    },
    moderationConfidence: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 1,
      },
    },
    moderationAction: {
      type: DataTypes.ENUM(...Object.values(MODERATION_ACTION)),
      allowNull: true,
    },
    moderationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    moderationText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    moderatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    repostOfPostId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "repostOfPostId must be an integer" },
        min: { args: [1], msg: "repostOfPostId must be a positive number" },
      },
    },
    isRepost: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isBoolean: { msg: "isRepost must be a boolean" },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      validate: {
        isBoolean: {
          msg: "isActive must be a boolean",
        },
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      validate: {
        isBoolean: {
          msg: "isDeleted must be a boolean",
        },
      },
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "deletedAt must be a valid date",
        },
      },
    },
  },
  {
    tableName: "Posts",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
);

export default Post;
