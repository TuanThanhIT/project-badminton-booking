import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { POST_TYPE } from "../constants/postConstant.js";
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
    courtFee: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      validate: {
        isFloat: {
          msg: "Court fee must be a number",
        },
        min: {
          args: [0],
          msg: "Court fee must be greater than or equal to 0",
        },
      },
    },
    referralFee: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        notNull: { msg: "Referral fee is required" },
        isFloat: {
          msg: "Referral fee must be a number",
        },
        min: {
          args: [0],
          msg: "Referral must be greater than or equal to 0",
        },
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
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);

export default Post;
