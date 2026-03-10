import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { TARGET_FEEDBACK_TYPE } from "../constants/feedbackConstant.js";

const Feedback = sequelize.define(
  "Feedback",
  {
    targetFeedbackType: {
      type: DataTypes.ENUM(...Object.values(TARGET_FEEDBACK_TYPE)),
      allowNull: false,
      defaultValue: TARGET_FEEDBACK_TYPE.PRODUCT,
      validate: {
        notNull: { msg: "Target feedback type is required" },
        isIn: {
          args: [Object.values(TARGET_FEEDBACK_TYPE)],
          msg: "Invalid target feedback type",
        },
      },
    },
    targetFeedbackId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Target feedback ID is required",
        },
        isInt: {
          msg: "Target feedback ID must be an integer",
        },
        min: {
          args: [1],
          msg: "Target feedback ID must be a positive number",
        },
      },
    },
    content: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      validate: {
        notNull: { msg: "Content is required" },
        notEmpty: {
          msg: "Content must not be empty",
        },
        len: {
          args: [1, 1000],
          msg: "Content must be between 1 and 1000 characters",
        },
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "Rating is required" },
        isInt: {
          msg: "Rating must be an integer",
        },
        min: {
          args: [1],
          msg: "Rating must be at least 1",
        },
        max: {
          args: [5],
          msg: "Rating must be at most 5",
        },
      },
    },
  },
  {
    tableName: "ProductFeedbacks",
    timestamps: true,
    createdAt: "createdDate",
    updatedAt: "updatedDate",
  },
);
export default Feedback;
