import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import {
  COMMENT_REPORT_REASON,
  COMMENT_REPORT_STATUS,
} from "../constants/commentReportConstant.js";
import Comment from "./comment.js";
import User from "./user.js";

const CommentReport = sequelize.define(
  "CommentReport",
  {
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Comment, key: "id" },
      validate: {
        notNull: { msg: "Comment ID is required" },
        isInt: { msg: "Comment ID must be an integer" },
        min: { args: [1], msg: "Comment ID must be a positive number" },
      },
    },
    reporterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      validate: {
        notNull: { msg: "Reporter ID is required" },
        isInt: { msg: "Reporter ID must be an integer" },
        min: { args: [1], msg: "Reporter ID must be a positive number" },
      },
    },
    reason: {
      type: DataTypes.ENUM(...Object.values(COMMENT_REPORT_REASON)),
      allowNull: false,
      validate: {
        notNull: { msg: "Report reason is required" },
        isIn: {
          args: [Object.values(COMMENT_REPORT_REASON)],
          msg: "Invalid report reason",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(COMMENT_REPORT_STATUS)),
      allowNull: false,
      defaultValue: COMMENT_REPORT_STATUS.PENDING,
      validate: {
        isIn: {
          args: [Object.values(COMMENT_REPORT_STATUS)],
          msg: "Invalid report status",
        },
      },
    },
    handledBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: User, key: "id" },
    },
    handledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    adminNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "CommentReports",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["commentId", "reporterId"],
        name: "idx_comment_reports_comment_reporter",
      },
      {
        fields: ["commentId", "status"],
        name: "idx_comment_reports_comment_status",
      },
      {
        fields: ["reporterId"],
        name: "idx_comment_reports_reporter",
      },
    ],
  },
);

export default CommentReport;
